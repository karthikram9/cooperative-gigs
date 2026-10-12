package com.gigplatform.worker.dto;

import com.gigplatform.worker.SkillLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SkillRequest(
        @NotBlank(message = "Skill name is required")
        @Size(max = 100, message = "Skill name cannot exceed 100 characters")
        String skillName,

        @NotNull(message = "Skill level is required")
        SkillLevel skillLevel
) {
}
