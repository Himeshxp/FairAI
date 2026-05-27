package com.project.fairai.model;

import java.util.List;

public record AiBiasResponse(
    int biasScore,
    String verdict,
    int confidence,
    String summary,
    List<String> findings,
    List<String> recommendations
) {
}
