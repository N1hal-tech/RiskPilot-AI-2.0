package com.loanguard.dto;

import com.loanguard.model.LoanApplication;

import java.util.List;

public record LoanResponse(
        String  id,
        String  applicationRef,
        String  userId,
        String  userName,
        Double  annualIncome,
        Double  loanAmount,
        Double  existingDebt,
        Integer employmentYears,
        String  loanPurpose,
        Integer loanTermMonths,
        String  rlAction,
        String  rlSuggestedAction,
        Double  offeredInterestRate,
        Double  defaultProbability,
        String  riskLevel,
        String  status,
        String  advisoryMessage,
        String  rlState,
        List<Double> qValues,
        String  confidenceLevel,
        Double  confidence,
        Boolean needsAdminReview,
        String  escalationReason,
        String  adminNote,
        String  adminDecision,
        Double  adminInterestRate,
        String  actualOutcome,
        Double  rewardReceived,
        Boolean feedbackGiven,
        String  reviewedBy,
        String  reviewedAt,
        String  reviewNotes,
        Double  dti,
        Double  lti,
        Double  defaultRisk,
        List<String> improvementSuggestions,
        String  decisionExplanation,
        String  createdAt
) {
    public static LoanResponse fromEntity(LoanApplication a) {
        Double confValue = null;
        if (a.getConfidenceLevel() != null) {
            confValue = switch (a.getConfidenceLevel()) {
                case "HIGH"   -> 0.85;
                case "MEDIUM" -> 0.60;
                case "LOW"    -> 0.35;
                default       -> 0.50;
            };
        }

        return new LoanResponse(
                a.getId(), a.getApplicationRef(),
                a.getUserId(), a.getApplicantName(),
                a.getAnnualIncome(), a.getLoanAmount(), a.getExistingDebt(),
                a.getEmploymentYears(), a.getLoanPurpose(), a.getLoanTermMonths(),
                a.getRlAction(), a.getRlSuggestedAction(),
                a.getOfferedInterestRate(), a.getDefaultProbability(),
                a.getRiskLevel() != null ? a.getRiskLevel().name() : null,
                a.getStatus()    != null ? a.getStatus().name()    : null,
                a.getAdvisoryMessage(), a.getRlState(), a.getQValues(),
                a.getConfidenceLevel(), confValue,
                a.getNeedsAdminReview(), a.getEscalationReason(),
                a.getAdminNote(), a.getAdminDecision(), a.getAdminInterestRate(),
                a.getActualOutcome() != null ? a.getActualOutcome().name() : "PENDING",
                a.getRewardReceived(), a.getFeedbackGiven(),
                a.getReviewedByName(),
                a.getReviewedAt() != null ? a.getReviewedAt().toString() : null,
                a.getReviewNotes(),
                computeDti(a), computeLti(a),
                a.getDefaultProbability(),
                buildImprovementSuggestions(a),
                buildDecisionExplanation(a),
                a.getCreatedAt().toString()
        );
    }

    private static Double computeDti(LoanApplication a) {
        if (a.getAnnualIncome() == null || a.getAnnualIncome() <= 0 || a.getExistingDebt() == null) return null;
        return (a.getExistingDebt() / a.getAnnualIncome()) * 100.0;
    }

    private static Double computeLti(LoanApplication a) {
        if (a.getAnnualIncome() == null || a.getAnnualIncome() <= 0 || a.getLoanAmount() == null) return null;
        return (a.getLoanAmount() / a.getAnnualIncome()) * 100.0;
    }

    private static List<String> buildImprovementSuggestions(LoanApplication a) {
        Double dti = computeDti(a);
        Double lti = computeLti(a);
        Double dr  = a.getDefaultProbability();
        List<String> suggestions = new java.util.ArrayList<>();

        if (dti != null && dti > 30) {
            suggestions.add("Reduce existing debt to lower your debt-to-income ratio.");
        } else if (dti != null) {
            suggestions.add("Your debt level is healthy relative to income.");
        }

        if (lti != null && lti > 40) {
            suggestions.add("Consider a smaller loan amount to improve your loan-to-income ratio.");
        } else if (lti != null) {
            suggestions.add("Your requested loan size is reasonable compared to income.");
        }

        if (dr != null && dr > 0.35) {
            suggestions.add("Improve your credit profile (pay down balances, maintain steady income) to lower default risk.");
        } else if (dr != null) {
            suggestions.add("Low default risk is detected, keep up your strong profile.");
        }

        return suggestions.size() > 3 ? suggestions.subList(0, 3) : suggestions;
    }

    private static String buildDecisionExplanation(LoanApplication a) {
        StringBuilder sb = new StringBuilder();
        String status = a.getStatus() != null ? a.getStatus().name() : "UNKNOWN";

        if ("APPROVED".equals(status)) {
            sb.append("Congratulations, your application was approved.");
        } else if ("UNDER_REVIEW".equals(status)) {
            sb.append("Your application is under manual review.");
        } else if ("REJECTED".equals(status)) {
            sb.append("The application was declined based on current risk metrics.");
        } else {
            sb.append("The decision is pending further evaluation.");
        }

        if (a.getOfferedInterestRate() != null) {
            sb.append(" The offered rate is ").append(a.getOfferedInterestRate()).append("%.");
        }
        if (a.getDefaultProbability() != null) {
            sb.append(" Default probability is ").append(String.format("%.1f%%", a.getDefaultProbability() * 100)).append(".");
        }
        if (a.getRiskLevel() != null) {
            sb.append(" Risk level is ").append(a.getRiskLevel().name().toLowerCase()).append(".");
        }
        String confidenceLabel = a.getConfidenceLevel();
        if (confidenceLabel != null && confidenceLabel.toLowerCase().contains("medium")) {
            sb.append(" Medium confidence detected: multiple decision options had similar expected outcomes, so manual review ensures optimal loan terms.");
        }

        String result = sb.toString().trim();
        return result.length() > 380 ? result.substring(0, 377) + "..." : result;
    }
}