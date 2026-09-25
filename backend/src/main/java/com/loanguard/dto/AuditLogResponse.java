package com.loanguard.dto;

import com.loanguard.model.AuditLog;

public record AuditLogResponse(
        String id, String userName, String action, String entityType,
        String entityId, String details, String ipAddress, String createdAt
) {
    public static AuditLogResponse from(AuditLog a) {
        return new AuditLogResponse(
                a.getId(),
                a.getUserName() != null ? a.getUserName() : "System",
                a.getAction(), a.getEntityType(), a.getEntityId(),
                a.getDetails(), a.getIpAddress(), a.getCreatedAt().toString()
        );
    }
}