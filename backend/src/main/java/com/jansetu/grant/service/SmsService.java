package com.jansetu.grant.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SmsService {

    @Value("${fast2sms.api.key:}")
    private String fast2smsApiKey;

    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    private static String dynamicApiKey = "";
    private static String activeProvider = "SIMULATED_GATEWAY";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    public static void setDynamicApiKey(String apiKey, String provider) {
        dynamicApiKey = apiKey != null ? apiKey.trim() : "";
        if (provider != null && !provider.trim().isEmpty()) {
            activeProvider = provider.trim().toUpperCase();
        }
    }

    public static String getActiveProvider() {
        return activeProvider;
    }

    public boolean sendSms(String mobileNumber, String otpCode) {
        String cleanMobile = mobileNumber.replaceAll("[^0-9]", "");
        if (cleanMobile.length() > 10) {
            cleanMobile = cleanMobile.substring(cleanMobile.length() - 10);
        }

        System.out.println("=================================================");
        System.out.println("[JANSETU SMS GATEWAY DISPATCH]");
        System.out.println("Destination: +91 " + cleanMobile);
        System.out.println("Payload: JanSetu Digital Subsidy Grant verification OTP: " + otpCode);
        System.out.println("Active Provider: " + activeProvider);
        System.out.println("=================================================");

        String keyToUse = !dynamicApiKey.isEmpty() ? dynamicApiKey : fast2smsApiKey;

        // 1. Fast2SMS Integration (India Mobile +91)
        if (keyToUse != null && !keyToUse.trim().isEmpty()) {
            try {
                String url = "https://www.fast2sms.com/dev/bulkV2?authorization=" 
                        + URLEncoder.encode(keyToUse.trim(), StandardCharsets.UTF_8)
                        + "&route=otp&variables_values=" + URLEncoder.encode(otpCode, StandardCharsets.UTF_8)
                        + "&numbers=" + cleanMobile;
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .GET()
                        .build();
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                System.out.println("[FAST2SMS DISPATCH RESULT]: HTTP " + resp.statusCode() + " -> " + resp.body());
                if (resp.statusCode() == 200) {
                    activeProvider = "FAST2SMS_REAL_GATEWAY";
                    return true;
                }
            } catch (Exception e) {
                System.err.println("Fast2SMS API Exception: " + e.getMessage());
            }
        }

        // 2. Twilio SMS Integration
        if (twilioAccountSid != null && !twilioAccountSid.trim().isEmpty() 
            && twilioAuthToken != null && !twilioAuthToken.trim().isEmpty()) {
            try {
                String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid.trim() + "/Messages.json";
                String targetPhone = "+91" + cleanMobile;
                String body = "JanSetu Portal OTP: " + otpCode + ". Do not share this code with anyone.";
                String formData = "From=" + URLEncoder.encode(twilioPhoneNumber, StandardCharsets.UTF_8) 
                        + "&To=" + URLEncoder.encode(targetPhone, StandardCharsets.UTF_8) 
                        + "&Body=" + URLEncoder.encode(body, StandardCharsets.UTF_8);

                String auth = Base64.getEncoder().encodeToString((twilioAccountSid.trim() + ":" + twilioAuthToken.trim()).getBytes(StandardCharsets.UTF_8));
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Authorization", "Basic " + auth)
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(formData))
                        .build();
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                System.out.println("[TWILIO DISPATCH RESULT]: HTTP " + resp.statusCode() + " -> " + resp.body());
                if (resp.statusCode() == 200 || resp.statusCode() == 201) {
                    activeProvider = "TWILIO_REAL_GATEWAY";
                    return true;
                }
            } catch (Exception e) {
                System.err.println("Twilio API Exception: " + e.getMessage());
            }
        }

        return true;
    }
}
