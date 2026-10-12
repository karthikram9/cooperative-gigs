package com.gigplatform.job.dto;

import com.gigplatform.job.JobStatus;
import jakarta.validation.constraints.NotNull;

public record JobStatusRequest(
        @NotNull(message = "Job status is required")
        JobStatus status
) {
}