package com.gigplatform.rating.dto;

import java.math.BigDecimal;

public record RatingSummaryResponse(
        Long workerId,
        BigDecimal averageRating,
        long totalRatings
) {
}
