package com.loanguard.dto;

import com.loanguard.model.User;

public record UserResponse(
        String id, String fullName, String email, String role,
        String phone, String address, Boolean isActive,
        String lastLogin, String createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(),
                u.getPhone(), u.getAddress(), u.getIsActive(),
                u.getLastLogin() != null ? u.getLastLogin().toString() : null,
                u.getCreatedAt().toString()
        );
    }
}