package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "loan_comments")
@CompoundIndex(name = "loan_created_idx", def = "{'loanId': 1, 'createdAt': 1}")
public class LoanComment {

    @Id
    private String id;

    private String loanId;      // references loan_applications._id
    private String userId;      // references users._id
    private String userName;    // denormalized
    private String userRole;    // denormalized

    private String comment;
    private Boolean isInternal = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId()                        { return id; }
    public void setId(String v)                  { this.id = v; }
    public String getLoanId()                    { return loanId; }
    public void setLoanId(String v)              { this.loanId = v; }
    public String getUserId()                    { return userId; }
    public void setUserId(String v)              { this.userId = v; }
    public String getUserName()                  { return userName; }
    public void setUserName(String v)            { this.userName = v; }
    public String getUserRole()                  { return userRole; }
    public void setUserRole(String v)            { this.userRole = v; }
    public String getComment()                   { return comment; }
    public void setComment(String v)             { this.comment = v; }
    public Boolean getIsInternal()               { return isInternal; }
    public void setIsInternal(Boolean v)         { this.isInternal = v; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime v)    { this.createdAt = v; }
}