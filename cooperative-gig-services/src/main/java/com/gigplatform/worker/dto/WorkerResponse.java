package com.gigplatform.worker.dto;

import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerSkill;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record WorkerResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String phone,
        String bio,
        String location,
        String address,
        Integer experienceYears,
        BigDecimal hourlyRate,
        String verificationStatus,
        String availabilityStatus,
        List<SkillResponse> skills,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static WorkerResponse fromProfile(WorkerProfile profile) {
        return new WorkerResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhone(),
                profile.getBio(),
                profile.getLocation(),
                profile.getAddress(),
                profile.getExperienceYears(),
                profile.getHourlyRate(),
                profile.getVerificationStatus().name(),
                profile.getAvailabilityStatus().name(),
                profile.getSkills().stream().map(SkillResponse::fromSkill).toList(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    public record SkillResponse(Long id, String skillName, String skillLevel) {
        private static SkillResponse fromSkill(WorkerSkill skill) {
            return new SkillResponse(skill.getId(), skill.getSkillName(), skill.getSkillLevel().name());
        }
    }
}
