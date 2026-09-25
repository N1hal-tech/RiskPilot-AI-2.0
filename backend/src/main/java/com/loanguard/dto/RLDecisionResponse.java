package com.loanguard.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RLDecisionResponse(
        String action,
        @JsonProperty("interest_rate")       double interestRate,
        @JsonProperty("risk_assessment")     String riskAssessment,
        double confidence,
        @JsonProperty("confidence_level")    String confidenceLevel,
        @JsonProperty("needs_admin_review")  boolean needsAdminReview,
        @JsonProperty("escalation_reason")   String escalationReason,
        @JsonProperty("q_values")            List<Double> qValues,
        @JsonProperty("action_labels")       List<String> actionLabels,
        String state,
        @JsonProperty("default_probability") double defaultProbability,
        @JsonProperty("advisory_message")    String advisoryMessage,
        @JsonProperty("admin_note")          String adminNote
) {}