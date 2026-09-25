package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String authProvider;

    private String providerSubject;

    private UserRole role = UserRole.USER;

    private String phone;

    private String address;

    private Boolean isActive = true;

    private LocalDateTime lastLogin;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public User() {}

    public User(String fullName, String email, String password) {
        this.fullName = fullName;
        this.email    = email;
        this.password = password;
        this.role     = UserRole.USER;
    }

    public User(String fullName, String email, String password, UserRole role) {
        this.fullName = fullName;
        this.email    = email;
        this.password = password;
        this.role     = role != null ? role : UserRole.USER;
    }

    // Getters & Setters
    public String getId()                            { return id; }
    public void setId(String id)                     { this.id = id; }
    public String getFullName()                      { return fullName; }
    public void setFullName(String v)                { this.fullName = v; }
    public String getEmail()                         { return email; }
    public void setEmail(String v)                   { this.email = v; }
    public String getPassword()                      { return password; }
    public void setPassword(String v)                { this.password = v; }
    public String getAuthProvider()                  { return authProvider; }
    public void setAuthProvider(String v)            { this.authProvider = v; }
    public String getProviderSubject()               { return providerSubject; }
    public void setProviderSubject(String v)         { this.providerSubject = v; }
    public UserRole getRole()                        { return role; }
    public void setRole(UserRole v)                  { this.role = v; }
    public String getPhone()                         { return phone; }
    public void setPhone(String v)                   { this.phone = v; }
    public String getAddress()                       { return address; }
    public void setAddress(String v)                 { this.address = v; }
    public Boolean getIsActive()                     { return isActive; }
    public void setIsActive(Boolean v)               { this.isActive = v; }
    public LocalDateTime getLastLogin()              { return lastLogin; }
    public void setLastLogin(LocalDateTime v)        { this.lastLogin = v; }
    public LocalDateTime getCreatedAt()              { return createdAt; }
    public void setCreatedAt(LocalDateTime v)        { this.createdAt = v; }
    public LocalDateTime getUpdatedAt()              { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v)        { this.updatedAt = v; }
}