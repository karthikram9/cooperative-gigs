package com.gigplatform.admin.dto;

import com.gigplatform.booking.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminBookingResponse(
        Long bookingId,
        Long customerId,
        String customerName,
        Long workerId,
        String workerName,
        String service,
        String location,
        String city,
        BigDecimal price,
        String status,
        LocalDateTime scheduledDateTime,
        LocalDateTime createdAt
) {
    public static AdminBookingResponse fromBooking(Booking booking) {
        return new AdminBookingResponse(
                booking.getId(),
                booking.getCustomer().getId(),
                booking.getCustomer().getName(),
                booking.getWorker() == null ? null : booking.getWorker().getId(),
                booking.getWorker() == null ? null : booking.getWorker().getUser().getName(),
                booking.getServiceType().getName(),
                booking.getServiceAddress(),
                booking.getServiceCity(),
                booking.getPrice(),
                booking.getStatus().name(),
                booking.getScheduledDateTime(),
                booking.getCreatedAt()
        );
    }
}