package com.shopsphere.auth.dto;

import com.shopsphere.user.UserDto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInMs,
        UserDto user
) {
    public static AuthResponse of(String accessToken, long expiresInMs, UserDto user) {
        return new AuthResponse(accessToken, "Bearer", expiresInMs, user);
    }
}

