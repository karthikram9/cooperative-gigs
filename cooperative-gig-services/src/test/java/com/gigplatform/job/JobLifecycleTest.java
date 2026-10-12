package com.gigplatform.job;

import com.gigplatform.booking.Booking;
import com.gigplatform.booking.BookingRepository;
import com.gigplatform.booking.BookingStatus;
import com.gigplatform.exception.BadRequestException;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.AvailabilityStatus;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobLifecycleTest {

    @Mock
    private JobRepository jobRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private WorkerRepository workerRepository;
    @Mock
    private UserService userService;

    private JobService jobService;

    @BeforeEach
    void setUp() {
        jobService = new JobService(jobRepository, bookingRepository, workerRepository, userService);
    }

    @Test
    void testAcceptJobSuccess() {
        User workerUser = new User("Worker", "worker@test.com", "9000000001", "hash", UserRole.WORKER);
        workerUser.setId(2L);

        WorkerProfile profile = new WorkerProfile();
        ReflectionTestUtils.setField(profile, "id", 5L);
        profile.setUser(workerUser);
        profile.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);

        Booking booking = new Booking();
        ReflectionTestUtils.setField(booking, "id", 10L);
        booking.setStatus(BookingStatus.PENDING);

        Job job = new Job();
        ReflectionTestUtils.setField(job, "id", 20L);
        job.setBooking(booking);
        job.setWorker(profile);
        job.setStatus(JobStatus.ASSIGNED);

        when(userService.getUserByEmail("worker@test.com")).thenReturn(workerUser);
        when(workerRepository.findByUserId(2L)).thenReturn(Optional.of(profile));
        when(jobRepository.findDetailedById(20L)).thenReturn(Optional.of(job));
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = jobService.accept("worker@test.com", 20L);
        assertNotNull(response);
        assertEquals(JobStatus.ACCEPTED, job.getStatus());
        assertEquals(BookingStatus.ACCEPTED, booking.getStatus());
    }

    @Test
    void testInvalidTransitionThrowsException() {
        User workerUser = new User("Worker", "worker@test.com", "9000000001", "hash", UserRole.WORKER);
        workerUser.setId(2L);

        WorkerProfile profile = new WorkerProfile();
        ReflectionTestUtils.setField(profile, "id", 5L);
        profile.setUser(workerUser);
        profile.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);

        Booking booking = new Booking();
        ReflectionTestUtils.setField(booking, "id", 10L);

        Job job = new Job();
        ReflectionTestUtils.setField(job, "id", 20L);
        job.setBooking(booking);
        job.setWorker(profile);
        job.setStatus(JobStatus.COMPLETED);

        when(userService.getUserByEmail("worker@test.com")).thenReturn(workerUser);
        when(jobRepository.findDetailedById(20L)).thenReturn(Optional.of(job));

        assertThrows(BadRequestException.class, () -> jobService.complete("worker@test.com", 20L));
    }
}