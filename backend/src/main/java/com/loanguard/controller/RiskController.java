package com.loanguard.controller;

import com.loanguard.dto.AskRequest;
import com.loanguard.dto.SimulateRequest;
import com.loanguard.model.User;
import com.loanguard.service.AuthService;
import com.loanguard.service.KnowledgeService;
import com.loanguard.service.RiskIntelligenceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Risk Intelligence API
 *
 * POST  /api/risk/simulate  - What-if simulation via RL engine
 * GET   /api/risk/history   - Assessment + simulation history
 * POST  /api/risk/ask       - AI financial guidance (Gemini + Vector Search)
 */
@RestController
@RequestMapping("/api/risk")
public class RiskController {

    private final AuthService authService;
    private final RiskIntelligenceService riskService;
    private final KnowledgeService knowledgeService;

    public RiskController(AuthService authService,
                          RiskIntelligenceService riskService,
                          KnowledgeService knowledgeService) {
        this.authService     = authService;
        this.riskService     = riskService;
        this.knowledgeService = knowledgeService;
    }

    /**
     * Run a hypothetical scenario through the RL engine without creating a real loan.
     */
    @PostMapping("/simulate")
    public ResponseEntity<Map<String, Object>> simulate(
            @RequestHeader("Authorization") String auth,
            @Valid @RequestBody SimulateRequest req) {
        User user = authService.validateToken(auth);
        Map<String, Object> result = riskService.simulate(user, req);
        return ResponseEntity.ok(result);
    }

    /**
     * Get the user's full risk assessment + simulation history, sorted newest first.
     */
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> history(
            @RequestHeader("Authorization") String auth) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(riskService.getHistory(user.getId()));
    }

    /**
     * Ask the AI financial guidance assistant a question.
     * Uses Atlas Vector Search + Gemini LLM, grounded in user's financial profile.
     */
    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> ask(
            @RequestHeader("Authorization") String auth,
            @Valid @RequestBody AskRequest req) {
        User user = authService.validateToken(auth);
        String answer = knowledgeService.ask(user.getId(), req.question());
        return ResponseEntity.ok(Map.of("answer", answer, "question", req.question()));
    }
}
