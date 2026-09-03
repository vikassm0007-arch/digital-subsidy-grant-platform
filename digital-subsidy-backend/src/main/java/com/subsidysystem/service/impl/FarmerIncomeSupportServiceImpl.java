package com.subsidysystem.service.impl;

import com.subsidysystem.entity.Beneficiary;
import com.subsidysystem.entity.EligibilityResult;
import com.subsidysystem.entity.Scheme;
import com.subsidysystem.service.SchemeService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

@Service("farmerService")
public class FarmerIncomeSupportServiceImpl implements SchemeService {

    @Override
    public EligibilityResult evaluateEligibility(Beneficiary beneficiary, Scheme scheme) {

        int totalCriteria = 5;
        int passedCriteria = 0;
        StringBuilder remarks = new StringBuilder();

        // 1. Age Verification
        int minAge = scheme.getMinAge() != null ? scheme.getMinAge() : 18;
        int maxAge = scheme.getMaxAge() != null ? scheme.getMaxAge() : 70;
        int age = Period.between(beneficiary.getDateOfBirth(), LocalDate.now()).getYears();
        if (age >= minAge && age <= maxAge) {
            passedCriteria++;
        } else {
            remarks.append(String.format("Age %d out of valid range [%d-%d]. ", age, minAge, maxAge));
        }

        // 2. Income Verification
        BigDecimal maxIncome = scheme.getMaxIncomeLimit() != null ? scheme.getMaxIncomeLimit() : BigDecimal.valueOf(1000000);
        BigDecimal beneficiaryIncome = BigDecimal.valueOf(beneficiary.getAnnualIncome());
        if (beneficiaryIncome.compareTo(maxIncome) <= 0) {
            passedCriteria++;
        } else {
            remarks.append(String.format("Annual income %.2f exceeds limit %.2f. ", beneficiary.getAnnualIncome(), maxIncome.doubleValue()));
        }

        // 3. Category Match
        String eligibleCategories = scheme.getEligibleCategories() != null ? scheme.getEligibleCategories() : "ALL";
        if (eligibleCategories.equalsIgnoreCase("ALL") || eligibleCategories.toLowerCase().contains(beneficiary.getCategory().toLowerCase())) {
            passedCriteria++;
        } else {
            remarks.append(String.format("Category '%s' does not match eligible '%s'. ", beneficiary.getCategory(), eligibleCategories));
        }

        // 4. State Residency
        if (Boolean.TRUE.equals(beneficiary.getIsStateResident())) {
            passedCriteria++;
        } else {
            remarks.append("State residency requirement not met. ");
        }

        // 5. Land Holding Check
        if (beneficiary.getLandHoldingInAcres() > 0.0 && beneficiary.getLandHoldingInAcres() <= 5.0) {
            passedCriteria++;
        } else {
            remarks.append("Land holding size is outside the eligible farmer bracket (0 to 5 acres). ");
        }

        double score = ((double) passedCriteria / totalCriteria) * 100.0;
        boolean isEligible = (passedCriteria == totalCriteria);

        if (isEligible) {
            remarks.append("Farmer income support and land criteria verified successfully.");
        }

        return new EligibilityResult(isEligible, score, remarks.toString().trim());
    }
}
