package com.gigplatform.worker.dto;

import java.math.BigDecimal;

public record WorkerEarningsResponse(
        BigDecimal totalEarnings,
        long completedJobs
) {
}