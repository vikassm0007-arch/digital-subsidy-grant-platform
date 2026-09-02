package com.jansetu.grant.repo;
import com.jansetu.grant.domain.Beneficiary;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class DemoBeneficiarySeed {
  @Bean CommandLineRunner seedDemoBeneficiary(BeneficiaryRepository beneficiaries) {
    return args -> {
      if (beneficiaries.findByMobileOrAadhaarNo("9876543210", "9876543210").isPresent()) return;
      Beneficiary b = new Beneficiary(); b.setName("Asha Ramesh Patil"); b.setMobile("9876543210"); b.setAadhaarNo("XXXX XXXX 4812"); b.setCategory("OBC"); b.setAnnualIncome(BigDecimal.valueOf(180000)); b.setBankAccount("245710003456"); b.setIfscCode("SBIN0000456"); b.setDistrict("Pune"); b.setState("Maharashtra"); beneficiaries.save(b);
    };
  }
}
