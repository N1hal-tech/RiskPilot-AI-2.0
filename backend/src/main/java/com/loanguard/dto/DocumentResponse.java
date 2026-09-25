package com.loanguard.dto;

import com.loanguard.model.LoanDocument;

public record DocumentResponse(
        String id, String loanId, String fileName, String fileType,
        Long fileSize, String docType, Boolean verified,
        String verifiedBy, String verifiedAt, String createdAt
) {
    public static DocumentResponse from(LoanDocument d) {
        return new DocumentResponse(
                d.getId(), d.getLoanId(), d.getFileName(),
                d.getFileType(), d.getFileSize(), d.getDocType(),
                d.getVerified(),
                d.getVerifiedByName(),
                d.getVerifiedAt() != null ? d.getVerifiedAt().toString() : null,
                d.getCreatedAt().toString()
        );
    }
}