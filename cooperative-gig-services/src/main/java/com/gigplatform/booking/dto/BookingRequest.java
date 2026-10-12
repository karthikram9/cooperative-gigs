package com.gigplatform.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record BookingRequest(
        @NotNull(message = "Service type is required")
        Long serviceTypeId,

        @NotBlank(message = "Booking description is required")
        @Size(max = 1000, message = "Booking description cannot exceed 1000 characters")
        String description,

        @NotBlank(message = "Service address is required")
        @Size(max = 500, message = "Service address cannot exceed 500 characters")
        String serviceAddress,

        @NotNull(message = "Scheduled date and time is required")
        @Future(message = "Scheduled date and time must be in the future")
        LocalDateTime scheduledDateTime,

        Long workerId,

        @Size(max = 150, message = "City cannot exceed 150 characters")
        String city,

        Double latitude,
        Double longitude
) {
}
