package com.gigplatform.rating;

import com.gigplatform.rating.dto.RatingRequest;
import com.gigplatform.rating.dto.RatingResponse;
import com.gigplatform.rating.dto.RatingSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    public ResponseEntity<RatingResponse> create(
            Authentication authentication,
            @Valid @RequestBody RatingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ratingService.create(authentication.getName(), request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> getById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ratingService.getById(authentication.getName(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatingResponse> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody RatingRequest request
    ) {
        return ResponseEntity.ok(ratingService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable Long id
    ) {
        ratingService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<RatingResponse>> getWorkerRatings(@PathVariable Long workerId) {
        return ResponseEntity.ok(ratingService.getWorkerRatings(workerId));
    }

    @GetMapping("/worker/{workerId}/summary")
    public ResponseEntity<RatingSummaryResponse> getWorkerSummary(@PathVariable Long workerId) {
        return ResponseEntity.ok(ratingService.getWorkerSummary(workerId));
    }
}
