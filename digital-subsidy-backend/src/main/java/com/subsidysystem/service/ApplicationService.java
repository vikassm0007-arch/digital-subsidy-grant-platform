package com.subsidysystem.service;

import com.subsidysystem.dto.ApplicationRequest;
import com.subsidysystem.entity.Application;

public interface ApplicationService {

    Application submitApplication(ApplicationRequest request);
}