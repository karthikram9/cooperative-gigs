package com.gigplatform.rating;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    @EntityGraph(attributePaths = {"job", "booking", "customer", "worker", "worker.user"})
    Optional<Rating> findDetailedById(Long id);

    Optional<Rating> findByJobId(Long jobId);

    Optional<Rating> findByBookingId(Long bookingId);

    List<Rating> findByCustomerId(Long customerId);

    @EntityGraph(attributePaths = {"job", "booking", "customer", "worker", "worker.user"})
    List<Rating> findAllByWorkerIdOrderByCreatedAtDesc(Long workerId);

    boolean existsByJobId(Long jobId);
}
