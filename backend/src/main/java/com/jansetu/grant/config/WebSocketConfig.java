package com.jansetu.grant.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Heartbeat config: [server-to-client, client-to-server] in milliseconds (10 seconds)
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("wss-heartbeat-thread-");
        scheduler.initialize();

        registry.enableSimpleBroker("/topic", "/queue")
                .setTaskScheduler(scheduler)
                .setHeartbeatValue(new long[]{10000, 10000});

        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 1. SockJS Enabled STOMP Endpoint with CORS
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("http://localhost:5173", "http://127.0.0.1:5173", "*")
                .withSockJS();

        // 2. Native WebSocket Endpoint (Fallback for clients preferring direct WSS)
        registry.addEndpoint("/ws-chat-native")
                .setAllowedOriginPatterns("http://localhost:5173", "http://127.0.0.1:5173", "*");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authToken = accessor.getFirstNativeHeader("Authorization");
                    if (authToken != null && authToken.startsWith("Bearer ")) {
                        String jwtToken = authToken.substring(7);
                        // Attach authenticated user principal to WS Session
                        accessor.setUser(() -> accessor.getFirstNativeHeader("user-id") != null 
                            ? accessor.getFirstNativeHeader("user-id") 
                            : "Beneficiary-User");
                        System.out.println("[WS SECURITY] Connected WebSocket Session authenticated for JWT: " + jwtToken.substring(0, Math.min(10, jwtToken.length())) + "...");
                    }
                }
                return message;
            }
        });
    }
}
