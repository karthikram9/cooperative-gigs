package com.gigplatform.payment;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentLedger, Long> {

    @EntityGraph(attributePaths = {"job", "job.worker", "job.worker.user", "booking", "booking.customer"})
    Optional<PaymentLedger> findDetailedById(Long id);

    @EntityGraph(attributePaths = {"job", "job.worker", "job.worker.user", "booking", "booking.customer"})
    Optional<PaymentLedger> findByJobId(Long jobId);

    Optional<PaymentLedger> findByBookingId(Long bookingId);

    Optional<PaymentLedger> findByTransactionReference(String transactionReference);

    List<PaymentLedger> findByPaymentStatus(PaymentStatus paymentStatus);

    @EntityGraph(attributePaths = {"job", "job.worker", "job.worker.user", "booking", "booking.customer"})
    List<PaymentLedger> findAllByBookingCustomerIdOrderByCreatedAtDesc(Long customerId);
}
