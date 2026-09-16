package com.jansetu.grant.controller;

import com.jansetu.grant.domain.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage message) {
        if (message.getId() == null || message.getId().isEmpty()) {
            message.setId(UUID.randomUUID().toString());
        }
        message.setStatus(ChatMessage.MessageStatus.DELIVERED);
        message.setTimestamp(Instant.now().toString());

        // Asynchronously process AI Bot Response in a separate thread pool
        // to prevent blocking STOMP message broker worker threads
        processBotReplyAsync(message);

        return message;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage message, SimpMessageHeaderAccessor headerAccessor) {
        if (headerAccessor.getSessionAttributes() != null) {
            headerAccessor.getSessionAttributes().put("username", message.getSender());
        }
        message.setId(UUID.randomUUID().toString());
        message.setContent(message.getSender() + " joined the JanSetu Live Assist session");
        message.setType(ChatMessage.MessageType.JOIN);
        message.setTimestamp(Instant.now().toString());
        return message;
    }

    private void processBotReplyAsync(ChatMessage userMessage) {
        CompletableFuture.runAsync(() -> {
            try {
                // Simulate AI Assistant reasoning / rule lookup (300ms delay)
                Thread.sleep(300);

                String query = userMessage.getContent().toLowerCase();
                String botContent;

                if (query.contains("scholarship") || query.contains("matric") || query.contains("sc") || query.contains("obc") || query.contains("education") || query.contains("nmmss") || query.contains("csis")) {
                    botContent = "🎓 Post Matric & Higher Education Scholarship:\n" +
                                 "• Benefit: 100% Tuition Fee coverage + Monthly Stipend\n" +
                                 "• Eligibility: SC / ST / OBC category students with family income ≤ ₹2.50 Lakhs/year\n" +
                                 "• Required Documents:\n" +
                                 "  1. SC/OBC Caste Certificate\n" +
                                 "  2. Annual Income Certificate (< ₹2.5L)\n" +
                                 "  3. College Admission Slip & Marksheets\n" +
                                 "  4. Valid Aadhaar & Bank Passbook\n" +
                                 "• Verification: DigiLocker auto-verifies your Caste & Marksheet instantly!";
                } else if (query.contains("kisan") || query.contains("farmer") || query.contains("agriculture") || query.contains("crop") || query.contains("kcc")) {
                    botContent = "🌾 PM-KISAN & Farmer Support Schemes:\n" +
                                 "• Benefit: ₹6,000/year direct financial support in 3 equal installments + 3% interest subvention on KCC crop loans\n" +
                                 "• Eligibility: Small & marginal landholder farmer families\n" +
                                 "• Required Documents:\n" +
                                 "  1. Land Ownership Copy (7/12 Extract / Adangal)\n" +
                                 "  2. Aadhaar Card\n" +
                                 "  3. Bank Passbook linked with Aadhaar";
                } else if (query.contains("solar") || query.contains("electricity") || query.contains("surya") || query.contains("kusum")) {
                    botContent = "☀️ PM Surya Ghar & Solar Energy Schemes:\n" +
                                 "• Benefit: Up to ₹78,000 capital subsidy for rooftop solar + 60% pump subsidy under PM Kusum\n" +
                                 "• Eligibility: Residential homeowners & active farmers\n" +
                                 "• Required Documents:\n" +
                                 "  1. Latest Electricity Bill\n" +
                                 "  2. Property Proof & Roof Layout Plan\n" +
                                 "  3. Aadhaar Card & Bank Passbook";
                } else if (query.contains("house") || query.contains("housing") || query.contains("pmay") || query.contains("urban") || query.contains("gramin")) {
                    botContent = "🏠 PMAY Housing Subsidy (Urban & Gramin):\n" +
                                 "• Benefit: Credit-linked subsidy up to ₹2.67 Lakhs for home construction or purchase\n" +
                                 "• Eligibility: EWS / LIG / MIG categories with annual income up to ₹6.00 Lakhs\n" +
                                 "• Required Documents:\n" +
                                 "  1. Annual Income Certificate\n" +
                                 "  2. Property Papers / Site Photos\n" +
                                 "  3. Aadhaar Card & Ration Card";
                } else if (query.contains("mudra") || query.contains("loan") || query.contains("business") || query.contains("vishwakarma") || query.contains("startup") || query.contains("msme") || query.contains("pmegp")) {
                    botContent = "💼 MSME & Business Grants:\n" +
                                 "• Mudra Shishu: Up to ₹50,000 collateral-free startup loan\n" +
                                 "• PM Vishwakarma: Up to ₹3.00 Lakhs for traditional artisans\n" +
                                 "• Stand-Up India: ₹10 Lakhs - ₹1 Crore for SC/ST/Women entrepreneurs\n" +
                                 "• Required Documents: Business Proposal, ID & Address Proof, Bank Statement, EDP Certificate.";
                } else if (query.contains("digilocker") || query.contains("document") || query.contains("proof") || query.contains("verified")) {
                    botContent = "🛡️ Submitted DigiLocker Cryptographic Proofs:\n" +
                                 "✓ Aadhaar Card (Identity & DOB Verified)\n" +
                                 "✓ Income Certificate (Annual Income Verified)\n" +
                                 "✓ Caste Certificate (Category Verified)\n" +
                                 "✓ Land Ownership / 7-12 RoR (Land Holding Verified)\n" +
                                 "✓ Bank Passbook & IFSC (DBT Account Verified)";
                } else if (query.contains("track") || query.contains("status") || query.contains("application") || query.contains("approval") || query.contains("stage")) {
                    botContent = "⌁ Application Progress & Officer Queue:\n" +
                                 "• Stage 1 (Field Officer): VERIFIED & APPROVED ✓\n" +
                                 "• Stage 2 (District Officer): UNDER REVIEW ⏳\n" +
                                 "• Stage 3 (Finance Approver): PENDING DBT RELEASE 💳\n" +
                                 "Direct Benefit Transfer (DBT) will credit funds directly into your linked bank account upon Stage 3 approval.";
                } else if (query.contains("ev") || query.contains("electric") || query.contains("rickshaw") || query.contains("fame")) {
                    botContent = "⚡ Electric Vehicle (FAME II / E-Rickshaw) Subsidy:\n" +
                                 "• Benefit: Direct cash subsidy up to ₹30,000 for E-Rickshaws & up to ₹1.50 Lakhs for EVs\n" +
                                 "• Required Documents: Commercial Driving License, Vehicle Purchase Invoice, Aadhaar Card.";
                } else if (query.contains("livestock") || query.contains("dairy") || query.contains("fish") || query.contains("matsya") || query.contains("cow") || query.contains("animal")) {
                    botContent = "🐄 Livestock, Dairy & Fisheries Grants:\n" +
                                 "• Benefit: 50% capital subsidy for poultry/goat breeding & 40-60% for PMMSY fisheries\n" +
                                 "• Required Documents: Land/Shed Availability Proof, Detailed Project Report, Fisherman License.";
                } else if (query.contains("sewing") || query.contains("silai") || query.contains("women") || query.contains("step")) {
                    botContent = "🧵 Free Sewing Machine & STEP Women Scheme:\n" +
                                 "• Benefit: Free sewing machine + stipend & skill training for economically weak women (Age 20-40)\n" +
                                 "• Required Documents: Income Certificate (< ₹1.44L), Age Proof, Passport Photo, Aadhaar.";
                } else {
                    botContent = "✦ JanSetu AI Support: Found related information for '" + userMessage.getContent() + "'.\n\n" +
                                 "• Coverage: 50 active subsidy schemes across Agriculture, Education, Housing, Green Energy & MSMEs.\n" +
                                 "• Workflow: All applications feature 3-Stage Officer Approval (Field ➔ District ➔ Finance) with 100% Direct Benefit Transfer (DBT).\n" +
                                 "• Need details? Ask about PM-KISAN, Scholarships, Solar Rooftop, Housing, Mudra, or DigiLocker Documents!";
                }

                ChatMessage botReply = new ChatMessage("JanSetu AI Support", botContent, ChatMessage.MessageType.BOT_REPLY);
                botReply.setId(UUID.randomUUID().toString());
                botReply.setRecipient(userMessage.getSender());
                botReply.setTimestamp(Instant.now().toString());

                // Broadcast bot reply to public topic channel
                messagingTemplate.convertAndSend("/topic/public", botReply);

            } catch (Exception e) {
                System.err.println("Async Bot Reply Processing Error: " + e.getMessage());
            }
        });
    }
}
