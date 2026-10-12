package com.gigplatform.job;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.serviceType", "worker", "worker.user"})
    Optional<Job> findDetailedById(Long id);

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.serviceType", "worker", "worker.user"})
    Optional<Job> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.serviceType", "worker", "worker.user"})
    List<Job> findByWorkerIdOrderByCreatedAtDesc(Long workerId);
}