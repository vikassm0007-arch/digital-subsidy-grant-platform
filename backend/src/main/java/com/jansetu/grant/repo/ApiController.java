package com.jansetu.grant.repo;

import com.jansetu.grant.domain.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal; 
import java.time.LocalDate; 
import java.util.*;

@RestController 
@RequestMapping("/api/v1") 
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ApiController {
 private final BeneficiaryRepository beneficiaries; 
 private final SchemeRepository schemes; 
 private final GrantRequestRepository applications; 
 private final DisbursementStageRepository stages;

 ApiController(BeneficiaryRepository b, SchemeRepository s, GrantRequestRepository a, DisbursementStageRepository d) {
   beneficiaries = b; 
   schemes = s; 
   applications = a; 
   stages = d;
 }

 @PostMapping("/auth/login") 
 public LoginResponse login(@Valid @RequestBody LoginBody body) {
   Beneficiary b = beneficiaries.findByMobileOrAadhaarNo(body.identifier(), body.identifier())
     .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beneficiary not found. Use demo account or complete profile.")); 
   return new LoginResponse(b.getId(), b.getName(), b.getMobile(), b.getAadhaarNo());
 }

 @PostMapping("/beneficiaries/profile") 
 public Beneficiary saveProfile(@RequestBody ProfileBody p) {
   Beneficiary b = p.id() == null ? new Beneficiary() : beneficiaries.findById(p.id()).orElse(new Beneficiary()); 
   applyProfile(b, p); 
   return beneficiaries.save(b);
 }

 @GetMapping("/schemes") 
 public List<SchemeResponse> allSchemes() {
   return schemes.findAll().stream().map(SchemeResponse::of).toList();
 }

 @PostMapping("/schemes/{id}/validate-criteria") 
 public EligibleResponse validate(@PathVariable Long id, @RequestBody ValidationBody body) {
   Scheme s = scheme(id); 
   Beneficiary b = beneficiary(body.beneficiaryId()); 
   boolean income = b.getAnnualIncome() != null && s.getMaxIncomeLimit() != null && b.getAnnualIncome().compareTo(s.getMaxIncomeLimit()) <= 0; 
   
   List<String> allowed = s.getEligibleCategories() != null ? Arrays.asList(s.getEligibleCategories().split(",")) : List.of("All");
   boolean category = allowed.contains("All") || allowed.contains("ALL") || (b.getCategory() != null && allowed.contains(b.getCategory())); 
   
   List<String> reqDocs = s.getRequiredDocuments() != null ? Arrays.asList(s.getRequiredDocuments().split(",")) : List.of();
   Set<String> provided = body.documents() == null ? Set.of() : body.documents(); 
   List<String> missing = reqDocs.stream().map(String::trim).filter(x -> !provided.contains(x)).toList(); 
   
   return new EligibleResponse(
     income && category, 
     income, 
     category, 
     s.getMaxIncomeLimit(), 
     allowed, 
     reqDocs, 
     missing, 
     income && category ? "You meet the scheme's profile criteria." : "Your profile does not meet this scheme's income or category criteria."
   );
 }

 @PostMapping("/applications/apply") 
 public ApplicationResponse apply(@RequestBody ApplyBody body) {
   Beneficiary b = beneficiary(body.beneficiaryId()); 
   Scheme s = scheme(body.schemeId()); 
   if (applications.existsByBeneficiaryIdAndSchemeId(b.getId(), s.getId())) {
     throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied for this scheme.");
   }
   
   EligibleResponse check = validate(s.getId(), new ValidationBody(b.getId(), body.documents())); 
   if (!check.eligible()) {
     throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Profile criteria not met.");
   }

   GrantRequest a = new GrantRequest();
   a.setBeneficiary(b);
   a.setScheme(s);
   a.setStatus(ApplicationStatus.SUBMITTED);
   a.setAppliedAmount(s.getGrantAmount());
   a.setAppliedDate(LocalDate.now());
   a = applications.save(a); 

   String[] names = {"Registration benefit", "Verification clearance", "Final approval"};
   int[] percentages = {30, 40, 30}; 

   for (int i = 0; i < 3; i++) {
     DisbursementStage d = new DisbursementStage();
     d.setApplication(a);
     d.setStageNumber(i + 1);
     d.setStageName(names[i]);
     d.setPercentage(percentages[i]);
     d.setAmount("Stage " + (i + 1) + " (" + percentages[i] + "%)");
     d.setStatus(i == 0 ? StageStatus.RELEASED : StageStatus.PENDING);
     d.setReleaseDate(i == 0 ? LocalDate.now() : null);
     stages.save(d);
   } 
   
   return ApplicationResponse.of(a, stages.findByApplicationIdOrderByStageNumber(a.getId()));
 }

 @GetMapping("/applications/tracker/{beneficiaryId}") 
 public List<ApplicationResponse> tracker(@PathVariable Long beneficiaryId) {
   return applications.findByBeneficiaryIdOrderByAppliedDateDesc(beneficiaryId).stream()
     .map(a -> ApplicationResponse.of(a, stages.findByApplicationIdOrderByStageNumber(a.getId()))).toList();
 }

 private Beneficiary beneficiary(Long id) {
   return beneficiaries.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beneficiary not found"));
 } 

 private Scheme scheme(Long id) {
   return schemes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scheme not found"));
 }

 private void applyProfile(Beneficiary b, ProfileBody p) {
   b.setName(p.name());
   b.setMobile(p.mobile());
   b.setAadhaarNo(p.aadhaarNo());
   b.setCategory(p.category());
   b.setAnnualIncome(p.annualIncome());
   b.setBankAccount(p.bankAccount());
   b.setIfscCode(p.ifscCode());
   b.setDistrict(p.district());
   b.setState(p.state());
 }

 record LoginBody(@NotBlank String identifier) {} 
 record LoginResponse(Long id, String name, String mobile, String aadhaarNo) {} 
 record ProfileBody(Long id, String name, String mobile, String aadhaarNo, String category, BigDecimal annualIncome, String bankAccount, String ifscCode, String district, String state) {} 
 record ValidationBody(Long beneficiaryId, Set<String> documents) {} 
 record ApplyBody(Long beneficiaryId, Long schemeId, Set<String> documents) {} 
 record EligibleResponse(boolean eligible, boolean incomeEligible, boolean categoryEligible, BigDecimal maxIncomeLimit, List<String> allowedCategories, List<String> requiredDocuments, List<String> missingDocuments, String message) {} 
 record SchemeResponse(Long id, String code, String title, String description, String grantAmount, BigDecimal maxIncomeLimit, List<String> allowedCategories, List<String> requiredDocuments) {
   static SchemeResponse of(Scheme s) {
     List<String> allowed = s.getEligibleCategories() != null ? Arrays.asList(s.getEligibleCategories().split(",")) : List.of("All");
     List<String> reqDocs = s.getRequiredDocuments() != null ? Arrays.asList(s.getRequiredDocuments().split(",")) : List.of();
     return new SchemeResponse(s.getId(), s.getCode(), s.getTitle(), s.getDescription(), s.getGrantAmount(), s.getMaxIncomeLimit(), allowed, reqDocs);
   }
 } 
 record StageResponse(int stageNumber, String stageName, int percentage, String amount, StageStatus status, LocalDate releaseDate) {
   static StageResponse of(DisbursementStage s) {
     return new StageResponse(s.getStageNumber(), s.getStageName(), s.getPercentage(), s.getAmount(), s.getStatus(), s.getReleaseDate());
   }
 } 
 record ApplicationResponse(Long id, Long schemeId, String schemeTitle, ApplicationStatus status, String appliedAmount, LocalDate appliedDate, List<StageResponse> disbursements) {
   static ApplicationResponse of(GrantRequest a, List<DisbursementStage> d) {
     return new ApplicationResponse(a.getId(), a.getScheme().getId(), a.getScheme().getTitle(), a.getStatus(), a.getAppliedAmount(), a.getAppliedDate(), d.stream().map(StageResponse::of).toList());
   }
 }
}
