package com.gigplatform.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PaymentRequest(
        @NotNull(message = "Job is required")
        Long jobId,

        @NotNull(message = "Payment amount is required")
        @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
        BigDecimal amount,

        @NotBlank(message = "Payment method is required")
        @Size(max = 50, message = "Payment method cannot exceed 50 characters")
        String paymentMethod
) {
}
