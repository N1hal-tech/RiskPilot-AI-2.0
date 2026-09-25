package com.loanguard.service;

import com.loanguard.model.ChatMessage;
import com.loanguard.model.LoanApplication;
import com.loanguard.model.LoanStatus;
import com.loanguard.repository.ChatRepository;
import com.loanguard.repository.LoanApplicationRepository;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final LoanApplicationRepository loanRepository;
    private final Map<String, List<String>> intentKeywords = buildIntentKeywords();

    public ChatService(ChatRepository chatRepository, LoanApplicationRepository loanRepository) {
        this.chatRepository = chatRepository;
        this.loanRepository = loanRepository;
    }

    public String processMessage(String sessionId, String userMessage, String userId) {
        ChatMessage user = new ChatMessage();
        user.setSessionId(sessionId);
        user.setUserId(userId);
        user.setRole(ChatMessage.MessageRole.USER);
        user.setContent(userMessage);
        chatRepository.save(user);

        List<ChatMessage> recentMessages = new ArrayList<>(chatRepository.findBySessionIdOrderByCreatedAtAsc(sessionId));
        Collections.reverse(recentMessages);

        ChatContext chatContext = resolveContext(userId, recentMessages);
        Intent intent = detectIntent(userMessage);
        String reply = generateResponse(intent, userMessage, chatContext);

        ChatMessage assistant = new ChatMessage();
        assistant.setSessionId(sessionId);
        assistant.setUserId(userId);
        assistant.setRole(ChatMessage.MessageRole.ASSISTANT);
        assistant.setContent(reply);
        chatRepository.save(assistant);

        return reply;
    }

    public List<ChatMessage> getHistory(String sessionId) {
        return chatRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    public void clearSession(String sessionId) {
        List<ChatMessage> messages = chatRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        chatRepository.deleteAll(messages);
    }

    private Map<String, List<String>> buildIntentKeywords() {
        Map<String, List<String>> keywords = new LinkedHashMap<>();
        keywords.put(Intent.GREETING.name(), List.of("hello", "hi", "hey", "good morning", "good afternoon", "good evening"));
        keywords.put(Intent.ELIGIBILITY.name(), List.of("am i eligible", "can i get loan", "loan eligibility", "qualify", "eligible"));
        keywords.put(Intent.RISK_EXPLANATION.name(), List.of("why high risk", "what is risk", "risk score", "risk level", "risk explanation"));
        keywords.put(Intent.INTEREST_RATE.name(), List.of("why 12%", "interest high", "interest rate", "apr", "rate"));
        keywords.put(Intent.IMPROVEMENT_SUGGESTIONS.name(), List.of("how to improve", "what should i do", "improve", "better chances", "suggestions"));
        keywords.put(Intent.LOAN_CONCEPT.name(), List.of("what is dti", "what is lti", "default probability", "dti", "lti", "default"));
        keywords.put(Intent.DECISION_EXPLANATION.name(), List.of("why review", "why rejected", "manual review", "admin review", "decision"));
        return keywords;
    }

    private Intent detectIntent(String message) {
        String normalized = normalize(message);

        for (Map.Entry<String, List<String>> entry : intentKeywords.entrySet()) {
            if (matchesAny(normalized, entry.getValue())) {
                return Intent.valueOf(entry.getKey());
            }
        }

        return Intent.FALLBACK;
    }

    private String generateResponse(Intent intent, String userMessage, ChatContext context) {
        return switch (intent) {
            case GREETING -> buildGreetingResponse();
            case ELIGIBILITY -> buildEligibilityResponse(context);
            case RISK_EXPLANATION -> buildRiskResponse(context);
            case INTEREST_RATE -> buildInterestRateResponse(context);
            case IMPROVEMENT_SUGGESTIONS -> buildImprovementResponse(context);
            case LOAN_CONCEPT -> buildConceptResponse(userMessage, context);
            case DECISION_EXPLANATION -> buildDecisionResponse(context);
            case FALLBACK -> "I didn’t understand that. Try asking about risk, interest, or eligibility.";
        };
    }

    private String buildGreetingResponse() {
        return "Hello! I am RiskPilot AI Assistant. I can explain eligibility, risk, interest rates, and ways to improve your application.";
    }

    private String buildEligibilityResponse(ChatContext context) {
        if (!context.hasLoanData()) {
            return "I can help assess eligibility. In general, lower debt, stable income, and a smaller loan amount improve your chances.";
        }

        String riskText = riskLabel(context.defaultProbability);
        return "Based on your latest application, your profile looks " + riskText + ". " +
                "Your income, debt load, and requested loan amount are the main factors I would focus on.";
    }

    private String buildRiskResponse(ChatContext context) {
        if (!context.hasLoanData()) {
            return "Risk is the chance that a loan may not be repaid on time. RiskPilot AI looks at income, debt, loan size, and employment stability to estimate that risk.";
        }

        String reason = explainRiskDrivers(context);
        return "Your risk is " + riskLabel(context.defaultProbability) + " because " + reason + ".";
    }

    private String buildInterestRateResponse(ChatContext context) {
        if (!context.hasLoanData()) {
            return "Interest rates are tied to risk. Lower risk usually gets a lower rate, while higher risk gets a higher rate.";
        }

        return "Your current rate is around " + formatRate(context.offeredInterestRate) + ". " +
                "Lowering your loan amount or improving your debt-to-income ratio can reduce your interest rate.";
    }

    private String buildImprovementResponse(ChatContext context) {
        if (!context.hasLoanData()) {
            return "To improve your chances, reduce existing debt, request a smaller loan, and keep income stable.";
        }

        List<String> tips = new ArrayList<>();
        if (context.dti != null && context.dti > 40) {
            tips.add("reduce existing debt to lower your DTI");
        }
        if (context.lti != null && context.lti > 30) {
            tips.add("lower your loan amount to reduce your LTI");
        }
        if (tips.isEmpty()) {
            tips.add("keep your income stable and maintain your current profile");
        }

        return "You can improve your result by " + joinNaturally(tips) + ". Lowering your loan amount can reduce your interest rate too.";
    }

    private String buildConceptResponse(String message, ChatContext context) {
        String lower = normalize(message);

        if (lower.contains("dti")) {
            return "DTI means Debt-to-Income ratio. It is calculated as debt divided by income. A lower DTI usually means a stronger application.";
        }

        if (lower.contains("lti")) {
            return "LTI means Loan-to-Income ratio. It compares the loan amount to income. A lower LTI is usually safer for lenders.";
        }

        if (lower.contains("default probability")) {
            return "Default probability is the estimated chance that a borrower may not repay the loan. Higher numbers mean higher risk.";
        }

        if (context.hasLoanData()) {
            return "Your latest loan shows a DTI of " + formatPercent(context.dti) +
                    " and an LTI of " + formatPercent(context.lti) + ". Those numbers help explain the decision.";
        }

        return "I can explain DTI, LTI, and default probability. Ask me about one of those terms directly.";
    }

    private String buildDecisionResponse(ChatContext context) {
        if (!context.hasLoanData()) {
            return "Manual review means a person should look at the application because the model thinks a closer check is useful.";
        }

        if (context.status != null && context.status.equalsIgnoreCase(LoanStatus.UNDER_REVIEW.name())) {
            return "Your application is under review because the system wants a closer look at the risk and final pricing terms.";
        }

        if (context.status != null && context.status.equalsIgnoreCase(LoanStatus.REJECTED.name())) {
            return "Your application was rejected because the risk profile did not meet the lending threshold.";
        }

        return "Your application was approved. Any remaining review would usually be for pricing confirmation only.";
    }

    private ChatContext resolveContext(String userId, List<ChatMessage> recentMessages) {
        if (userId == null || userId.isBlank()) {
            return ChatContext.empty();
        }

        Optional<LoanApplication> latestLoan = loanRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().findFirst();

        if (latestLoan.isEmpty()) {
            return ChatContext.empty();
        }

        LoanApplication loan = latestLoan.get();
        Double dti = computeDti(loan);
        Double lti = computeLti(loan);

        return new ChatContext(
                loan.getDefaultProbability(),
                loan.getOfferedInterestRate(),
                dti, lti,
                loan.getStatus() != null ? loan.getStatus().name() : null,
                loan.getRiskLevel() != null ? loan.getRiskLevel().name() : null,
                loan.getAnnualIncome(), loan.getLoanAmount(),
                loan.getExistingDebt(), loan.getLoanPurpose()
        );
    }

    private Double computeDti(LoanApplication loan) {
        if (loan.getAnnualIncome() == null || loan.getAnnualIncome() <= 0 || loan.getExistingDebt() == null) {
            return null;
        }
        return (loan.getExistingDebt() / loan.getAnnualIncome()) * 100.0;
    }

    private Double computeLti(LoanApplication loan) {
        if (loan.getAnnualIncome() == null || loan.getAnnualIncome() <= 0 || loan.getLoanAmount() == null) {
            return null;
        }
        return (loan.getLoanAmount() / loan.getAnnualIncome()) * 100.0;
    }

    private String explainRiskDrivers(ChatContext context) {
        List<String> reasons = new ArrayList<>();
        if (context.dti != null && context.dti > 40) {
            reasons.add("your debt is large compared to your income");
        }
        if (context.lti != null && context.lti > 30) {
            reasons.add("your requested loan amount is high relative to income");
        }
        if (context.offeredInterestRate != null && context.offeredInterestRate > 0) {
            reasons.add("the interest rate was adjusted based on that risk level");
        }
        if (reasons.isEmpty()) {
            reasons.add("the application has a balanced financial profile");
        }
        return joinNaturally(reasons);
    }

    private String riskLabel(Double defaultProbability) {
        if (defaultProbability == null) {
            return "hard to classify";
        }
        if (defaultProbability < 0.20) {
            return "low risk";
        }
        if (defaultProbability <= 0.40) {
            return "medium risk";
        }
        return "high risk";
    }

    private String formatRate(Double rate) {
        if (rate == null) {
            return "an unspecified rate";
        }
        return new DecimalFormat("0.0").format(rate) + "%";
    }

    private String formatPercent(Double value) {
        if (value == null) {
            return "n/a";
        }
        return new DecimalFormat("0.0").format(value) + "%";
    }

    private String joinNaturally(List<String> values) {
        if (values.isEmpty()) {
            return "";
        }
        if (values.size() == 1) {
            return values.get(0);
        }
        if (values.size() == 2) {
            return values.get(0) + " and " + values.get(1);
        }
        return String.join(", ", values.subList(0, values.size() - 1)) + ", and " + values.get(values.size() - 1);
    }

    private String normalize(String message) {
        return message == null ? "" : message.toLowerCase(Locale.ROOT).trim();
    }

    private boolean matchesAny(String input, List<String> keywords) {
        for (String keyword : keywords) {
            if (input.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private enum Intent {
        GREETING,
        ELIGIBILITY,
        RISK_EXPLANATION,
        INTEREST_RATE,
        IMPROVEMENT_SUGGESTIONS,
        LOAN_CONCEPT,
        DECISION_EXPLANATION,
        FALLBACK
    }

    private record ChatContext(
            Double defaultProbability,
            Double offeredInterestRate,
            Double dti,
            Double lti,
            String status,
            String riskLevel,
            Double annualIncome,
            Double loanAmount,
            Double existingDebt,
            String loanPurpose
    ) {
        static ChatContext empty() {
            return new ChatContext(null, null, null, null, null, null, null, null, null, null);
        }

        boolean hasLoanData() {
            return annualIncome != null || loanAmount != null || existingDebt != null || defaultProbability != null;
        }
    }
}
