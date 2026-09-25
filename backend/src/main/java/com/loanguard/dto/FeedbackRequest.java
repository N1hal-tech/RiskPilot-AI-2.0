package com.loanguard.dto;

import jakarta.validation.constraints.NotNull;

public record FeedbackRequest(
        @NotNull String loanId,
        @NotNull Boolean defaulted
) {}