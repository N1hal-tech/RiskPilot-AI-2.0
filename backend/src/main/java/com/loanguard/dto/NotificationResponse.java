package com.loanguard.dto;

import com.loanguard.model.Notification;

public record NotificationResponse(
        String id, String title, String message, String type,
        Boolean isRead, String link, String createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getTitle(), n.getMessage(), n.getType(),
                n.getIsRead(), n.getLink(), n.getCreatedAt().toString()
        );
    }
}