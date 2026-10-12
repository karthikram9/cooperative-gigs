package com.gigplatform.matching;

import com.gigplatform.booking.Booking;
import com.gigplatform.booking.BookingRepository;
import com.gigplatform.booking.BookingStatus;
import com.gigplatform.service.ServiceType;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private WorkerRepository workerRepository;
    @Mock
    private UserService userService;

    private MatchingService matchingService;

    @BeforeEach
    void setUp() {
        matchingService = new MatchingService(bookingRepository, workerRepository, userService);
    }

    @Test
    void testFindMatchesRanksBySkillAndLocation() {
        User customer = new User("Cust", "cust@test.com", "9876543210", "hash", UserRole.CUSTOMER);
        customer.setId(10L);

        ServiceType service = new ServiceType();
        service.setName("Plumbing");

        Booking booking = new Booking();
        ReflectionTestUtils.setField(booking, "id", 1L);
        booking.setCustomer(customer);
        booking.setServiceType(service);
        booking.setStatus(BookingStatus.PENDING);
        booking.setServiceAddress("Bhimavaram");

        when(userService.getUserByEmail("cust@test.com")).thenReturn(customer);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        // Worker 1: Expert in Plumbing (score 40), location Delhi (score 0) -> 40
        User u1 = new User("W1", "w1@test.com", "9000000001", "hash", UserRole.WORKER);
        WorkerProfile p1 = new WorkerProfile();
        ReflectionTestUtils.setField(p1, "id", 1L);
        p1.setUser(u1);
        p1.setLocation("Delhi");
        p1.setVerificationStatus(VerificationStatus.VERIFIED);
        p1.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        WorkerSkill s1 = new WorkerSkill();
        s1.setSkillName("Plumbing");
        s1.setSkillLevel(SkillLevel.EXPERT);
        p1.getSkills().add(s1);

        // Worker 2: Advanced in Plumbing (score 30), location Bhimavaram (exact match +20) -> 50
        User u2 = new User("W2", "w2@test.com", "9000000002", "hash", UserRole.WORKER);
        WorkerProfile p2 = new WorkerProfile();
        ReflectionTestUtils.setField(p2, "id", 2L);
        p2.setUser(u2);
        p2.setLocation("Bhimavaram");
        p2.setVerificationStatus(VerificationStatus.VERIFIED);
        p2.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        WorkerSkill s2 = new WorkerSkill();
        s2.setSkillName("Plumbing");
        s2.setSkillLevel(SkillLevel.ADVANCED);
        p2.getSkills().add(s2);

        when(workerRepository.findByVerificationStatusAndAvailabilityStatus(
                VerificationStatus.VERIFIED, AvailabilityStatus.AVAILABLE
        )).thenReturn(List.of(p1, p2));

        List<MatchResult> matches = matchingService.findMatches("cust@test.com", 1L);
        assertEquals(2, matches.size());
        assertEquals(2L, matches.get(0).workerId()); // Worker 2 has score 50, ranked first
        assertEquals(50, matches.get(0).score());
        assertEquals(1L, matches.get(1).workerId()); // Worker 1 has score 40
        assertEquals(40, matches.get(1).score());

        MatchResult best = matchingService.findBestMatch("cust@test.com", 1L);
        assertEquals(2L, best.workerId());
    }
}