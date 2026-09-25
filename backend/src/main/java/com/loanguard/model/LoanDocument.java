package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "loan_documents")
@CompoundIndex(name = "loan_created_idx", def = "{'loanId': 1, 'createdAt': -1}")
public class LoanDocument {

    @Id
    private String id;

    private String loanId;          // references loan_applications._id
    private String userId;          // references users._id

    private String fileName;
    private String fileType;
    private Long fileSize;
    private String docType;
    private Boolean verified = false;
    private String verifiedById;    // references users._id
    private String verifiedByName;  // denormalized
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId()                        { return id; }
    public void setId(String v)                  { this.id = v; }
    public String getLoanId()                    { return loanId; }
    public void setLoanId(String v)              { this.loanId = v; }
    public String getUserId()                    { return userId; }
    public void setUserId(String v)              { this.userId = v; }
    public String getFileName()                  { return fileName; }
    public void setFileName(String v)            { this.fileName = v; }
    public String getFileType()                  { return fileType; }
    public void setFileType(String v)            { this.fileType = v; }
    public Long getFileSize()                    { return fileSize; }
    public void setFileSize(Long v)              { this.fileSize = v; }
    public String getDocType()                   { return docType; }
    public void setDocType(String v)             { this.docType = v; }
    public Boolean getVerified()                 { return verified; }
    public void setVerified(Boolean v)           { this.verified = v; }
    public String getVerifiedById()              { return verifiedById; }
    public void setVerifiedById(String v)        { this.verifiedById = v; }
    public String getVerifiedByName()            { return verifiedByName; }
    public void setVerifiedByName(String v)      { this.verifiedByName = v; }
    public LocalDateTime getVerifiedAt()         { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime v)   { this.verifiedAt = v; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime v)    { this.createdAt = v; }
}
