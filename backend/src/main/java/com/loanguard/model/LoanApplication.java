package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "loan_applications")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class LoanApplication {

    @Id
    private String id;

    private String userId;          // references users._id

    private String applicantName;
    private String applicantEmail;

    @Indexed(unique = true)
    private String applicationRef;

    private Double annualIncome;
    private Double loanAmount;
    private Double existingDebt;
    private Integer employmentYears;
    private String loanPurpose;
    private Integer loanTermMonths = 36;

    // ── RL Agent Fields ──
    private String rlAction;
    private String rlSuggestedAction;
    private Double offeredInterestRate;
    private Double defaultProbability;
    private RiskLevel riskLevel;
    private LoanStatus status;
    private String advisoryMessage;
    private String rlState;
    private List<Double> qValues;
    private String confidenceLevel;
    private Boolean needsAdminReview = false;
    private String escalationReason;
    private String adminNote;
    private String adminDecision;
    private Double adminInterestRate;

    // ── Review Fields ──
    private String reviewedById;    // references users._id
    private String reviewedByName;  // denormalized for display
    private LocalDateTime reviewedAt;
    private String reviewNotes;

    // ── Outcome Fields ──
    private LoanOutcome actualOutcome = LoanOutcome.PENDING;
    private Double rewardReceived;
    private Boolean feedbackGiven = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters & Setters
    public String getId()                                    { return id; }
    public void setId(String id)                             { this.id = id; }
    public String getUserId()                                { return userId; }
    public void setUserId(String v)                          { this.userId = v; }
    public String getApplicantName()                         { return applicantName; }
    public void setApplicantName(String v)                   { this.applicantName = v; }
    public String getApplicantEmail()                        { return applicantEmail; }
    public void setApplicantEmail(String v)                  { this.applicantEmail = v; }
    public String getApplicationRef()                        { return applicationRef; }
    public void setApplicationRef(String v)                  { this.applicationRef = v; }
    public Double getAnnualIncome()                          { return annualIncome; }
    public void setAnnualIncome(Double v)                    { this.annualIncome = v; }
    public Double getLoanAmount()                            { return loanAmount; }
    public void setLoanAmount(Double v)                      { this.loanAmount = v; }
    public Double getExistingDebt()                          { return existingDebt; }
    public void setExistingDebt(Double v)                    { this.existingDebt = v; }
    public Integer getEmploymentYears()                      { return employmentYears; }
    public void setEmploymentYears(Integer v)                { this.employmentYears = v; }
    public String getLoanPurpose()                           { return loanPurpose; }
    public void setLoanPurpose(String v)                     { this.loanPurpose = v; }
    public Integer getLoanTermMonths()                       { return loanTermMonths; }
    public void setLoanTermMonths(Integer v)                 { this.loanTermMonths = v; }
    public String getRlAction()                              { return rlAction; }
    public void setRlAction(String v)                        { this.rlAction = v; }
    public String getRlSuggestedAction()                     { return rlSuggestedAction; }
    public void setRlSuggestedAction(String v)               { this.rlSuggestedAction = v; }
    public Double getOfferedInterestRate()                   { return offeredInterestRate; }
    public void setOfferedInterestRate(Double v)             { this.offeredInterestRate = v; }
    public Double getDefaultProbability()                    { return defaultProbability; }
    public void setDefaultProbability(Double v)              { this.defaultProbability = v; }
    public RiskLevel getRiskLevel()                          { return riskLevel; }
    public void setRiskLevel(RiskLevel v)                    { this.riskLevel = v; }
    public LoanStatus getStatus()                            { return status; }
    public void setStatus(LoanStatus v)                      { this.status = v; }
    public String getAdvisoryMessage()                       { return advisoryMessage; }
    public void setAdvisoryMessage(String v)                 { this.advisoryMessage = v; }
    public String getRlState()                               { return rlState; }
    public void setRlState(String v)                         { this.rlState = v; }
    public List<Double> getQValues()                         { return qValues; }
    public void setQValues(List<Double> v)                   { this.qValues = v; }
    public String getConfidenceLevel()                       { return confidenceLevel; }
    public void setConfidenceLevel(String v)                 { this.confidenceLevel = v; }
    public Boolean getNeedsAdminReview()                     { return needsAdminReview; }
    public void setNeedsAdminReview(Boolean v)               { this.needsAdminReview = v; }
    public String getEscalationReason()                      { return escalationReason; }
    public void setEscalationReason(String v)                { this.escalationReason = v; }
    public String getAdminNote()                             { return adminNote; }
    public void setAdminNote(String v)                       { this.adminNote = v; }
    public String getAdminDecision()                         { return adminDecision; }
    public void setAdminDecision(String v)                   { this.adminDecision = v; }
    public Double getAdminInterestRate()                     { return adminInterestRate; }
    public void setAdminInterestRate(Double v)               { this.adminInterestRate = v; }
    public String getReviewedById()                          { return reviewedById; }
    public void setReviewedById(String v)                    { this.reviewedById = v; }
    public String getReviewedByName()                        { return reviewedByName; }
    public void setReviewedByName(String v)                  { this.reviewedByName = v; }
    public LocalDateTime getReviewedAt()                     { return reviewedAt; }
    public void setReviewedAt(LocalDateTime v)               { this.reviewedAt = v; }
    public String getReviewNotes()                           { return reviewNotes; }
    public void setReviewNotes(String v)                     { this.reviewNotes = v; }
    public LoanOutcome getActualOutcome()                    { return actualOutcome; }
    public void setActualOutcome(LoanOutcome v)              { this.actualOutcome = v; }
    public Double getRewardReceived()                        { return rewardReceived; }
    public void setRewardReceived(Double v)                  { this.rewardReceived = v; }
    public Boolean getFeedbackGiven()                        { return feedbackGiven; }
    public void setFeedbackGiven(Boolean v)                  { this.feedbackGiven = v; }
    public LocalDateTime getCreatedAt()                      { return createdAt; }
    public void setCreatedAt(LocalDateTime v)                { this.createdAt = v; }
    public LocalDateTime getUpdatedAt()                      { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v)                { this.updatedAt = v; }
}