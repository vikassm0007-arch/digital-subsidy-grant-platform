package com.subsidysystem.service.impl;

import com.subsidysystem.entity.Beneficiary;
import com.subsidysystem.entity.EligibilityResult;
import com.subsidysystem.entity.Scheme;
import com.subsidysystem.service.SchemeService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;

@Service("farmerService")
public class FarmerIncomeSupportServiceImpl implements SchemeService {



    @Override
    public EligibilityResult evaluateEligibility(Beneficiary beneficiary, Scheme scheme) {

        int totalCriteria = 5; // Updated to include land holding criteria
        int passedCriteria = 0;
        StringBuilder remarks = new StringBuilder();

        // 1. Age Verification
        int age = Period.between(beneficiary.getDateOfBirth(), LocalDate.now()).getYears();
        if (age >= scheme.getMinAge() && age <= scheme.getMaxAge()) {
            passedCriteria++;
        } else {
            remarks.append(String.format("Age %d out of valid range [%d-%d]. ", age, scheme.getMinAge(), scheme.getMaxAge()));
        }

        // 2. Income Verification
        if (beneficiary.getAnnualIncome() <= scheme.getMaxAnnualIncome()) {
            passedCriteria++;
        } else {
            remarks.append(String.format("Annual income %.2f exceeds limit %.2f. ", beneficiary.getAnnualIncome(), scheme.getMaxAnnualIncome()));
        }

        // 3. Category Match
        if (beneficiary.getCategory().equalsIgnoreCase(scheme.getTargetCategory())) {
            passedCriteria++;
        } else {
            remarks.append(String.format("Category '%s' does not match target '%s'. ", beneficiary.getCategory(), scheme.getTargetCategory()));
        }

        //
        if (!scheme.isRequiresStateResidency() || Boolean.TRUE.equals(beneficiary.getIsStateResident())) {
            passedCriteria++;
        } else {
            remarks.append("State residency requirement not met. ");
        }

        //
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
