package com.loanguard.dto;

import jakarta.validation.constraints.NotBlank;

public record SocialAuthRequest(
        @NotBlank String provider,
        @NotBlank String idToken,
        String email,
        String fullName
) {}