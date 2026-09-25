package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Persisted every time a real loan application is processed via POST /api/loans/apply.
 * Provides risk assessment history for the Risk Intelligence layer.
 */
@Document(collection = "assessments")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class Assessment {

    @Id
    private String id;

    private String userId;              // references users._id
    private String loanRef;             // references loan_applications.applicationRef
    private String loanId;             // references loan_applications._id

    private FinancialProfile financialProfile;
    private RiskResultDoc riskResult;

    private Instant createdAt = Instant.now();

    public String getId()                            { return id; }
    public void setId(String v)                      { this.id = v; }
    public String getUserId()                        { return userId; }
    public void setUserId(String v)                  { this.userId = v; }
    public String getLoanRef()                       { return loanRef; }
    public void setLoanRef(String v)                 { this.loanRef = v; }
    public String getLoanId()                        { return loanId; }
    public void setLoanId(String v)                  { this.loanId = v; }
    public FinancialProfile getFinancialProfile()    { return financialProfile; }
    public void setFinancialProfile(FinancialProfile v) { this.financialProfile = v; }
    public RiskResultDoc getRiskResult()             { return riskResult; }
    public void setRiskResult(RiskResultDoc v)       { this.riskResult = v; }
    public Instant getCreatedAt()                    { return createdAt; }
    public void setCreatedAt(Instant v)              { this.createdAt = v; }
}
