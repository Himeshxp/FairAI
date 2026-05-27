package com.project.fairai.api;

import com.project.fairai.model.AiBiasResponse;
import com.project.fairai.service.AiBiasAnalysisService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnalysisController {

    private final AiBiasAnalysisService aiBiasAnalysisService;

    public AnalysisController(AiBiasAnalysisService aiBiasAnalysisService) {
        this.aiBiasAnalysisService = aiBiasAnalysisService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @PostMapping(value = "/analyze-csv-ai", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AiBiasResponse analyzeCsvWithAi(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required.");
        }

        String csvText = new String(file.getBytes(), StandardCharsets.UTF_8);
        return aiBiasAnalysisService.analyzeCsvWithAi(csvText);
    }
}
