package com.loanguard.model;

/**
 * Embedded sub-document shared between Assessment and Simulation.
 * Captures the RL engine's risk decision result.
 */
public class RiskResultDoc {
    private String riskLevel;           // GREEN | YELLOW | RED
    private Double defaultProbability;
    private String confidenceLevel;     // HIGH | MEDIUM | LOW
    private Double offeredInterestRate;
    private String rlAction;            // APPROVE_STANDARD | APPROVE_MODERATE | APPROVE_HIGH | REJECT | MANUAL_REVIEW
    private String advisoryMessage;

    public RiskResultDoc() {}

    public RiskResultDoc(String riskLevel, Double defaultProbability, String confidenceLevel,
                         Double offeredInterestRate, String rlAction, String advisoryMessage) {
        this.riskLevel          = riskLevel;
        this.defaultProbability = defaultProbability;
        this.confidenceLevel    = confidenceLevel;
        this.offeredInterestRate = offeredInterestRate;
        this.rlAction           = rlAction;
        this.advisoryMessage    = advisoryMessage;
    }

    public String getRiskLevel()                     { return riskLevel; }
    public void setRiskLevel(String v)               { this.riskLevel = v; }
    public Double getDefaultProbability()            { return defaultProbability; }
    public void setDefaultProbability(Double v)      { this.defaultProbability = v; }
    public String getConfidenceLevel()               { return confidenceLevel; }
    public void setConfidenceLevel(String v)         { this.confidenceLevel = v; }
    public Double getOfferedInterestRate()           { return offeredInterestRate; }
    public void setOfferedInterestRate(Double v)     { this.offeredInterestRate = v; }
    public String getRlAction()                      { return rlAction; }
    public void setRlAction(String v)                { this.rlAction = v; }
    public String getAdvisoryMessage()               { return advisoryMessage; }
    public void setAdvisoryMessage(String v)         { this.advisoryMessage = v; }
}
