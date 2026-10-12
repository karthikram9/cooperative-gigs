package com.gigplatform.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateWorkerRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Pattern(regexp = "^[6-9][0-9]{9}$") String phone,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Size(max = 20) List<@NotBlank @Size(max = 100) String> skills,
        @Size(max = 150) String location
) {
}