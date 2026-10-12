package com.gigplatform.welfare.dto;

import java.math.BigDecimal;

public record WelfareSummaryResponse(
        BigDecimal totalContributions,
        long transactionCount
) {
}
