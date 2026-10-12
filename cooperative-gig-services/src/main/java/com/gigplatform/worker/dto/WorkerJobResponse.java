package com.gigplatform.worker.dto;

import com.gigplatform.job.Job;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WorkerJobResponse(
        Long jobId,
        Long bookingId,
        String service,
        String location,
        String city,
        Double latitude,
        Double longitude,
        BigDecimal price,
        LocalDateTime scheduledDateTime,
        String status
) {
    public static WorkerJobResponse fromJob(Job job) {
        return new WorkerJobResponse(
                job.getId(),
                job.getBooking().getId(),
                job.getBooking().getServiceType().getName(),
                job.getBooking().getServiceAddress(),
                job.getBooking().getServiceCity(),
                job.getBooking().getLatitude(),
                job.getBooking().getLongitude(),
                job.getBooking().getPrice(),
                job.getBooking().getScheduledDateTime(),
                job.getStatus().name()
        );
    }
}