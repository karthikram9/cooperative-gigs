package com.gigplatform.welfare;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WelfareRepository extends JpaRepository<WelfareTransaction, Long> {

    @EntityGraph(attributePaths = {"payment", "job", "job.worker", "job.worker.user"})
    Optional<WelfareTransaction> findDetailedById(Long id);

    @EntityGraph(attributePaths = {"payment", "job", "job.worker", "job.worker.user"})
    Optional<WelfareTransaction> findByPaymentId(Long paymentId);

    @EntityGraph(attributePaths = {"payment", "job", "job.worker", "job.worker.user"})
    List<WelfareTransaction> findByWorkerIdOrderByCreatedAtDesc(Long workerId);

    boolean existsByPaymentId(Long paymentId);

    Optional<WelfareTransaction> findByTransactionReference(String transactionReference);
}
