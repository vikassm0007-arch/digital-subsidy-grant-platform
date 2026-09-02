package com.subsidysystem.entity;

public record EligibilityResult(
        boolean isEligible,
        double score,
        String remarks
) {
}
