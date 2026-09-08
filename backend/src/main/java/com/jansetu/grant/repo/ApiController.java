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

  private final Map<String, String> otpStore = new java.util.concurrent.ConcurrentHashMap<>();

  @PostMapping("/auth/login") 
  public LoginResponse login(@Valid @RequestBody LoginBody body) {
    Beneficiary b = beneficiaries.findByMobileOrAadhaarNo(body.identifier(), body.identifier())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beneficiary not found. Use demo account or complete profile.")); 
    return new LoginResponse(b.getId(), b.getName(), b.getMobile(), b.getAadhaarNo());
  }

  @PostMapping("/auth/send-otp")
  public SendOtpResponse sendOtp(@RequestBody(required = false) Map<String, String> body) {
    String id = (body != null && body.get("identifier") != null) ? body.get("identifier") : "";
    if (id == null || id.trim().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number or Citizen ID is required.");
    }
    String identifier = id.trim();
    int randomOtp = 100000 + new Random().nextInt(900000);
    String dynamicOtp = String.valueOf(randomOtp);
    otpStore.put(identifier, dynamicOtp);

    return new SendOtpResponse(identifier, dynamicOtp, "6-digit OTP code generated and sent to +91 " + identifier, true);
  }

  @PostMapping("/auth/verify-otp")
  public LoginResponse verifyOtp(@RequestBody(required = false) Map<String, String> body) {
    String id = (body != null && body.get("identifier") != null) ? body.get("identifier") : "";
    String otp = (body != null && body.get("otp") != null) ? body.get("otp") : "";
    if (id == null || id.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number and OTP code are required.");
    }
    String identifier = id.trim();
    String enteredOtp = otp.trim();
    String expectedOtp = otpStore.get(identifier);

    if (expectedOtp == null || !expectedOtp.equals(enteredOtp)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid OTP code. Please enter the exact 6-digit OTP sent to your mobile.");
    }

    otpStore.remove(identifier);

    Beneficiary b = beneficiaries.findByMobileOrAadhaarNo(identifier, identifier)
      .orElseGet(() -> {
        Beneficiary newB = new Beneficiary();
        newB.setName("Asha Ramesh Patil");
        newB.setMobile(identifier);
        newB.setAadhaarNo("XXXX XXXX " + (int)(1000 + Math.random() * 9000));
        newB.setCategory("OBC");
        newB.setAnnualIncome(BigDecimal.valueOf(180000));
        newB.setBankAccount("245710003456");
        newB.setIfscCode("SBIN0000456");
        newB.setDistrict("Pune");
        newB.setState("Maharashtra");
        return beneficiaries.save(newB);
      });
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

    long totalGrant = 5000;
    try {
      String cleanStr = s.getGrantAmount() != null ? s.getGrantAmount().replaceAll("[^0-9]", "") : "";
      if (!cleanStr.isEmpty()) {
        totalGrant = Long.parseLong(cleanStr);
      }
    } catch (Exception ignored) {}

    for (int i = 0; i < 3; i++) {
      DisbursementStage d = new DisbursementStage();
      d.setApplication(a);
      d.setStageNumber(i + 1);
      d.setStageName(names[i]);
      d.setPercentage(percentages[i]);
      long stageAmt = i == 2 ? (totalGrant - (totalGrant * 30 / 100) - (totalGrant * 40 / 100)) : (totalGrant * percentages[i]) / 100;
      d.setAmount("₹" + String.format("%,d", stageAmt));
      d.setStatus(StageStatus.PENDING);
      d.setReleaseDate(null);
      stages.save(d);
    } 
   
   return ApplicationResponse.of(a, stages.findByApplicationIdOrderByStageNumber(a.getId()));
 }

  @GetMapping("/applications/tracker/{beneficiaryId}") 
  public List<ApplicationResponse> tracker(@PathVariable Long beneficiaryId) {
    return applications.findByBeneficiaryIdOrderByAppliedDateDesc(beneficiaryId).stream()
      .map(a -> ApplicationResponse.of(a, stages.findByApplicationIdOrderByStageNumber(a.getId()))).toList();
  }

  @PostMapping("/officer/login")
  public OfficerLoginResponse officerLogin(@RequestBody OfficerLoginBody body) {
    if ("field.officer@gov.in".equalsIgnoreCase(body.email()) && "Field@2026".equals(body.password())) {
      return new OfficerLoginResponse("field.officer@gov.in", "Rajesh Kumar", "ROLE_FIELD_OFFICER", "Senior Field Verification Inspector", "Pune North Sub-District");
    } else if ("district.officer@gov.in".equalsIgnoreCase(body.email()) && "District@2026".equals(body.password())) {
      return new OfficerLoginResponse("district.officer@gov.in", "Ananya Deshmukh", "ROLE_DISTRICT_OFFICER", "District Development Commissioner", "Pune District Circle");
    } else if ("finance.approver@gov.in".equalsIgnoreCase(body.email()) && "Finance@2026".equals(body.password())) {
      return new OfficerLoginResponse("finance.approver@gov.in", "Suresh Patil", "ROLE_FINANCE_APPROVER", "Chief Financial Control Officer", "State Treasury Directorate");
    }
    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid officer login credentials");
  }

  @GetMapping("/officer/applications")
  public List<OfficerApplicationResponse> getOfficerQueue(@RequestParam(required = false) String role) {
    List<GrantRequest> list;
    if ("ROLE_FIELD_OFFICER".equalsIgnoreCase(role)) {
      list = applications.findByStatusOrderByAppliedDateDesc(ApplicationStatus.SUBMITTED);
    } else if ("ROLE_DISTRICT_OFFICER".equalsIgnoreCase(role)) {
      list = applications.findByStatusOrderByAppliedDateDesc(ApplicationStatus.FIELD_VERIFIED);
    } else if ("ROLE_FINANCE_APPROVER".equalsIgnoreCase(role)) {
      list = applications.findByStatusOrderByAppliedDateDesc(ApplicationStatus.DISTRICT_APPROVED);
    } else {
      list = applications.findAllByOrderByAppliedDateDesc();
    }
    return list.stream().map(a -> OfficerApplicationResponse.of(a, stages.findByApplicationIdOrderByStageNumber(a.getId()))).toList();
  }

  @PostMapping("/verify/approve")
  public OfficerApplicationResponse approveApplication(@RequestBody OfficerApproveBody body) {
    GrantRequest a = applications.findById(body.applicationId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

    if ("ROLE_FIELD_OFFICER".equalsIgnoreCase(body.officerRole()) || a.getStatus() == ApplicationStatus.SUBMITTED) {
      a.setStatus(ApplicationStatus.FIELD_VERIFIED);
    } else if ("ROLE_DISTRICT_OFFICER".equalsIgnoreCase(body.officerRole()) || a.getStatus() == ApplicationStatus.FIELD_VERIFIED) {
      a.setStatus(ApplicationStatus.DISTRICT_APPROVED);
    } else if ("ROLE_FINANCE_APPROVER".equalsIgnoreCase(body.officerRole()) || a.getStatus() == ApplicationStatus.DISTRICT_APPROVED) {
      a.setStatus(ApplicationStatus.DISBURSED);
      List<DisbursementStage> appStages = stages.findByApplicationIdOrderByStageNumber(a.getId());
      for (DisbursementStage s : appStages) {
        s.setStatus(StageStatus.RELEASED);
        s.setReleaseDate(LocalDate.now());
        stages.save(s);
      }
    }
    a = applications.save(a);
    return OfficerApplicationResponse.of(a, stages.findByApplicationIdOrderByStageNumber(a.getId()));
  }

  @PostMapping("/verify/reject")
  public OfficerApplicationResponse rejectApplication(@RequestBody OfficerRejectBody body) {
    GrantRequest a = applications.findById(body.applicationId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    a.setStatus(ApplicationStatus.REJECTED);
    a = applications.save(a);
    return OfficerApplicationResponse.of(a, stages.findByApplicationIdOrderByStageNumber(a.getId()));
  }

  @PostMapping("/disburse/release")
  public PaymentGatewayResult releaseFunds(@RequestBody DisburseBody body) {
    GrantRequest a = applications.findById(body.applicationId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

    List<DisbursementStage> appStages = stages.findByApplicationIdOrderByStageNumber(a.getId());
    DisbursementStage targetStage = null;
    if (body.stageNumber() != null) {
      targetStage = appStages.stream().filter(s -> s.getStageNumber() == body.stageNumber()).findFirst().orElse(null);
    }
    if (targetStage == null && !appStages.isEmpty()) {
      targetStage = appStages.stream().filter(s -> s.getStatus() == StageStatus.PENDING).findFirst().orElse(appStages.get(0));
    }

    if (targetStage != null) {
      targetStage.setStatus(StageStatus.RELEASED);
      targetStage.setReleaseDate(LocalDate.now());
      stages.save(targetStage);
    }

    boolean allReleased = stages.findByApplicationIdOrderByStageNumber(a.getId()).stream()
        .allMatch(s -> s.getStatus() == StageStatus.RELEASED);
    if (allReleased) {
      a.setStatus(ApplicationStatus.DISBURSED);
      applications.save(a);
    }

    Beneficiary b = a.getBeneficiary();
    String txnId = "DBT-2026-TXN-" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
    String amount = targetStage != null ? targetStage.getAmount() : a.getAppliedAmount();
    String stageName = targetStage != null ? targetStage.getStageName() : "Fund Release";

    return new PaymentGatewayResult(
        txnId,
        b != null ? b.getName() : "Asha Ramesh Patil",
        b != null && b.getBankAccount() != null ? b.getBankAccount() : "245710003456",
        b != null && b.getIfscCode() != null ? b.getIfscCode() : "SBIN0000456",
        stageName,
        amount,
        "SUCCESS_RELEASED",
        LocalDate.now()
    );
  }

  @PostMapping("/reset-demo")
  public Map<String, Object> resetDemo() {
    stages.deleteAll();
    applications.deleteAll();
    return Map.of("message", "Demo database reset to zero applications", "status", "SUCCESS");
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

  public static class SendOtpBody {
    private String identifier;
    public SendOtpBody() {}
    public SendOtpBody(String identifier) { this.identifier = identifier; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
  }

  public static class VerifyOtpBody {
    private String identifier;
    private String otp;
    public VerifyOtpBody() {}
    public VerifyOtpBody(String identifier, String otp) { this.identifier = identifier; this.otp = otp; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
  }

  record SendOtpResponse(String identifier, String otp, String message, boolean success) {}
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
  record OfficerLoginBody(String email, String password) {}
  record OfficerLoginResponse(String email, String name, String role, String designation, String jurisdiction) {}
  record OfficerApproveBody(Long applicationId, String officerRole, String remarks) {}
  record OfficerRejectBody(Long applicationId, String officerRole, String reason) {}
  record DisburseBody(Long applicationId, Integer stageNumber, String remarks) {}
  record PaymentGatewayResult(String txnRef, String beneficiaryName, String bankAccount, String ifscCode, String stageName, String amountReleased, String status, LocalDate timestamp) {}
  record OfficerApplicationResponse(
      Long id, 
      Long schemeId, 
      String schemeTitle, 
      String schemeCode,
      ApplicationStatus status, 
      String appliedAmount, 
      LocalDate appliedDate, 
      Long beneficiaryId,
      String beneficiaryName,
      String beneficiaryMobile,
      String beneficiaryAadhaar,
      String beneficiaryCategory,
      BigDecimal beneficiaryIncome,
      String beneficiaryDistrict,
      String beneficiaryState,
      String beneficiaryBank,
      String beneficiaryIfsc,
      List<StageResponse> disbursements
  ) {
    static OfficerApplicationResponse of(GrantRequest a, List<DisbursementStage> d) {
      Beneficiary b = a.getBeneficiary();
      return new OfficerApplicationResponse(
          a.getId(),
          a.getScheme().getId(),
          a.getScheme().getTitle(),
          a.getScheme().getCode(),
          a.getStatus(),
          a.getAppliedAmount(),
          a.getAppliedDate(),
          b != null ? b.getId() : null,
          b != null ? b.getName() : "Unknown Beneficiary",
          b != null ? b.getMobile() : "N/A",
          b != null ? b.getAadhaarNo() : "N/A",
          b != null ? b.getCategory() : "General",
          b != null ? b.getAnnualIncome() : BigDecimal.ZERO,
          b != null ? b.getDistrict() : "Pune",
          b != null ? b.getState() : "Maharashtra",
          b != null ? b.getBankAccount() : "245710003456",
          b != null ? b.getIfscCode() : "SBIN0000456",
          d.stream().map(StageResponse::of).toList()
      );
    }
  }
}
