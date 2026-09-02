package com.jansetu.grant.domain;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity @Table(name="grant_applications")
public class GrantRequest {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Beneficiary beneficiary; @ManyToOne(optional=false) private Scheme scheme;
 @Enumerated(EnumType.STRING) private ApplicationStatus status; private BigDecimal appliedAmount; private LocalDate appliedDate;
 public Long getId(){return id;} public Beneficiary getBeneficiary(){return beneficiary;} public void setBeneficiary(Beneficiary v){beneficiary=v;} public Scheme getScheme(){return scheme;} public void setScheme(Scheme v){scheme=v;} public ApplicationStatus getStatus(){return status;} public void setStatus(ApplicationStatus v){status=v;} public BigDecimal getAppliedAmount(){return appliedAmount;} public void setAppliedAmount(BigDecimal v){appliedAmount=v;} public LocalDate getAppliedDate(){return appliedDate;} public void setAppliedDate(LocalDate v){appliedDate=v;}
}
