package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class Notification {

    @Id
    private String id;

    private String userId;      // references users._id

    private String title;
    private String message;
    private String type;
    private Boolean isRead = false;
    private String link;

    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId()                        { return id; }
    public void setId(String v)                  { this.id = v; }
    public String getUserId()                    { return userId; }
    public void setUserId(String v)              { this.userId = v; }
    public String getTitle()                     { return title; }
    public void setTitle(String v)               { this.title = v; }
    public String getMessage()                   { return message; }
    public void setMessage(String v)             { this.message = v; }
    public String getType()                      { return type; }
    public void setType(String v)                { this.type = v; }
    public Boolean getIsRead()                   { return isRead; }
    public void setIsRead(Boolean v)             { this.isRead = v; }
    public String getLink()                      { return link; }
    public void setLink(String v)                { this.link = v; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime v)    { this.createdAt = v; }
}