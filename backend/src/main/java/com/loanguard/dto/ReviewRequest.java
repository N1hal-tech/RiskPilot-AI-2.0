package com.loanguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewRequest(
        @NotNull String loanId,
        @NotBlank String decision,
        String notes,
        Double overrideInterestRate
) {}