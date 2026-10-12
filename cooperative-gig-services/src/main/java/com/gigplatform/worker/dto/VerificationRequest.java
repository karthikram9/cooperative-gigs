package com.gigplatform.worker.dto;

import com.gigplatform.worker.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public record VerificationRequest(
        @NotNull(message = "Verification status is required")
        VerificationStatus status
) {
}
