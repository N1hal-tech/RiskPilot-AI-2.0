package com.loanguard.service;

import com.loanguard.dto.RLDecisionResponse;
import com.loanguard.dto.SimulateRequest;
import com.loanguard.model.*;
import com.loanguard.repository.AssessmentRepository;
import com.loanguard.repository.SimulationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RiskIntelligenceService {

    private static final Logger log = LoggerFactory.getLogger(RiskIntelligenceService.class);

    private final AssessmentRepository assessmentRepo;
    private final SimulationRepository simulationRepo;
    private final RLClientService rlClient;

    public RiskIntelligenceService(AssessmentRepository assessmentRepo,
                                   SimulationRepository simulationRepo,
                                   RLClientService rlClient) {
        this.assessmentRepo  = assessmentRepo;
        this.simulationRepo  = simulationRepo;
        this.rlClient        = rlClient;
    }

    /**
     * Called by LoanService after a successful loan save.
     * Persists an Assessment document for the risk history feed.
     */
    public void persistAssessment(User user, LoanApplication saved,
                                  RLDecisionResponse rl, RiskLevel riskLevel, double adjustedRate) {
        try {
            FinancialProfile fp = new FinancialProfile(
                    saved.getAnnualIncome(), saved.getExistingDebt(), saved.getLoanAmount(),
                    saved.getEmploymentYears(), saved.getLoanTermMonths(), saved.getLoanPurpose());

            RiskResultDoc rr = new RiskResultDoc(
                    riskLevel.name(), rl.defaultProbability(), rl.confidenceLevel(),
                    adjustedRate, rl.action(), saved.getAdvisoryMessage());

            Assessment assessment = new Assessment();
            assessment.setUserId(user.getId());
            assessment.setLoanRef(saved.getApplicationRef());
            assessment.setLoanId(saved.getId());
            assessment.setFinancialProfile(fp);
            assessment.setRiskResult(rr);
            assessment.setCreatedAt(Instant.now());

            assessmentRepo.save(assessment);
        } catch (Exception e) {
            log.error("Failed to persist Assessment for loan {}: {}", saved.getId(), e.getMessage());
            throw e; // MongoDB is primary — propagate the failure
        }
    }

    /**
     * Run a what-if simulation via the RL engine without creating a real loan application.
     */
    public Map<String, Object> simulate(User user, SimulateRequest req) {
        RLDecisionResponse rl = rlClient.decide(
                req.annualIncome(), req.loanAmount(), req.existingDebt(), req.employmentYears());

        String riskLevel = rl.defaultProbability() < 0.3 ? "GREEN" :
                           rl.defaultProbability() < 0.5 ? "YELLOW" : "RED";

        FinancialProfile scenario = new FinancialProfile(
                req.annualIncome(), req.existingDebt(), req.loanAmount(),
                req.employmentYears(),
                req.loanTermMonths() != null ? req.loanTermMonths() : 36,
                req.loanPurpose());

        RiskResultDoc result = new RiskResultDoc(
                riskLevel, rl.defaultProbability(), rl.confidenceLevel(),
                rl.interestRate(), rl.action(), rl.advisoryMessage());

        Simulation sim = new Simulation();
        sim.setUserId(user.getId());
        sim.setBaseAssessmentId(req.baseAssessmentId());
        sim.setScenario(scenario);
        sim.setResult(result);
        sim.setCreatedAt(Instant.now());

        Simulation saved = simulationRepo.save(sim);

        double dti = req.existingDebt() / req.annualIncome() * 100.0;
        double lti = req.loanAmount()   / req.annualIncome() * 100.0;

        Map<String, Object> res = new java.util.HashMap<>();
        res.put("simulationId",       saved.getId());
        res.put("riskLevel",          riskLevel);
        res.put("defaultProbability", rl.defaultProbability());
        res.put("confidenceLevel",    rl.confidenceLevel());
        res.put("offeredInterestRate", rl.interestRate());
        res.put("rlAction",           rl.action());
        res.put("advisoryMessage",    rl.advisoryMessage());
        res.put("dti",                dti);
        res.put("lti",                lti);
        res.put("qValues",            rl.qValues());
        res.put("needsAdminReview",   rl.needsAdminReview());
        res.put("createdAt",          saved.getCreatedAt().toString());
        return res;
    }

    /**
     * Returns the user's assessment + simulation history, interleaved and sorted by date.
     */
    public List<Map<String, Object>> getHistory(String userId) {
        List<Map<String, Object>> items = new ArrayList<>();

        assessmentRepo.findByUserIdOrderByCreatedAtDesc(userId).forEach(a -> items.add(Map.of(
            "type",               "ACTUAL",
            "id",                  a.getId(),
            "loanRef",             a.getLoanRef() != null ? a.getLoanRef() : "",
            "financialProfile",    profileToMap(a.getFinancialProfile()),
            "riskResult",          resultToMap(a.getRiskResult()),
            "createdAt",           a.getCreatedAt().toString()
        )));

        simulationRepo.findByUserIdOrderByCreatedAtDesc(userId).forEach(s -> items.add(Map.of(
            "type",               "SIMULATION",
            "id",                  s.getId(),
            "baseAssessmentId",    s.getBaseAssessmentId() != null ? s.getBaseAssessmentId() : "",
            "financialProfile",    profileToMap(s.getScenario()),
            "riskResult",          resultToMap(s.getResult()),
            "createdAt",           s.getCreatedAt().toString()
        )));

        items.sort((a, b) -> b.get("createdAt").toString().compareTo(a.get("createdAt").toString()));
        return items;
    }

    private Map<String, Object> profileToMap(FinancialProfile p) {
        if (p == null) return Map.of();
        return Map.of(
            "annualIncome",    p.getAnnualIncome()    != null ? p.getAnnualIncome()    : 0,
            "existingDebt",    p.getExistingDebt()    != null ? p.getExistingDebt()    : 0,
            "loanAmount",      p.getLoanAmount()      != null ? p.getLoanAmount()      : 0,
            "employmentYears", p.getEmploymentYears() != null ? p.getEmploymentYears() : 0,
            "loanTermMonths",  p.getLoanTermMonths()  != null ? p.getLoanTermMonths()  : 36,
            "loanPurpose",     p.getLoanPurpose()     != null ? p.getLoanPurpose()     : ""
        );
    }

    private Map<String, Object> resultToMap(RiskResultDoc r) {
        if (r == null) return Map.of();
        return Map.of(
            "riskLevel",           r.getRiskLevel()          != null ? r.getRiskLevel()          : "",
            "defaultProbability",  r.getDefaultProbability() != null ? r.getDefaultProbability() : 0,
            "confidenceLevel",     r.getConfidenceLevel()    != null ? r.getConfidenceLevel()    : "",
            "offeredInterestRate", r.getOfferedInterestRate() != null ? r.getOfferedInterestRate() : 0,
            "rlAction",            r.getRlAction()            != null ? r.getRlAction()            : "",
            "advisoryMessage",     r.getAdvisoryMessage()    != null ? r.getAdvisoryMessage()    : ""
        );
    }
}
