package com.loanguard.controller;

import com.loanguard.model.ChatMessage;
import com.loanguard.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        String reply = chatService.processMessage(request.sessionId(), request.message(), request.userId());
        return ResponseEntity.ok(new ChatResponse(reply, request.sessionId()));
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getHistory(@PathVariable String sessionId) {
        return ResponseEntity.ok(chatService.getHistory(sessionId));
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> clearSession(@PathVariable String sessionId) {
        chatService.clearSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    public record ChatRequest(String sessionId, String message, String userId) { }

    public record ChatResponse(String reply, String sessionId) { }
}
