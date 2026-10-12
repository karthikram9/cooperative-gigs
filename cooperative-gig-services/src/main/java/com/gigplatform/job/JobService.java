package com.gigplatform.job;

import com.gigplatform.booking.Booking;
import com.gigplatform.booking.BookingRepository;
import com.gigplatform.booking.BookingStatus;
import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import com.gigplatform.exception.UnauthorizedException;
import com.gigplatform.job.dto.JobResponse;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import com.gigplatform.worker.AvailabilityStatus;
import com.gigplatform.worker.dto.WorkerEarningsResponse;
import com.gigplatform.worker.dto.WorkerJobResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;

@Service
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final BookingRepository bookingRepository;
    private final WorkerRepository workerRepository;
    private final UserService userService;

    public JobService(
            JobRepository jobRepository,
            BookingRepository bookingRepository,
            WorkerRepository workerRepository,
            UserService userService
    ) {
        this.jobRepository = jobRepository;
        this.bookingRepository = bookingRepository;
        this.workerRepository = workerRepository;
        this.userService = userService;
    }

    public JobResponse create(String creatorEmail, Long bookingId, Long workerId) {
        requireAdmin(creatorEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        WorkerProfile worker = workerRepository.findDetailedById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + workerId));

        if (worker.getUser().getRole() != UserRole.WORKER) {
            throw new BadRequestException("Selected user is not a worker");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Booking cannot be assigned to a job in its current state");
        }
        if (jobRepository.existsByBookingId(bookingId)) {
            throw new BadRequestException("A job already exists for this booking");
        }

        Job job = new Job();
        job.setBooking(booking);
        job.setWorker(worker);
        job.setStatus(JobStatus.ASSIGNED);
        return JobResponse.fromJob(jobRepository.save(job));
    }

    @Transactional(readOnly = true)
    public JobResponse getById(String email, Long jobId) {
        User user = userService.getUserByEmail(email);
        Job job = getJob(jobId);
        verifyCanView(user, job);
        return JobResponse.fromJob(job);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(String email) {
        User user = getWorkerUser(email);
        WorkerProfile worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
        return jobRepository.findByWorkerIdOrderByCreatedAtDesc(worker.getId())
                .stream()
                .map(JobResponse::fromJob)
                .toList();
    }

        @Transactional(readOnly = true)
        public List<WorkerJobResponse> getNewWorkerJobs(String email) {
        return getWorkerJobs(email).stream()
            .filter(job -> job.getStatus() == JobStatus.ASSIGNED
                && job.getBooking().getStatus() == BookingStatus.PENDING)
            .map(WorkerJobResponse::fromJob)
            .toList();
        }

        @Transactional(readOnly = true)
        public List<WorkerJobResponse> getActiveWorkerJobs(String email) {
        return getWorkerJobs(email).stream()
            .filter(job -> job.getStatus() == JobStatus.ACCEPTED
                || job.getStatus() == JobStatus.IN_PROGRESS)
            .map(WorkerJobResponse::fromJob)
            .toList();
        }

        @Transactional(readOnly = true)
        public List<WorkerJobResponse> getCompletedWorkerJobs(String email) {
        return getWorkerJobs(email).stream()
            .filter(job -> job.getStatus() == JobStatus.COMPLETED)
            .map(WorkerJobResponse::fromJob)
            .toList();
        }

        @Transactional(readOnly = true)
        public WorkerJobResponse getWorkerJob(String email, Long jobId) {
        return WorkerJobResponse.fromJob(getOwnedWorkerJob(email, jobId));
        }

        @Transactional(readOnly = true)
        public WorkerEarningsResponse getWorkerEarnings(String email) {
        List<Job> completed = getWorkerJobs(email).stream()
            .filter(job -> job.getStatus() == JobStatus.COMPLETED)
            .toList();
        BigDecimal total = completed.stream()
            .map(job -> job.getBooking().getPrice() == null
                ? BigDecimal.ZERO : job.getBooking().getPrice())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new WorkerEarningsResponse(total, completed.size());
        }

    public JobResponse accept(String email, Long jobId) {
        requireAvailableWorker(email);
        Job job = getOwnedWorkerJob(email, jobId);
        if (job.getBooking().getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be accepted");
        }
        transition(job, JobStatus.ACCEPTED);
        job.getBooking().setStatus(BookingStatus.ACCEPTED);
        return save(job);
    }

    public JobResponse start(String email, Long jobId) {
        Job job = getOwnedWorkerJob(email, jobId);
        transition(job, JobStatus.IN_PROGRESS);
        job.setStartedAt(LocalDateTime.now());
        job.getBooking().setStatus(BookingStatus.IN_PROGRESS);
        return save(job);
    }

    public JobResponse complete(String email, Long jobId) {
        Job job = getOwnedWorkerJob(email, jobId);
        transition(job, JobStatus.COMPLETED);
        job.setCompletedAt(LocalDateTime.now());
        job.getBooking().setStatus(BookingStatus.COMPLETED);
        return save(job);
    }

    public JobResponse cancel(String email, Long jobId) {
        User user = userService.getUserByEmail(email);
        Job job = getJob(jobId);
        verifyCanView(user, job);
        transition(job, JobStatus.CANCELLED);
        return save(job);
    }

    private JobResponse save(Job job) {
        return JobResponse.fromJob(jobRepository.save(job));
    }

    private Job getJob(Long jobId) {
        return jobRepository.findDetailedById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
    }

    private Job getOwnedWorkerJob(String email, Long jobId) {
        User user = getWorkerUser(email);
        Job job = getJob(jobId);
        if (!job.getWorker().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to manage this job");
        }
        return job;
    }

    private List<Job> getWorkerJobs(String email) {
        User user = getWorkerUser(email);
        WorkerProfile worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
        return jobRepository.findByWorkerIdOrderByCreatedAtDesc(worker.getId());
    }

    private void requireAvailableWorker(String email) {
        User user = getWorkerUser(email);
        WorkerProfile worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
        if (worker.getAvailabilityStatus() != AvailabilityStatus.AVAILABLE) {
            throw new BadRequestException("Worker is unavailable for new jobs");
        }
    }

    private void verifyCanView(User user, Job job) {
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        boolean isCustomer = user.getId().equals(job.getBooking().getCustomer().getId());
        boolean isWorker = user.getId().equals(job.getWorker().getUser().getId());
        if (!isAdmin && !isCustomer && !isWorker) {
            throw new UnauthorizedException("You are not authorized to access this job");
        }
    }

    private void transition(Job job, JobStatus targetStatus) {
        boolean valid = switch (job.getStatus()) {
            case ASSIGNED -> targetStatus == JobStatus.ACCEPTED || targetStatus == JobStatus.CANCELLED;
            case ACCEPTED -> targetStatus == JobStatus.IN_PROGRESS || targetStatus == JobStatus.CANCELLED;
            case IN_PROGRESS -> targetStatus == JobStatus.COMPLETED || targetStatus == JobStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };
        if (!valid) {
            throw new BadRequestException(
                    "Invalid job status transition from " + job.getStatus() + " to " + targetStatus
            );
        }
        job.setStatus(targetStatus);
    }

    private User getWorkerUser(String email) {
        User user = userService.getUserByEmail(email);
        if (user.getRole() != UserRole.WORKER) {
            throw new UnauthorizedException("Only workers can perform this job operation");
        }
        return user;
    }

    private void requireAdmin(String email) {
        User user = userService.getUserByEmail(email);
        if (user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only administrators can assign jobs");
        }
    }
}
