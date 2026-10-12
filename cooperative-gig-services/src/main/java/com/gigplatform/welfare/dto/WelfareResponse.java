package com.gigplatform.welfare.dto;

import com.gigplatform.welfare.WelfareTransaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WelfareResponse(
        Long id,
        Long paymentId,
        Long jobId,
        Long workerId,
        BigDecimal contributionAmount,
        BigDecimal contributionPercentage,
        String transactionReference,
        LocalDateTime createdAt
) {
    public static WelfareResponse fromTransaction(WelfareTransaction transaction) {
        return new WelfareResponse(
                transaction.getId(),
                transaction.getPayment().getId(),
                transaction.getJob().getId(),
                transaction.getWorker().getId(),
                transaction.getContributionAmount(),
                transaction.getContributionPercentage(),
                transaction.getTransactionReference(),
                transaction.getCreatedAt()
        );
    }
}
