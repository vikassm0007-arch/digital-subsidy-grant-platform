package com.jansetu.grant.repo;
import com.jansetu.grant.domain.*; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
interface BeneficiaryRepository extends JpaRepository<Beneficiary,Long>{ Optional<Beneficiary> findByMobileOrAadhaarNo(String mobile,String aadhaarNo); }
interface SchemeRepository extends JpaRepository<Scheme,Long>{}
interface GrantRequestRepository extends JpaRepository<GrantRequest,Long>{ List<GrantRequest> findByBeneficiaryIdOrderByAppliedDateDesc(Long id); boolean existsByBeneficiaryIdAndSchemeId(Long b,Long s); }
interface DisbursementStageRepository extends JpaRepository<DisbursementStage,Long>{ List<DisbursementStage> findByApplicationIdOrderByStageNumber(Long id); }
