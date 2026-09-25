package com.loanguard.dto;

public record ProfileUpdateRequest(
        String fullName, String phone, String address
) {}