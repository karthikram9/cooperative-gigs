package com.gigplatform.worker.dto;

import com.gigplatform.worker.WorkerProfile;

import java.util.List;

public record AvailableWorkerResponse(
        Long id,
        String name,
        List<String> skills,
        String location,
        String availabilityStatus
) {
    public static AvailableWorkerResponse fromProfile(WorkerProfile profile) {
        return new AvailableWorkerResponse(
                profile.getId(),
                profile.getUser().getName(),
                profile.getSkills().stream().map(skill -> skill.getSkillName()).toList(),
                profile.getLocation(),
                profile.getAvailabilityStatus().name()
        );
    }
}