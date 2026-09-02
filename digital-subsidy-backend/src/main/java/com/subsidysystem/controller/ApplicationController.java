package com.subsidysystem.controller;

import com.subsidysystem.dto.ApplicationRequest;
import com.subsidysystem.entity.Application;
import com.subsidysystem.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<Application> submitApplication(
            @RequestBody ApplicationRequest request) {

        Application application =
                applicationService.submitApplication(request);

        return new ResponseEntity<>(
                application,
                HttpStatus.CREATED
        );
    }
}
