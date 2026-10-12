package com.gigplatform.booking.dto;

import com.gigplatform.booking.Booking;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public record BookingResponse(
        Long id,
        Long customerId,
        Long serviceTypeId,
        String serviceName,
        String description,
        String serviceAddress,
        String city,
        Double latitude,
        Double longitude,
        BigDecimal price,
        Long workerId,
        LocalDateTime scheduledDateTime,
        String status,
        LocalDateTime createdAt
) {
    public static BookingResponse fromBooking(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getCustomer().getId(),
                booking.getServiceType().getId(),
                booking.getServiceType().getName(),
                booking.getDescription(),
                booking.getServiceAddress(),
                booking.getServiceCity(),
                booking.getLatitude(),
                booking.getLongitude(),
                booking.getPrice(),
                booking.getWorker() == null ? null : booking.getWorker().getId(),
                booking.getScheduledDateTime(),
                booking.getStatus().name(),
                booking.getCreatedAt()
        );
    }
}
