package com.gigplatform.job.dto;

import com.gigplatform.job.Job;

import java.time.LocalDateTime;

public record JobResponse(
        Long id,
        Long bookingId,
        Long workerId,
        String status,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        LocalDateTime createdAt
) {
    public static JobResponse fromJob(Job job) {
        return new JobResponse(
                job.getId(),
                job.getBooking().getId(),
                job.getWorker().getId(),
                job.getStatus().name(),
                job.getStartedAt(),
                job.getCompletedAt(),
                job.getCreatedAt()
        );
    }
}