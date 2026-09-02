package com.subsidysystem.service.impl;

import com.subsidysystem.dto.ApplicationRequest;
import com.subsidysystem.entity.Application;
import com.subsidysystem.entity.Beneficiary;
import com.subsidysystem.entity.EligibilityResult;
import com.subsidysystem.entity.Scheme;
import com.subsidysystem.repository.ApplicationRepository;
import com.subsidysystem.repository.BeneficiaryRepository;
import com.subsidysystem.repository.SchemeRepository;
import com.subsidysystem.service.ApplicationService;
import com.subsidysystem.service.SchemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final SchemeRepository schemeRepository;
    private final SchemeService schemeService;

    @Override
    public Application submitApplication(ApplicationRequest request) {

        // Find beneficiary
        Beneficiary beneficiary = beneficiaryRepository
                .findById(request.getBeneficiaryId())
                .orElseThrow(() ->
                        new RuntimeException("Beneficiary not found"));

        // Find scheme
        Scheme scheme = schemeRepository
                .findById(request.getSchemeId())
                .orElseThrow(() ->
                        new RuntimeException("Scheme not found"));

        // Calculate eligibility
        EligibilityResult result =
                schemeService.evaluateEligibility(beneficiary, scheme);

        // Create application
        Application application = new Application();

        application.setBeneficiary(beneficiary);
        application.setScheme(scheme);
        application.setEligibilityScore(result.score());
        application.setEligible(result.isEligible());
        application.setRemarks(result.remarks());

        // Set application status
        if (result.isEligible()) {
            application.setStatus("ELIGIBLE");
        } else {
            application.setStatus("NOT_ELIGIBLE");
        }

        // Save application
        return applicationRepository.save(application);
    }
}