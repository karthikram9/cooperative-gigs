package com.gigplatform.matching;

public record MatchResult(
        Long workerId,
        String workerName,
        String matchedSkill,
        String skillLevel,
        String verificationStatus,
        String availabilityStatus,
        int score,
        String location
) {
}
