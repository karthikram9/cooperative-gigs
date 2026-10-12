package com.gigplatform.worker.dto;

import com.gigplatform.worker.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;

public record AvailabilityRequest(
        @NotNull(message = "Availability status is required")
        AvailabilityStatus availabilityStatus
) {
}
