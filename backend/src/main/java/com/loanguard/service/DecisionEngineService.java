package com.loanguard.service;

import com.loanguard.model.LoanStatus;
import com.loanguard.model.RiskLevel;
import org.springframework.stereotype.Service;

@Service
public class DecisionEngineService {

    public record Decision(RiskLevel riskLevel, LoanStatus status, String message) {}

    /**
     * Traffic-light decision logic.
     *
     *   GREEN  (< 0.30) → Auto-Approved
     *   YELLOW (0.30 – 0.59) → Manual Review
     *   RED    (≥ 0.60) → Auto-Rejected
     */
    public Decision evaluate(double defaultProbability) {

        if (defaultProbability < 0.30) {
            return new Decision(
                    RiskLevel.GREEN,
                    LoanStatus.APPROVED,
                    "Congratulations! Your loan application has been approved. "
                  + "Your financial profile indicates a low risk of default "
                  + "with a probability of " + pct(defaultProbability) + "."
            );
        }

        if (defaultProbability < 0.60) {
            return new Decision(
                    RiskLevel.YELLOW,
                    LoanStatus.UNDER_REVIEW,
                    "Your application has been flagged for manual review. "
                  + "Your default probability of " + pct(defaultProbability)
                  + " falls in the moderate-risk range. "
                  + "A loan officer will contact you within 2–3 business days."
            );
        }

        return new Decision(
                RiskLevel.RED,
                LoanStatus.REJECTED,
                "Unfortunately your application has been declined. "
              + "A default probability of " + pct(defaultProbability)
              + " exceeds our risk threshold. "
              + "Consider reducing existing debt or requesting a smaller loan amount."
        );
    }

    private String pct(double v) {
        return String.format("%.1f%%", v * 100);
    }
}