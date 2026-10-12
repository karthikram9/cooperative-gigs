package com.gigplatform.admin.dto;

import com.gigplatform.worker.WorkerProfile;

public record WorkerLocationResponse(
        Long workerId,
        String name,
        String location,
        String accountStatus,
        String availabilityStatus
) {
    public static WorkerLocationResponse fromProfile(WorkerProfile profile) {
        return new WorkerLocationResponse(
                profile.getId(),
                profile.getUser().getName(),
                profile.getLocation(),
                profile.getUser().getStatus().name(),
                profile.getAvailabilityStatus().name()
        );
    }
}