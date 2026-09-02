package com.subsidysystem.controller;

import com.subsidysystem.entity.Beneficiary;
import com.subsidysystem.repository.BeneficiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
@RequiredArgsConstructor
public class BeneficiaryController {

    private final BeneficiaryRepository beneficiaryRepository;


    @GetMapping
    public ResponseEntity<List<Beneficiary>> getAllBeneficiaries() {
        List<Beneficiary> beneficiaries = beneficiaryRepository.findAll();
        return ResponseEntity.ok(beneficiaries);
    }


    @PostMapping
    public ResponseEntity<Beneficiary> createBeneficiary(@RequestBody Beneficiary beneficiary) {
        Beneficiary savedBeneficiary = beneficiaryRepository.save(beneficiary);
        return ResponseEntity.ok(savedBeneficiary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Beneficiary> updateBeneficiary(
            @PathVariable Long id,
            @RequestBody Beneficiary updatedDetails) {

        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Beneficiary not found with ID: " + id));


        beneficiary.setDateOfBirth(updatedDetails.getDateOfBirth());
        beneficiary.setAnnualIncome(updatedDetails.getAnnualIncome());
        beneficiary.setCategory(updatedDetails.getCategory());
        beneficiary.setIsStateResident(updatedDetails.getIsStateResident());
        beneficiary.setLandHoldingInAcres(updatedDetails.getLandHoldingInAcres());

        Beneficiary savedBeneficiary = beneficiaryRepository.save(beneficiary);
        return ResponseEntity.ok(savedBeneficiary);
    }
}
