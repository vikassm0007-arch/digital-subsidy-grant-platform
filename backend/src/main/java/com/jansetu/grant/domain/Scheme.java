package com.jansetu.grant.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.*;

@Entity @Table(name="schemes")
public class Scheme {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(unique=true, nullable=false) private String code;
  private String title;
  @Column(length=1500) private String description;
  private BigDecimal grantAmount, maxIncomeLimit;
  @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="scheme_categories") private Set<String> allowedCategories = new HashSet<>();
  @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="scheme_documents") private Set<String> requiredDocuments = new LinkedHashSet<>();
  public Long getId(){return id;} public void setId(Long v){id=v;} public String getCode(){return code;} public void setCode(String v){code=v;} public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public BigDecimal getGrantAmount(){return grantAmount;} public void setGrantAmount(BigDecimal v){grantAmount=v;} public BigDecimal getMaxIncomeLimit(){return maxIncomeLimit;} public void setMaxIncomeLimit(BigDecimal v){maxIncomeLimit=v;} public Set<String> getAllowedCategories(){return allowedCategories;} public void setAllowedCategories(Set<String> v){allowedCategories=v;} public Set<String> getRequiredDocuments(){return requiredDocuments;} public void setRequiredDocuments(Set<String> v){requiredDocuments=v;}
}
