package com.gigplatform.admin.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateWorkerRequest(
        @Size(min = 2, max = 100) String name,
        @Pattern(regexp = "^[6-9][0-9]{9}$") String phone,
        @Size(min = 8, max = 100) String password,
        @Size(max = 20) List<@Size(max = 100) String> skills,
        @Size(max = 150) String location
) {
}