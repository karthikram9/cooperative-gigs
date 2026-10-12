package com.gigplatform.admin.dto;

import java.math.BigDecimal;

public record AdminWorkerDetailsResponse(
        WorkerAdminResponse worker,
        long currentJobs,
        long completedJobs,
        BigDecimal earnings
) {
}