package com.gigplatform.worker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record WorkerProfileRequest(
        @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
        String bio,

        @Size(max = 150, message = "Location cannot exceed 150 characters")
        String location,

        @Size(max = 500, message = "Address cannot exceed 500 characters")
        String address,

        @Min(value = 0, message = "Experience cannot be negative")
        @Max(value = 80, message = "Experience cannot exceed 80 years")
        Integer experienceYears,

        @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be greater than zero")
        BigDecimal hourlyRate
) {
}
