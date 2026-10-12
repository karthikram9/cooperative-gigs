package com.gigplatform.rating.dto;

import com.gigplatform.rating.Rating;

import java.time.LocalDateTime;

public record RatingResponse(
        Long id,
        Long jobId,
        Long bookingId,
        Long customerId,
        Long workerId,
        Integer rating,
        String review,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static RatingResponse fromRating(Rating rating) {
        return new RatingResponse(
                rating.getId(),
                rating.getJob().getId(),
                rating.getBooking().getId(),
                rating.getCustomer().getId(),
                rating.getWorker().getId(),
                rating.getRating(),
                rating.getReview(),
                rating.getCreatedAt(),
                rating.getUpdatedAt()
        );
    }
}
