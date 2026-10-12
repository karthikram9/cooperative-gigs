package com.gigplatform.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserInfo user
) {

    public record UserInfo(
            Long id,
            String name,
            String email,
            String phone,
            String role,
            String status
    ) {
    }
}
