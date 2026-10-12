package com.gigplatform.welfare;

import com.gigplatform.job.Job;
import com.gigplatform.payment.PaymentLedger;
import com.gigplatform.worker.WorkerProfile;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "welfare_transactions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_welfare_payment", columnNames = "payment_id"),
        @UniqueConstraint(name = "uk_welfare_reference", columnNames = "transaction_reference")
})
public class WelfareTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private PaymentLedger payment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile worker;

    @NotNull(message = "Contribution amount is required")
    @DecimalMin(value = "0.01", message = "Contribution amount must be greater than zero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal contributionAmount;

    @NotNull(message = "Contribution percentage is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Contribution percentage must be greater than zero")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal contributionPercentage;

    @Column(name = "transaction_reference", nullable = false, unique = true, length = 80)
    private String transactionReference;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public PaymentLedger getPayment() { return payment; }
    public void setPayment(PaymentLedger payment) { this.payment = payment; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public WorkerProfile getWorker() { return worker; }
    public void setWorker(WorkerProfile worker) { this.worker = worker; }
    public BigDecimal getContributionAmount() { return contributionAmount; }
    public void setContributionAmount(BigDecimal contributionAmount) { this.contributionAmount = contributionAmount; }
    public BigDecimal getContributionPercentage() { return contributionPercentage; }
    public void setContributionPercentage(BigDecimal contributionPercentage) { this.contributionPercentage = contributionPercentage; }
    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
