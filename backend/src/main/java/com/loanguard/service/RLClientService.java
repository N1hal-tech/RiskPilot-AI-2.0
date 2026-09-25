package com.loanguard.service;

import com.loanguard.dto.RLDecisionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class RLClientService {

    private static final Logger log = LoggerFactory.getLogger(RLClientService.class);

    private final RestTemplate restTemplate;
    private final String rlServiceUrl;

    public RLClientService(RestTemplate restTemplate,
                           @Value("${rl-service.url}") String rlServiceUrl) {
        this.restTemplate = restTemplate;
        this.rlServiceUrl = rlServiceUrl;
    }

    /**
     * Ask the RL agent for a lending decision.
     */
    public RLDecisionResponse decide(double annualIncome, double loanAmount,
                                     double existingDebt, int employmentYears) {
        try {
            Map<String, Object> body = Map.of(
                    "annual_income",    annualIncome,
                    "loan_amount",      loanAmount,
                    "existing_debt",    existingDebt,
                    "employment_years", employmentYears
            );

            ResponseEntity<RLDecisionResponse> resp = restTemplate.postForEntity(
                    rlServiceUrl + "/decide", body, RLDecisionResponse.class);

            if (resp.getBody() != null) {
                log.info("RL decision: {} (conf={}, escalated={})",
                        resp.getBody().action(),
                        resp.getBody().confidenceLevel(),
                        resp.getBody().needsAdminReview());
                return resp.getBody();
            }
        } catch (Exception ex) {
            log.warn("RL service unavailable: {}", ex.getMessage());
        }

        return new RLDecisionResponse(
                "MANUAL_REVIEW", 0.0, "UNCERTAIN", 0.3,
                "LOW", true,
                "RL Agent unavailable. All applications require admin review.",
                java.util.List.of(0.0, 0.0, 0.0, 0.0, 0.0),
                java.util.List.of("REJECT", "APPROVE_STANDARD", "APPROVE_MODERATE", "APPROVE_HIGH", "MANUAL_REVIEW"),
                "(0,0,0,0)", 0.5,
                "RL Agent is currently unavailable. This application has been escalated for admin review.",
                "SYSTEM: RL service offline. Manual review required."
        );
    }

    /**
     * Send outcome feedback to the RL agent for online learning.
     */
    public void sendFeedback(double annualIncome, double loanAmount,
                             double existingDebt, int employmentYears,
                             String actionTaken, boolean defaulted,
                             double interestRate) {
        try {
            Map<String, Object> body = Map.of(
                    "annual_income",    annualIncome,
                    "loan_amount",      loanAmount,
                    "existing_debt",    existingDebt,
                    "employment_years", employmentYears,
                    "action_taken",     actionTaken,
                    "defaulted",        defaulted,
                    "interest_rate",    interestRate
            );

            restTemplate.postForEntity(rlServiceUrl + "/feedback", body, Map.class);
            log.info("Feedback sent to RL agent: action={}, defaulted={}", actionTaken, defaulted);
        } catch (Exception ex) {
            log.warn("Failed to send feedback to RL agent: {}", ex.getMessage());
        }
    }
}