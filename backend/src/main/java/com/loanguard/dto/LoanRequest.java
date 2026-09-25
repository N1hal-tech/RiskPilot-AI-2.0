package com.loanguard.dto;

import jakarta.validation.constraints.*;

public record LoanRequest(
        @NotNull @Positive Double annualIncome,
        @NotNull @Positive Double loanAmount,
        @NotNull @PositiveOrZero Double existingDebt,
        @NotNull @Min(0) @Max(50) Integer employmentYears,
        String loanPurpose,
        @Min(6) @Max(360) Integer loanTermMonths
) {}