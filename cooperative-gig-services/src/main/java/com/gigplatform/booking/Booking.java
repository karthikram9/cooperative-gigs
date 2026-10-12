package com.gigplatform.booking;

import com.gigplatform.service.ServiceType;
import com.gigplatform.user.User;
import com.gigplatform.worker.WorkerProfile;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private WorkerProfile worker;

    @NotBlank(message = "Booking description is required")
    @Size(max = 1000, message = "Booking description cannot exceed 1000 characters")
    @Column(nullable = false, length = 1000)
    private String description;

    @NotBlank(message = "Service address is required")
    @Size(max = 500, message = "Service address cannot exceed 500 characters")
    @Column(nullable = false, length = 500)
    private String serviceAddress;

    @NotNull(message = "Scheduled date and time is required")
    @Column(nullable = false)
    private LocalDateTime scheduledDateTime;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 150)
    private String serviceCity;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = BookingStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    public WorkerProfile getWorker() { return worker; }
    public void setWorker(WorkerProfile worker) { this.worker = worker; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getServiceAddress() { return serviceAddress; }
    public void setServiceAddress(String serviceAddress) { this.serviceAddress = serviceAddress; }
    public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
    public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getServiceCity() { return serviceCity; }
    public void setServiceCity(String serviceCity) { this.serviceCity = serviceCity; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
