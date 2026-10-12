package com.gigplatform.matching;

import com.gigplatform.booking.Booking;
import com.gigplatform.booking.BookingRepository;
import com.gigplatform.booking.BookingStatus;
import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import com.gigplatform.exception.UnauthorizedException;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.AvailabilityStatus;
import com.gigplatform.worker.SkillLevel;
import com.gigplatform.worker.VerificationStatus;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import com.gigplatform.worker.WorkerSkill;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class MatchingService {

    private final BookingRepository bookingRepository;
    private final WorkerRepository workerRepository;
    private final UserService userService;

    public MatchingService(
            BookingRepository bookingRepository,
            WorkerRepository workerRepository,
            UserService userService
    ) {
        this.bookingRepository = bookingRepository;
        this.workerRepository = workerRepository;
        this.userService = userService;
    }

    public List<MatchResult> findMatches(String email, Long bookingId) {
        User user = userService.getUserByEmail(email);
        Booking booking = getAuthorizedBooking(user, bookingId);
        validateBookingForMatching(booking);

        String requestedService = normalize(booking.getServiceType().getName());
        return workerRepository.findByVerificationStatusAndAvailabilityStatus(
                        VerificationStatus.VERIFIED,
                        AvailabilityStatus.AVAILABLE
                ).stream()
                .map(worker -> createMatch(worker, requestedService, booking.getServiceAddress()))
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparingInt(MatchResult::score).reversed())
                .toList();
    }

    public MatchResult findBestMatch(String email, Long bookingId) {
        return findMatches(email, bookingId).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No suitable worker found for this booking"
                ));
    }

    private MatchResult createMatch(
            WorkerProfile worker,
            String requestedService,
            String bookingAddress
    ) {
        WorkerSkill matchedSkill = worker.getSkills().stream()
                .filter(skill -> normalize(skill.getSkillName()).equals(requestedService))
                .max(Comparator.comparingInt(skill -> skillScore(skill.getSkillLevel())))
                .orElse(null);

        if (matchedSkill == null) {
            return null;
        }

        int score = skillScore(matchedSkill.getSkillLevel())
                + locationScore(bookingAddress, worker);
        return new MatchResult(
                worker.getId(),
                worker.getUser().getName(),
                matchedSkill.getSkillName(),
                matchedSkill.getSkillLevel().name(),
                worker.getVerificationStatus().name(),
                worker.getAvailabilityStatus().name(),
                score,
                workerLocation(worker)
        );
    }

    private int skillScore(SkillLevel skillLevel) {
        return switch (skillLevel) {
            case EXPERT -> 40;
            case ADVANCED -> 30;
            case INTERMEDIATE -> 20;
            case BEGINNER -> 10;
        };
    }

    private int locationScore(String bookingAddress, WorkerProfile worker) {
        String requested = normalize(bookingAddress);
        String workerLocation = normalize(workerLocation(worker));
        if (requested.isEmpty() || workerLocation.isEmpty()) {
            return 0;
        }
        if (requested.equals(workerLocation)) {
            return 20;
        }
        if (requested.contains(workerLocation) || workerLocation.contains(requested)) {
            return 10;
        }
        return 0;
    }

    private String workerLocation(WorkerProfile worker) {
        if (worker.getLocation() != null && !worker.getLocation().isBlank()) {
            return worker.getLocation();
        }
        return worker.getAddress();
    }

    private Booking getAuthorizedBooking(User user, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        if (user.getRole() != UserRole.ADMIN
                && !booking.getCustomer().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to match this booking");
        }
        return booking;
    }

    private void validateBookingForMatching(Booking booking) {
        if (booking.getServiceType() == null) {
            throw new BadRequestException("Booking has no requested service");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Booking cannot be matched in its current state");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
