package com.gigplatform.admin.dto;

import com.gigplatform.user.UserStatus;
import jakarta.validation.constraints.NotNull;

public record WorkerStatusRequest(@NotNull UserStatus status) {
}