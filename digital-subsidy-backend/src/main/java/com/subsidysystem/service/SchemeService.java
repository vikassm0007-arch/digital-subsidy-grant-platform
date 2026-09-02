package com.subsidysystem.service;

import com.subsidysystem.entity.Beneficiary;
import com.subsidysystem.entity.EligibilityResult;
import com.subsidysystem.entity.Scheme;

public interface SchemeService {

    EligibilityResult evaluateEligibility(Beneficiary beneficiary, Scheme scheme);
}
