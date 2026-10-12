package com.gigplatform.matching;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<List<MatchResult>> findMatches(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        return ResponseEntity.ok(matchingService.findMatches(authentication.getName(), bookingId));
    }

    @GetMapping("/bookings/{bookingId}/best")
    public ResponseEntity<MatchResult> findBestMatch(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        return ResponseEntity.ok(matchingService.findBestMatch(authentication.getName(), bookingId));
    }
}
