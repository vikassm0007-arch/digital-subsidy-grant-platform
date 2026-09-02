package com.subsidysystem.controller;

import com.subsidysystem.dto.FarmerEvaluationRequest;
import com.subsidysystem.entity.EligibilityResult;
import com.subsidysystem.entity.Scheme;
import com.subsidysystem.repository.SchemeRepository;
import com.subsidysystem.service.SchemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes/farmer")
@RequiredArgsConstructor
public class FarmerIncomeSupportController {

    @Qualifier("farmerService")
    private final SchemeService schemeService;

    private final SchemeRepository schemeRepository;

    // 1. CREATE SCHEME
    @PostMapping("/create-scheme")
    public ResponseEntity<Scheme> createScheme(@RequestBody Scheme scheme) {

        Scheme savedScheme = schemeRepository.save(scheme);

        return new ResponseEntity<>(
                savedScheme,
                HttpStatus.CREATED
        );
    }

    // 2. GET ALL SCHEMES
    @GetMapping
    public ResponseEntity<List<Scheme>> getAllSchemes() {

        List<Scheme> schemes = schemeRepository.findAll();

        return ResponseEntity.ok(schemes);
    }

    // 3. GET SCHEME BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Scheme> getSchemeById(
            @PathVariable Long id) {

        Scheme scheme = schemeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Scheme not found"));

        return ResponseEntity.ok(scheme);
    }

    // 4. UPDATE SCHEME
    @PutMapping("/{id}")
    public ResponseEntity<Scheme> updateScheme(
            @PathVariable Long id,
            @RequestBody Scheme updatedScheme) {

        Scheme existingScheme = schemeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Scheme not found"));

        existingScheme.setSchemeName(updatedScheme.getSchemeName());
        existingScheme.setTargetCategory(updatedScheme.getTargetCategory());
        existingScheme.setMinAge(updatedScheme.getMinAge());
        existingScheme.setMaxAge(updatedScheme.getMaxAge());
        existingScheme.setMaxAnnualIncome(
                updatedScheme.getMaxAnnualIncome()
        );
        existingScheme.setRequiresStateResidency(
                updatedScheme.isRequiresStateResidency()
        );

        Scheme savedScheme =
                schemeRepository.save(existingScheme);

        return ResponseEntity.ok(savedScheme);
    }

    // 5. DELETE SCHEME
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteScheme(
            @PathVariable Long id) {

        if (!schemeRepository.existsById(id)) {
            throw new RuntimeException("Scheme not found");
        }

        schemeRepository.deleteById(id);

        return ResponseEntity.ok(
                "Scheme deleted successfully"
        );
    }

    // 6. EVALUATE FARMER ELIGIBILITY
    @PostMapping("/evaluate")
    public ResponseEntity<EligibilityResult> evaluateFarmerEligibility(
            @RequestBody FarmerEvaluationRequest request) {

        Scheme scheme = schemeRepository.findById(
                request.getSchemeId()
        ).orElseThrow(() ->
                new RuntimeException("Scheme not found"));

        EligibilityResult result =
                schemeService.evaluateEligibility(
                        request.getBeneficiary(),
                        scheme
                );

        return ResponseEntity.ok(result);
    }
}