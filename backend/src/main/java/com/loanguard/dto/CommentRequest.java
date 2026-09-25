package com.loanguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentRequest(
        @NotNull String loanId,
        @NotBlank String comment,
        Boolean isInternal
) {}