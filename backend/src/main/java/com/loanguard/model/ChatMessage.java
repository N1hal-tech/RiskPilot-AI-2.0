package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@CompoundIndex(name = "session_created_idx", def = "{'sessionId': 1, 'createdAt': 1}")
public class ChatMessage {

    public enum MessageRole {
        USER, ASSISTANT
    }

    @Id
    private String id;

    private String sessionId;
    private String userId;
    private MessageRole role;
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId()                        { return id; }
    public void setId(String v)                  { this.id = v; }
    public String getSessionId()                 { return sessionId; }
    public void setSessionId(String v)           { this.sessionId = v; }
    public String getUserId()                    { return userId; }
    public void setUserId(String v)              { this.userId = v; }
    public MessageRole getRole()                 { return role; }
    public void setRole(MessageRole v)           { this.role = v; }
    public String getContent()                   { return content; }
    public void setContent(String v)             { this.content = v; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime v)    { this.createdAt = v; }
}
