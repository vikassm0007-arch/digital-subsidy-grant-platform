package com.subsidysystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "schemes")
public class Scheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scheme_code", unique = true, nullable = false)
    private String schemeCode;

    @Column(name = "scheme_name", nullable = false)
    private String schemeName;

    private String category;
    
    @Column(name = "grant_amount")
    private String grantAmount;

    @Column(name = "max_income_limit")
    private BigDecimal maxIncomeLimit;

    @Column(name = "eligible_categories")
    private String eligibleCategories;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @Column(name = "required_documents", columnDefinition = "TEXT")
    private String requiredDocuments;

    @Column(columnDefinition = "TEXT")
    private String description;
}
