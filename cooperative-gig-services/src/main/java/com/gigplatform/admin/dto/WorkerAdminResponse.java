package com.gigplatform.admin.dto;

import com.gigplatform.worker.WorkerProfile;

import java.util.List;

public record WorkerAdminResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String phone,
        String role,
        String status,
        String location,
        List<String> skills
) {
    public static WorkerAdminResponse fromProfile(WorkerProfile profile) {
        return new WorkerAdminResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhone(),
                profile.getUser().getRole().name(),
                profile.getUser().getStatus().name(),
                profile.getLocation(),
                profile.getSkills().stream().map(skill -> skill.getSkillName()).toList()
        );
    }
}