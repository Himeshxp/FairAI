package com.project.fairai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.project.fairai.model.AiBiasResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiBiasAnalysisService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${openai.api.key:sk-replace-this-with-your-real-key}")
    private String apiKey;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    public AiBiasAnalysisService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();
    }

    public AiBiasResponse analyzeCsvWithAi(String csvText) {
        if (csvText == null || csvText.isBlank()) {
            throw new IllegalArgumentException("Uploaded CSV is empty.");
        }
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("replace-this")) {
            throw new IllegalArgumentException("AI API key is not configured. Set openai.api.key in backend application.properties.");
        }

        String trimmedCsv = csvText.length() > 12000 ? csvText.substring(0, 12000) : csvText;

        try {
            String prompt = "You are a fairness auditor. Analyze the following CSV dataset for any form of potential bias or unfairness across demographics, groups, categories, outcomes, scores, or approvals. "
                + "Return STRICT JSON only with keys: biasScore (0-100 integer), verdict (string), confidence (0-100 integer), summary (string), findings (array of strings), recommendations (array of strings). "
                + "If no clear bias is found, still explain what was checked. CSV:\n" + trimmedCsv;

            ObjectNode payloadNode = objectMapper.createObjectNode();
            payloadNode.put("model", model);
            payloadNode.set("messages", objectMapper.createArrayNode()
                .add(objectMapper.createObjectNode().put("role", "system").put("content", "You are a strict JSON-only assistant."))
                .add(objectMapper.createObjectNode().put("role", "user").put("content", prompt)));
            payloadNode.put("temperature", 0.2);
            String payload = payloadNode.toString();

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
                .timeout(Duration.ofSeconds(60))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new IllegalArgumentException("AI API request failed with status " + response.statusCode() + ".");
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("").trim();
            if (content.isBlank()) {
                throw new IllegalArgumentException("AI returned empty analysis.");
            }

            String cleanJson = content.replace("```json", "").replace("```", "").trim();
            JsonNode ai = objectMapper.readTree(cleanJson);

            int biasScore = clamp(ai.path("biasScore").asInt(0));
            int confidence = clamp(ai.path("confidence").asInt(0));
            String verdict = ai.path("verdict").asText("Unknown");
            String summary = ai.path("summary").asText("No summary provided.");

            List<String> findings = toList(ai.path("findings"));
            List<String> recommendations = toList(ai.path("recommendations"));

            if (findings.isEmpty()) {
                findings.add("No detailed findings were returned by the AI.");
            }
            if (recommendations.isEmpty()) {
                recommendations.add("Review data collection and labeling quality for fairness checks.");
            }

            return new AiBiasResponse(biasScore, verdict, confidence, summary, findings, recommendations);
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Failed to analyze CSV using AI API.");
        }
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }

    private List<String> toList(JsonNode node) {
        List<String> output = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(n -> {
                if (n != null && !n.asText().isBlank()) {
                    output.add(n.asText());
                }
            });
        }
        return output;
    }
}
