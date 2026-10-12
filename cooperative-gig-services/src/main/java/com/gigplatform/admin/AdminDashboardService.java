package com.gigplatform.admin;

import com.gigplatform.admin.dto.AdminBookingResponse;
import com.gigplatform.admin.dto.AdminDashboardResponse;
import com.gigplatform.admin.dto.AdminWorkerDetailsResponse;
import com.gigplatform.admin.dto.DemandResponse;
import com.gigplatform.admin.dto.WorkerLocationResponse;
import com.gigplatform.booking.Booking;
import com.gigplatform.booking.BookingRepository;
import com.gigplatform.job.Job;
import com.gigplatform.job.JobRepository;
import com.gigplatform.job.JobStatus;
import com.gigplatform.payment.PaymentLedger;
import com.gigplatform.payment.PaymentRepository;
import com.gigplatform.payment.PaymentStatus;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserStatus;
import com.gigplatform.welfare.WelfareRepository;
import com.gigplatform.worker.AvailabilityStatus;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final WorkerRepository workerRepository;
    private final BookingRepository bookingRepository;
    private final JobRepository jobRepository;
    private final PaymentRepository paymentRepository;
    private final WelfareRepository welfareRepository;

    public AdminDashboardService(
            WorkerRepository workerRepository,
            BookingRepository bookingRepository,
            JobRepository jobRepository,
            PaymentRepository paymentRepository,
            WelfareRepository welfareRepository
    ) {
        this.workerRepository = workerRepository;
        this.bookingRepository = bookingRepository;
        this.jobRepository = jobRepository;
        this.paymentRepository = paymentRepository;
        this.welfareRepository = welfareRepository;
    }

    public AdminDashboardResponse dashboard() {
        List<WorkerProfile> workers = workers();
        LocalDate today = LocalDate.now();
        long todaysJobs = bookingRepository.findAll().stream()
                .filter(booking -> booking.getScheduledDateTime().toLocalDate().equals(today))
                .count();
        BigDecimal earnings = payments().stream()
                .filter(payment -> payment.getPaymentStatus() == PaymentStatus.SUCCESS)
                .map(PaymentLedger::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal welfare = welfareRepository.findAll().stream()
                .map(transaction -> transaction.getContributionAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminDashboardResponse(
                workers.size(),
                workers.stream().filter(worker -> worker.getUser().getStatus() == UserStatus.ACTIVE).count(),
                workers.stream().filter(worker -> worker.getUser().getStatus() == UserStatus.ACTIVE
                        && worker.getAvailabilityStatus() == AvailabilityStatus.AVAILABLE).count(),
                todaysJobs,
                earnings,
                welfare
        );
    }

    public List<DemandResponse> demand() {
        return bookingRepository.findAll().stream()
                .collect(Collectors.groupingBy(booking -> booking.getServiceType().getName(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new DemandResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    public List<AdminBookingResponse> bookings() {
        return bookingRepository.findAll().stream()
                .map(AdminBookingResponse::fromBooking)
                .toList();
    }

    public AdminBookingResponse booking(Long bookingId) {
        return AdminBookingResponse.fromBooking(bookingRepository.findById(bookingId)
                .orElseThrow(() -> new com.gigplatform.exception.ResourceNotFoundException(
                        "Booking not found with id: " + bookingId)));
    }

    public AdminWorkerDetailsResponse workerDetails(Long workerId) {
        WorkerProfile worker = workerRepository.findDetailedById(workerId)
                .orElseThrow(() -> new com.gigplatform.exception.ResourceNotFoundException(
                        "Worker profile not found with id: " + workerId));
        List<Job> jobs = jobRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);
        BigDecimal earnings = jobs.stream()
                .filter(job -> job.getStatus() == JobStatus.COMPLETED)
                .map(job -> job.getBooking().getPrice() == null ? BigDecimal.ZERO : job.getBooking().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long currentJobs = jobs.stream()
                .filter(job -> job.getStatus() == JobStatus.ACCEPTED || job.getStatus() == JobStatus.IN_PROGRESS)
                .count();
        long completedJobs = jobs.stream().filter(job -> job.getStatus() == JobStatus.COMPLETED).count();
        return new AdminWorkerDetailsResponse(
                com.gigplatform.admin.dto.WorkerAdminResponse.fromProfile(worker),
                currentJobs,
                completedJobs,
                earnings
        );
    }

    public List<WorkerLocationResponse> locations() {
        return workers().stream().map(WorkerLocationResponse::fromProfile).toList();
    }

    private List<WorkerProfile> workers() {
        return workerRepository.findAllByOrderByIdAsc().stream()
                .filter(worker -> worker.getUser().getRole() == UserRole.WORKER)
                .toList();
    }

    private List<PaymentLedger> payments() {
        return paymentRepository.findAll();
    }
}