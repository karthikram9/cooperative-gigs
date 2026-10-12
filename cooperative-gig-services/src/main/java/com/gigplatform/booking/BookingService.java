package com.gigplatform.booking;

import com.gigplatform.booking.dto.BookingRequest;
import com.gigplatform.booking.dto.BookingResponse;
import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import com.gigplatform.exception.UnauthorizedException;
import com.gigplatform.service.ServiceType;
import com.gigplatform.service.ServiceTypeRepository;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.AvailabilityStatus;
import com.gigplatform.worker.VerificationStatus;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import com.gigplatform.worker.WorkerSkill;
import com.gigplatform.job.Job;
import com.gigplatform.job.JobRepository;
import com.gigplatform.job.JobStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final UserService userService;
    private final WorkerRepository workerRepository;
    private final JobRepository jobRepository;

    public BookingService(
            BookingRepository bookingRepository,
            ServiceTypeRepository serviceTypeRepository,
            UserService userService,
            WorkerRepository workerRepository,
            JobRepository jobRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.serviceTypeRepository = serviceTypeRepository;
        this.userService = userService;
        this.workerRepository = workerRepository;
        this.jobRepository = jobRepository;
    }

    public BookingResponse create(String email, BookingRequest request) {
        User customer = getCustomer(email);
        ServiceType serviceType = getActiveService(request.serviceTypeId());
        validateScheduledDateTime(request.scheduledDateTime());

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setServiceType(serviceType);
        booking.setWorker(request.workerId() == null ? null : getAvailableWorker(request.workerId(), serviceType.getName()));
        booking.setDescription(request.description().trim());
        booking.setServiceAddress(request.serviceAddress().trim());
        booking.setScheduledDateTime(request.scheduledDateTime());
        booking.setServiceCity(trimToNull(request.city()));
        booking.setLatitude(request.latitude());
        booking.setLongitude(request.longitude());
        booking.setPrice(serviceType.getBasePrice());
        booking.setStatus(BookingStatus.PENDING);
        Booking saved = bookingRepository.save(booking);
        if (saved.getWorker() != null) {
            Job job = new Job();
            job.setBooking(saved);
            job.setWorker(saved.getWorker());
            job.setStatus(JobStatus.ASSIGNED);
            jobRepository.save(job);
        }
        return BookingResponse.fromBooking(saved);
    }

    @Transactional(readOnly = true)
    public BookingResponse getById(String email, Long bookingId) {
        User customer = getCustomer(email);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        verifyOwnership(booking, customer);
        return BookingResponse.fromBooking(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerBookings(String email) {
        User customer = getCustomer(email);
        return bookingRepository.findAllByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(BookingResponse::fromBooking)
                .toList();
    }

    public BookingResponse update(String email, Long bookingId, BookingRequest request) {
        User customer = getCustomer(email);
        Booking booking = getOwnedBooking(bookingId, customer);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be updated");
        }

        ServiceType serviceType = getActiveService(request.serviceTypeId());
        validateScheduledDateTime(request.scheduledDateTime());
        booking.setServiceType(serviceType);
        booking.setDescription(request.description().trim());
        booking.setServiceAddress(request.serviceAddress().trim());
        booking.setScheduledDateTime(request.scheduledDateTime());
        booking.setServiceCity(trimToNull(request.city()));
        booking.setLatitude(request.latitude());
        booking.setLongitude(request.longitude());
        return BookingResponse.fromBooking(bookingRepository.save(booking));
    }

    public BookingResponse cancel(String email, Long bookingId) {
        User customer = getCustomer(email);
        Booking booking = getOwnedBooking(bookingId, customer);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.fromBooking(bookingRepository.save(booking));
    }

    private User getCustomer(String email) {
        User user = userService.getUserByEmail(email);
        if (user.getRole() != UserRole.CUSTOMER) {
            throw new UnauthorizedException("Only customers can manage bookings");
        }
        return user;
    }

    private Booking getOwnedBooking(Long bookingId, User customer) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        verifyOwnership(booking, customer);
        return booking;
    }

    private void verifyOwnership(Booking booking, User customer) {
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to access this booking");
        }
    }

    private ServiceType getActiveService(Long serviceTypeId) {
        ServiceType serviceType = serviceTypeRepository.findById(serviceTypeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service not found with id: " + serviceTypeId
                ));
        if (!serviceType.isActive()) {
            throw new BadRequestException("Selected service is inactive");
        }
        return serviceType;
    }

    private void validateScheduledDateTime(LocalDateTime scheduledDateTime) {
        if (scheduledDateTime == null || !scheduledDateTime.isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Scheduled date and time must be in the future");
        }
    }

    private WorkerProfile getAvailableWorker(Long workerId, String serviceName) {
        WorkerProfile worker = workerRepository.findDetailedById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + workerId));
        if (worker.getUser().getRole() != UserRole.WORKER
                || worker.getUser().getStatus() != com.gigplatform.user.UserStatus.ACTIVE
                || worker.getAvailabilityStatus() != AvailabilityStatus.AVAILABLE
                || worker.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException("Selected worker is not available");
        }
        boolean matches = worker.getSkills().stream()
                .map(WorkerSkill::getSkillName)
                .anyMatch(skill -> skill.equalsIgnoreCase(serviceName));
        if (!matches) {
            throw new BadRequestException("Selected worker does not provide this service");
        }
        return worker;
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
