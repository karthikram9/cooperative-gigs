package com.gigplatform.booking;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"customer", "serviceType", "worker", "worker.user"})
    Optional<Booking> findByIdAndCustomerId(Long id, Long customerId);

    @EntityGraph(attributePaths = {"customer", "serviceType", "worker", "worker.user"})
    List<Booking> findAllByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Booking> findByStatus(BookingStatus status);
}
