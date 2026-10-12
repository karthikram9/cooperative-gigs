package com.gigplatform.worker;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "worker_skills", uniqueConstraints = @UniqueConstraint(
        name = "uk_worker_skill_name", columnNames = {"worker_profile_id", "skill_name"}
))
public class WorkerSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "worker_profile_id", nullable = false)
    private WorkerProfile workerProfile;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SkillLevel skillLevel;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public WorkerProfile getWorkerProfile() { return workerProfile; }
    public void setWorkerProfile(WorkerProfile workerProfile) { this.workerProfile = workerProfile; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public SkillLevel getSkillLevel() { return skillLevel; }
    public void setSkillLevel(SkillLevel skillLevel) { this.skillLevel = skillLevel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
