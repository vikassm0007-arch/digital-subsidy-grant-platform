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
                // Simulate AI Assistant reasoning / rule lookup (350ms delay)
                Thread.sleep(350);

                String query = userMessage.getContent().toLowerCase();
                String botContent;

                if (query.contains("pm-kisan") || query.contains("farmer") || query.contains("kisan")) {
                    botContent = "🌾 PM-KISAN Samman Nidhi: Provides ₹6,000/year direct transfer in 3 installments.\n\nRequired Docs: 7/12 Land Extract, Aadhaar Card, Bank Passbook.";
                } else if (query.contains("solar") || query.contains("electricity") || query.contains("surya")) {
                    botContent = "☀️ PM Surya Ghar Free Electricity: Provides up to ₹78,000 capital subsidy for solar rooftop installation.\n\nRequired Docs: Electricity Bill, Property Proof.";
                } else if (query.contains("track") || query.contains("status") || query.contains("application")) {
                    botContent = "⌁ Real-Time Tracking: Your application is currently verified by Field Officer and queued for District Officer approval.";
                } else if (query.contains("digilocker") || query.contains("document")) {
                    botContent = "🛡️ DigiLocker Verification: 4 out of 4 mandatory documents (Aadhaar, Land RoR, Passbook, Quotation) are cryptographically verified!";
                } else {
                    botContent = "✦ JanSetu Real-Time AI Assistant: I can assist with 50+ government subsidy schemes, eligibility scoring, DigiLocker docs, and live approval queues!";
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
