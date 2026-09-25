package com.loanguard.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Wraps Google Gemini REST API for:
 *  - text-embedding-004: generates 768-dim embeddings for vector search
 *  - gemini-2.0-flash: generates grounded LLM responses for the AI assistant
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String BASE = "https://generativelanguage.googleapis.com/v1beta";

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.embedding-model:text-embedding-004}")
    private String embeddingModel;

    @Value("${gemini.llm-model:gemini-2.5-flash}")
    private String llmModel;

    private final RestTemplate restTemplate;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Generate a 768-dimensional embedding for the given text.
     */
    @SuppressWarnings("unchecked")
    public List<Double> embed(String text) {
        if (!isConfigured()) {
            log.warn("GEMINI_API_KEY not set — embedding skipped");
            return List.of();
        }

        String url = BASE + "/models/" + embeddingModel + ":embedContent?key=" + apiKey;
        Map<String, Object> body = Map.of(
            "model", "models/" + embeddingModel,
            "content", Map.of("parts", List.of(Map.of("text", text)))
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);
            HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, req, Map.class);

            Map<String, Object> embeddingData = (Map<String, Object>) response.getBody().get("embedding");
            List<Double> values = (List<Double>) embeddingData.get("values");
            return values;
        } catch (Exception e) {
            log.error("Gemini embedding failed: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Generate a personalized financial guidance response using Gemini LLM.
     */
    @SuppressWarnings("unchecked")
    public String generateAnswer(String systemPrompt, String userQuestion) {
        if (!isConfigured()) {
            return "AI assistant is not configured. Please set GEMINI_API_KEY.";
        }

        String url = BASE + "/models/" + llmModel + ":generateContent?key=" + apiKey;
        Map<String, Object> body = Map.of(
            "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
            "contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userQuestion))
            )),
            "generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 512
            )
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);
            HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, req, Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return String.valueOf(parts.get(0).get("text"));
        } catch (Exception e) {
            log.error("Gemini LLM call failed: {}", e.getMessage());
            return "I'm having trouble generating a response right now. Please try again.";
        }
    }
}
