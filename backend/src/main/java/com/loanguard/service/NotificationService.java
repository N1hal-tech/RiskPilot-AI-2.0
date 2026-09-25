package com.loanguard.service;

import com.loanguard.dto.NotificationResponse;
import com.loanguard.model.Notification;
import com.loanguard.model.User;
import com.loanguard.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notifRepo;

    public NotificationService(NotificationRepository notifRepo) {
        this.notifRepo = notifRepo;
    }

    public void send(User user, String title, String message, String type, String link) {
        Notification n = new Notification();
        n.setUserId(user.getId());
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setLink(link);
        notifRepo.save(n);
    }

    public List<NotificationResponse> getAll(String userId) {
        return notifRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::from).toList();
    }

    public long unreadCount(String userId) {
        return notifRepo.countByUserIdAndIsReadFalse(userId);
    }

    public void markRead(String id) {
        notifRepo.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notifRepo.save(n);
        });
    }

    public void markAllRead(String userId) {
        notifRepo.markAllReadByUserId(userId);
    }
}