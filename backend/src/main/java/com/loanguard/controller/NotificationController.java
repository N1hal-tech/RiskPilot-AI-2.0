package com.loanguard.controller;

import com.loanguard.dto.NotificationResponse;
import com.loanguard.model.User;
import com.loanguard.service.AuthService;
import com.loanguard.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notifService;
    private final AuthService authService;

    public NotificationController(NotificationService notifService, AuthService authService) {
        this.notifService = notifService;
        this.authService  = authService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(@RequestHeader("Authorization") String auth) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(notifService.getAll(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@RequestHeader("Authorization") String auth) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(Map.of("count", notifService.unreadCount(user.getId())));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markRead(
            @RequestHeader("Authorization") String auth, @PathVariable String id) {
        authService.validateToken(auth);
        notifService.markRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllRead(@RequestHeader("Authorization") String auth) {
        User user = authService.validateToken(auth);
        notifService.markAllRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
