package com.loanguard.dto;

import com.loanguard.model.LoanComment;

public record CommentResponse(
        String id, String loanId, String userName, String userRole,
        String comment, Boolean isInternal, String createdAt
) {
    public static CommentResponse from(LoanComment c) {
        return new CommentResponse(
                c.getId(), c.getLoanId(),
                c.getUserName(), c.getUserRole(),
                c.getComment(), c.getIsInternal(), c.getCreatedAt().toString()
        );
    }
}