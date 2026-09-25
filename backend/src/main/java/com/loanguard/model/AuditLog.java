package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class AuditLog {

    @Id
    private String id;

    private String userId;      // references users._id
    private String userName;    // denormalized

    private String action;
    private String entityType;
    private String entityId;    // references entity's _id (String)
    private String details;
    private String ipAddress;

    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId()                        { return id; }
    public void setId(String v)                  { this.id = v; }
    public String getUserId()                    { return userId; }
    public void setUserId(String v)              { this.userId = v; }
    public String getUserName()                  { return userName; }
    public void setUserName(String v)            { this.userName = v; }
    public String getAction()                    { return action; }
    public void setAction(String v)              { this.action = v; }
    public String getEntityType()                { return entityType; }
    public void setEntityType(String v)          { this.entityType = v; }
    public String getEntityId()                  { return entityId; }
    public void setEntityId(String v)            { this.entityId = v; }
    public String getDetails()                   { return details; }
    public void setDetails(String v)             { this.details = v; }
    public String getIpAddress()                 { return ipAddress; }
    public void setIpAddress(String v)           { this.ipAddress = v; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime v)    { this.createdAt = v; }
}