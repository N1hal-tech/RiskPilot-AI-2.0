package com.loanguard.service;

import com.loanguard.model.Assessment;
import com.loanguard.model.KnowledgeEntry;
import com.loanguard.repository.AssessmentRepository;
import com.loanguard.repository.KnowledgeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class KnowledgeService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeService.class);

    private final KnowledgeRepository knowledgeRepo;
    private final AssessmentRepository assessmentRepo;
    private final GeminiService geminiService;
    private final MongoTemplate mongoTemplate;

    public KnowledgeService(KnowledgeRepository knowledgeRepo,
                            AssessmentRepository assessmentRepo,
                            GeminiService geminiService,
                            MongoTemplate mongoTemplate) {
        this.knowledgeRepo  = knowledgeRepo;
        this.assessmentRepo = assessmentRepo;
        this.geminiService  = geminiService;
        this.mongoTemplate  = mongoTemplate;
    }

    /**
     * Answer a user's financial question using:
     * 1. User's latest risk assessment as financial context
     * 2. Semantic search over knowledge collection (via Atlas Vector Search when configured)
     * 3. Gemini LLM to synthesize a personalized answer
     */
    public String ask(String userId, String question) {
        // 1. Fetch user's latest assessment for personalized context
        Optional<Assessment> latestAssessment = assessmentRepo.findTopByUserIdOrderByCreatedAtDesc(userId);

        String financialContext = buildFinancialContext(latestAssessment);

        // 2. Retrieve relevant knowledge
        List<KnowledgeEntry> relevantEntries = findRelevantKnowledge(question);
        String knowledgeContext = buildKnowledgeContext(relevantEntries);

        // 3. Build system prompt and call LLM
        String systemPrompt = """
            You are RiskPilot AI's financial guidance assistant. You help users understand their loan risk \
            profile and improve their financial health. Be concise, specific, and actionable.
            Always use Indian Rupees (₹) for currency references.
            
            User's Financial Profile:
            """ + financialContext + """
            
            Relevant Financial Knowledge:
            """ + knowledgeContext + """
            
            Instructions:
            - Answer only questions related to loans, risk, and personal finance.
            - Refer to the user's actual financial numbers when relevant.
            - Be encouraging but honest about risk factors.
            - Keep your response under 200 words.
            """;

        return geminiService.generateAnswer(systemPrompt, question);
    }

    /**
     * Find relevant knowledge using Atlas Vector Search (if embeddings available) or keyword fallback.
     */
    @SuppressWarnings("unchecked")
    private List<KnowledgeEntry> findRelevantKnowledge(String question) {
        if (!geminiService.isConfigured()) {
            // Fallback: return all entries (they're few, this is acceptable)
            List<KnowledgeEntry> all = knowledgeRepo.findAll();
            return all.size() > 3 ? all.subList(0, 3) : all;
        }

        try {
            List<Double> queryEmbedding = geminiService.embed(question);
            if (queryEmbedding.isEmpty()) {
                return knowledgeRepo.findAll().stream().limit(3).toList();
            }

            // Atlas Vector Search aggregation
            Aggregation agg = Aggregation.newAggregation(
                context -> new org.bson.Document("$vectorSearch", new org.bson.Document()
                    .append("index", "knowledge_vector_index")
                    .append("path", "embedding")
                    .append("queryVector", queryEmbedding)
                    .append("numCandidates", 20)
                    .append("limit", 3))
            );

            AggregationResults<KnowledgeEntry> results = mongoTemplate.aggregate(
                    agg, "knowledge", KnowledgeEntry.class);
            List<KnowledgeEntry> found = results.getMappedResults();

            if (found.isEmpty()) {
                return knowledgeRepo.findAll().stream().limit(3).toList();
            }
            return found;
        } catch (Exception e) {
            log.warn("Vector search failed (index may not be set up yet), using all entries: {}", e.getMessage());
            return knowledgeRepo.findAll().stream().limit(3).toList();
        }
    }

    private String buildFinancialContext(Optional<Assessment> assessment) {
        return assessment.map(a -> {
            var fp = a.getFinancialProfile();
            var rr = a.getRiskResult();
            if (fp == null || rr == null) return "No financial profile available.";
            double dti = fp.getExistingDebt() / fp.getAnnualIncome() * 100;
            double lti = fp.getLoanAmount()   / fp.getAnnualIncome() * 100;
            return String.format(
                "Annual Income: ₹%.0f | Loan Amount: ₹%.0f | Existing Debt: ₹%.0f | " +
                "Employment Years: %d | DTI: %.1f%% | LTI: %.1f%% | " +
                "Risk Level: %s | Default Probability: %.1f%% | Confidence: %s | RL Decision: %s",
                fp.getAnnualIncome(), fp.getLoanAmount(), fp.getExistingDebt(),
                fp.getEmploymentYears(), dti, lti,
                rr.getRiskLevel(), rr.getDefaultProbability() * 100,
                rr.getConfidenceLevel(), rr.getRlAction()
            );
        }).orElse("No risk assessment on file yet. User has not submitted a loan application.");
    }

    private String buildKnowledgeContext(List<KnowledgeEntry> entries) {
        if (entries.isEmpty()) return "No additional knowledge available.";
        StringBuilder sb = new StringBuilder();
        for (KnowledgeEntry e : entries) {
            sb.append("## ").append(e.getTitle()).append("\n").append(e.getContent()).append("\n\n");
        }
        return sb.toString();
    }

    /**
     * Seed the knowledge base with financial education content on first startup.
     */
    public void seedIfEmpty() {
        if (knowledgeRepo.count() > 0) return;

        log.info("Seeding knowledge base with financial education content...");

        List<Map<String, String>> entries = List.of(
            Map.of("title", "Debt-to-Income Ratio (DTI)", "category", "RISK_FACTOR",
                "content", "DTI measures your monthly debt payments as a percentage of your gross monthly income. A DTI below 20% is excellent and improves loan approval chances significantly. Between 20-30% is acceptable. Above 30% is high risk. To lower DTI, either increase income or reduce existing debts. RiskPilot considers DTI as a primary risk factor when adjusting interest rates."),
            Map.of("title", "Loan-to-Income Ratio (LTI)", "category", "RISK_FACTOR",
                "content", "LTI compares your total loan amount to your annual income. Lenders prefer LTI below 30%. A ratio above 40% signals the loan may be too large for your income level. To improve LTI, consider requesting a smaller loan amount or increasing your income sources before applying."),
            Map.of("title", "Default Probability", "category", "LOAN_EDUCATION",
                "content", "Default probability is the AI model's estimate of the likelihood that a borrower will fail to repay. Below 20% is low risk (GREEN). 20-40% is moderate risk (YELLOW). Above 40% is high risk (RED). Factors that increase default probability: high existing debt, low income, short employment history, and large loan amounts relative to income."),
            Map.of("title", "Improving Loan Approval Chances", "category", "FINANCIAL_PLANNING",
                "content", "Key steps to improve your loan approval: 1) Pay down existing debts to reduce DTI. 2) Build employment stability — at least 2+ years in the same job significantly improves scores. 3) Request a smaller loan amount (lower LTI). 4) Build emergency savings before applying. 5) Allow time between applications for the RL model to see improved financial behavior patterns."),
            Map.of("title", "Understanding Interest Rates", "category", "LOAN_EDUCATION",
                "content", "RiskPilot AI offers 3 interest rate tiers: Standard (8%) for low-risk profiles with DTI < 20% and default probability < 20%. Moderate (12%) for medium-risk profiles. High (16%) for higher-risk profiles. Admin officers can override rates during manual review. If your application goes to UNDER_REVIEW, a loan officer may approve at a lower rate than initially quoted."),
            Map.of("title", "Employment History Impact", "category", "RISK_FACTOR",
                "content", "Employment years is a key input to the Q-learning model. Under 1 year: high uncertainty signal. 1-3 years: moderate stability. 3+ years: strong stability indicator. The RL agent has learned that longer employment correlates strongly with loan repayment success. If you recently changed jobs, consider waiting 6-12 months before applying."),
            Map.of("title", "What is MANUAL_REVIEW?", "category", "LOAN_EDUCATION",
                "content", "MANUAL_REVIEW (UNDER_REVIEW status) means the AI model had medium or low confidence in its decision, or your risk profile has borderline metrics. A human loan officer will review your application. This is NOT a rejection. In many cases, UNDER_REVIEW applications get approved with personalized terms. Check your notifications for officer feedback."),
            Map.of("title", "What-If Simulator Guide", "category", "FINANCIAL_PLANNING",
                "content", "Use the What-If Simulator on the Risk Intelligence page to test scenarios without submitting a real application. Try: reducing your loan amount by 20%, paying off ₹50,000 of existing debt, or increasing your income to see how each factor changes your risk level and default probability. This helps you plan the optimal time to apply.")
        );

        for (Map<String, String> e : entries) {
            KnowledgeEntry entry = new KnowledgeEntry();
            entry.setTitle(e.get("title"));
            entry.setCategory(e.get("category"));
            entry.setContent(e.get("content"));

            // Generate embedding if Gemini is configured
            if (geminiService.isConfigured()) {
                List<Double> embedding = geminiService.embed(e.get("title") + ". " + e.get("content"));
                entry.setEmbedding(embedding);
            }

            knowledgeRepo.save(entry);
        }

        log.info("Knowledge base seeded with {} entries.", entries.size());
    }
}
