package com.subsidysystem.dto;

import com.subsidysystem.entity.Beneficiary;
import com.subsidysystem.entity.Scheme;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class FarmerEvaluationRequest {

    private Beneficiary beneficiary;
    private Long schemeId;
}
