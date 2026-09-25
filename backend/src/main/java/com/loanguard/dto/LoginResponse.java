package com.loanguard.dto;

public record LoginResponse(
        String token,
        String userId,
        String fullName,
        String email,
        String role
) {}