package com.jansetu.grant.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "beneficiaries")
public class Beneficiary {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable=false) private String name;
  @Column(unique=true) private String mobile;
  @Column(unique=true) private String aadhaarNo;
  private String category;
  private BigDecimal annualIncome;
  private String bankAccount, ifscCode, district, state;
  public Long getId(){return id;} public void setId(Long v){id=v;} public String getName(){return name;} public void setName(String v){name=v;} public String getMobile(){return mobile;} public void setMobile(String v){mobile=v;} public String getAadhaarNo(){return aadhaarNo;} public void setAadhaarNo(String v){aadhaarNo=v;} public String getCategory(){return category;} public void setCategory(String v){category=v;} public BigDecimal getAnnualIncome(){return annualIncome;} public void setAnnualIncome(BigDecimal v){annualIncome=v;} public String getBankAccount(){return bankAccount;} public void setBankAccount(String v){bankAccount=v;} public String getIfscCode(){return ifscCode;} public void setIfscCode(String v){ifscCode=v;} public String getDistrict(){return district;} public void setDistrict(String v){district=v;} public String getState(){return state;} public void setState(String v){state=v;}
}
