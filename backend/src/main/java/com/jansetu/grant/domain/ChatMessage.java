package com.jansetu.grant.domain;

import java.time.Instant;

public class ChatMessage {
    public enum MessageType { CHAT, JOIN, LEAVE, TYPING, BOT_REPLY }
    public enum MessageStatus { SENDING, SENT, DELIVERED, FAILED }

    private String id;
    private String sender;
    private String recipient;
    private String content;
    private String timestamp;
    private MessageType type;
    private MessageStatus status;

    public ChatMessage() {
        this.timestamp = Instant.now().toString();
        this.status = MessageStatus.SENT;
    }

    public ChatMessage(String sender, String content, MessageType type) {
        this();
        this.sender = sender;
        this.content = content;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }
}
