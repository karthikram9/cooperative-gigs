package com.gigplatform.payment.dto;

import com.gigplatform.payment.PaymentLedger;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long jobId,
        Long bookingId,
        BigDecimal amount,
        String paymentStatus,
        String paymentMethod,
        String transactionReference,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PaymentResponse fromPayment(PaymentLedger payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getJob().getId(),
                payment.getBooking().getId(),
                payment.getAmount(),
                payment.getPaymentStatus().name(),
                payment.getPaymentMethod(),
                payment.getTransactionReference(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
}
