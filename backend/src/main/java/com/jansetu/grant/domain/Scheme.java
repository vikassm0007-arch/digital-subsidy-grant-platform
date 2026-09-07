package com.jansetu.grant.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity 
@Table(name="schemes")
public class Scheme {
  @Id 
  @GeneratedValue(strategy=GenerationType.IDENTITY) 
  private Long id;

  @Column(name="scheme_code", unique=true, nullable=false) 
  private String code;

  @Column(name="scheme_name", nullable=false) 
  private String title;

  @Column(columnDefinition="TEXT") 
  private String description;

  @Column(name="grant_amount") 
  private String grantAmount;

  @Column(name="max_income_limit") 
  private BigDecimal maxIncomeLimit;

  private String category;

  @Column(name="eligible_categories") 
  private String eligibleCategories;

  @Column(name="min_age") 
  private Integer minAge;

  @Column(name="max_age") 
  private Integer maxAge;

  @Column(name="required_documents", columnDefinition="TEXT") 
  private String requiredDocuments;

  public Long getId() { return id; } 
  public void setId(Long v) { id = v; } 

  public String getCode() { return code; } 
  public void setCode(String v) { code = v; } 

  public String getTitle() { return title; } 
  public void setTitle(String v) { title = v; } 

  public String getDescription() { return description; } 
  public void setDescription(String v) { description = v; } 

  public String getGrantAmount() { return grantAmount; } 
  public void setGrantAmount(String v) { grantAmount = v; } 

  public BigDecimal getMaxIncomeLimit() { return maxIncomeLimit; } 
  public void setMaxIncomeLimit(BigDecimal v) { maxIncomeLimit = v; } 

  public String getCategory() { return category; } 
  public void setCategory(String v) { category = v; }

  public String getEligibleCategories() { return eligibleCategories; } 
  public void setEligibleCategories(String v) { eligibleCategories = v; }

  public Integer getMinAge() { return minAge; } 
  public void setMinAge(Integer v) { minAge = v; }

  public Integer getMaxAge() { return maxAge; } 
  public void setMaxAge(Integer v) { maxAge = v; }

  public String getRequiredDocuments() { return requiredDocuments; } 
  public void setRequiredDocuments(String v) { requiredDocuments = v; }
}
