package com.loanguard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SimulateRequest(
        @NotNull @Positive Double annualIncome,
        @NotNull @Positive Double loanAmount,
        @NotNull @Min(0)   Double existingDebt,
        @NotNull @Min(0)   Integer employmentYears,
        Integer loanTermMonths,
        String  loanPurpose,
        String  baseAssessmentId
) {}
