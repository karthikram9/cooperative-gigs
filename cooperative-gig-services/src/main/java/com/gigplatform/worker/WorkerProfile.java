package com.gigplatform.worker;

import com.gigplatform.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "worker_profiles", uniqueConstraints = @UniqueConstraint(
        name = "uk_worker_profile_user", columnNames = "user_id"
))
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 1000)
    private String bio;

    @Column(length = 150)
    private String location;

    @Column(length = 500)
    private String address;

    @Column(precision = 12, scale = 2)
    private BigDecimal hourlyRate;

    @Column(nullable = false)
    private Integer experienceYears;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "workerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkerSkill> skills = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }
        if (availabilityStatus == null) {
            availabilityStatus = AvailabilityStatus.AVAILABLE;
        }
        if (experienceYears == null) {
            experienceYears = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
    public AvailabilityStatus getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) { this.availabilityStatus = availabilityStatus; }
    public List<WorkerSkill> getSkills() { return skills; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
