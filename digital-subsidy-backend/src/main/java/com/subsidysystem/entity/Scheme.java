package com.subsidysystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "schemes")
public class Scheme {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String schemeName;
    private String targetCategory;
    private int minAge;
    private int maxAge;
    private double maxAnnualIncome;
    private boolean requiresStateResidency;


}
