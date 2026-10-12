package com.gigplatform.worker;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import com.gigplatform.user.UserRole;
import org.springframework.data.jpa.repository.Query;

public interface WorkerRepository extends JpaRepository<WorkerProfile, Long> {

    @EntityGraph(attributePaths = {"user", "skills"})
    Optional<WorkerProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "skills"})
    List<WorkerProfile> findByVerificationStatusAndAvailabilityStatus(
            VerificationStatus verificationStatus,
            AvailabilityStatus availabilityStatus
    );

    @EntityGraph(attributePaths = {"user", "skills"})
    Optional<WorkerProfile> findDetailedById(Long id);

    @EntityGraph(attributePaths = {"user", "skills"})
    List<WorkerProfile> findAllByOrderByIdAsc();

        @EntityGraph(attributePaths = {"user", "skills"})
        @Query("select distinct worker from WorkerProfile worker join worker.user user "
            + "where user.role = :role and user.status = com.gigplatform.user.UserStatus.ACTIVE "
            + "and worker.availabilityStatus = :availabilityStatus "
            + "and worker.verificationStatus = :verificationStatus")
        List<WorkerProfile> findAvailableWorkers(
            UserRole role,
            AvailabilityStatus availabilityStatus,
            VerificationStatus verificationStatus
        );
}
