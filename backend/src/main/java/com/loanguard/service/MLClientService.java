package com.loanguard.service;

import com.loanguard.dto.MLPredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class MLClientService {

    private static final Logger log = LoggerFactory.getLogger(MLClientService.class);

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public MLClientService(RestTemplate restTemplate,
                           @Value("${ml-service.url}") String mlServiceUrl) {
        this.restTemplate  = restTemplate;
        this.mlServiceUrl  = mlServiceUrl;
    }

    /**
     * Calls the Python ML micro-service; falls back to a deterministic
     * heuristic when the service is unreachable.
     */
    public double predictDefault(double annualIncome, double loanAmount,
                                 double existingDebt, int employmentYears) {
        try {
            Map<String, Object> body = Map.of(
                    "annual_income",    annualIncome,
                    "loan_amount",      loanAmount,
                    "existing_debt",    existingDebt,
                    "employment_years", employmentYears
            );

            ResponseEntity<MLPredictionResponse> resp =
                    restTemplate.postForEntity(
                            mlServiceUrl + "/predict", body,
                            MLPredictionResponse.class);

            if (resp.getBody() != null) {
                log.info("ML prediction received: {}", resp.getBody().defaultProbability());
                return resp.getBody().defaultProbability();
            }
        } catch (Exception ex) {
            log.warn("ML service unavailable – using fallback heuristic: {}", ex.getMessage());
        }

        return fallback(annualIncome, loanAmount, existingDebt, employmentYears);
    }

    /* Simple rule-based fallback so the app still works without the ML pod. */
    private double fallback(double income, double loan, double debt, int years) {
        double dti   = debt / income;
        double lti   = loan / income;
        double total = (debt + loan) / income;
        double raw   = 0.25 * dti + 0.35 * lti + 0.30 * total - 0.008 * years + 0.05;
        return Math.max(0.01, Math.min(0.99, raw));
    }
}