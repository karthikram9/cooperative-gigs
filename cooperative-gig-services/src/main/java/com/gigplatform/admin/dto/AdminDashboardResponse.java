package com.gigplatform.admin.dto;

import java.math.BigDecimal;

public record AdminDashboardResponse(
        long totalWorkers,
        long activeWorkers,
        long availableWorkers,
        long todaysJobs,
        BigDecimal totalEarnings,
        BigDecimal welfareFund
) {
}