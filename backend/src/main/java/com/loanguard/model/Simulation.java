package com.loanguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A what-if simulation: user provides hypothetical financial inputs,
 * the existing Q-learning RL engine calculates the risk result,
 * and the scenario + result are persisted here.
 */
@Document(collection = "simulations")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class Simulation {

    @Id
    private String id;

    private String userId;              // references users._id
    private String baseAssessmentId;    // optional reference to assessments._id

    private FinancialProfile scenario;
    private RiskResultDoc result;

    private Instant createdAt = Instant.now();

    public String getId()                            { return id; }
    public void setId(String v)                      { this.id = v; }
    public String getUserId()                        { return userId; }
    public void setUserId(String v)                  { this.userId = v; }
    public String getBaseAssessmentId()              { return baseAssessmentId; }
    public void setBaseAssessmentId(String v)        { this.baseAssessmentId = v; }
    public FinancialProfile getScenario()            { return scenario; }
    public void setScenario(FinancialProfile v)      { this.scenario = v; }
    public RiskResultDoc getResult()                 { return result; }
    public void setResult(RiskResultDoc v)           { this.result = v; }
    public Instant getCreatedAt()                    { return createdAt; }
    public void setCreatedAt(Instant v)              { this.createdAt = v; }
}
