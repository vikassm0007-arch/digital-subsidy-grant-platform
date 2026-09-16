if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function LiveChatWindow({ profile, schemes, applications, open, setOpen }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'JanSetu AI Support',
      content: `Namaste ${profile.name ? profile.name.split(' ')[0] : 'Beneficiary'}! 👋 I am JanSetu Live AI Assistant. Connected via WebSockets + STOMP. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'BOT_REPLY',
      status: 'DELIVERED'
    }
  ]);
  const [input, setInput] = useState('');
  const [connectionState, setConnectionState] = useState('DISCONNECTED'); // CONNECTING, CONNECTED, RECONNECTING, DISCONNECTED
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!open) return;

    setConnectionState('CONNECTING');

    const socketUrl = 'http://localhost:8088/ws-chat';
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: 'Bearer demo-jwt-token-jansetu-2026',
        'user-id': profile.name || 'Beneficiary'
      },
      debug: (str) => {
        // Console debug log for STOMP communication
        console.log('[STOMP DEBUG]:', str);
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        console.log('[STOMP CONNECTED]:', frame);
        setConnectionState('CONNECTED');

        // Subscribe to public STOMP topic channel
        client.subscribe('/topic/public', (stompMessage) => {
          try {
            const body = JSON.parse(stompMessage.body);
            setMessages((prev) => {
              // Avoid duplicate messages if already appended optimistically
              if (prev.some((m) => m.id === body.id)) {
                return prev.map((m) => (m.id === body.id ? { ...m, status: 'DELIVERED' } : m));
              }
              return [...prev, {
                id: body.id || String(Date.now()),
                sender: body.sender || 'JanSetu Support',
                content: body.content,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: body.type || 'CHAT',
                status: 'DELIVERED'
              }];
            });
          } catch (err) {
            console.error('Failed to parse STOMP message payload:', err);
          }
        });

        // Publish Join Message
        client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({
            sender: profile.name || 'Asha Ramesh Patil',
            type: 'JOIN'
          })
        });
      },
      onStompError: (frame) => {
        console.error('[STOMP ERROR]:', frame.headers['message'], frame.body);
        setConnectionState('RECONNECTING');
      },
      onWebSocketClose: () => {
        console.warn('[STOMP WEBSOCKET CLOSED]');
        setConnectionState('RECONNECTING');
      },
      onDisconnect: () => {
        console.log('[STOMP DISCONNECTED]');
        setConnectionState('DISCONNECTED');
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        setConnectionState('DISCONNECTED');
      }
    };
  }, [open, profile.name]);

  const handleSendMessage = (textToSend) => {
    const msgText = (textToSend || input).trim();
    if (!msgText) return;

    const tempId = 'temp-' + Date.now();
    const userMsg = {
      id: tempId,
      sender: profile.name || 'Asha Ramesh Patil',
      content: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'CHAT',
      status: 'SENDING'
    };

    // Optimistic UI Update: Render message instantly in UI before server ack
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          id: tempId,
          sender: profile.name || 'Asha Ramesh Patil',
          content: msgText,
          type: 'CHAT'
        })
      });

      // Update status to SENT
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'SENT' } : m)));
    } else {
      console.warn('[WS FALLBACK]: STOMP socket disconnected. Falling back to HTTP/Simulated response.');
      setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'DELIVERED' } : m)));
        
        const query = msgText.toLowerCase();
        let fallbackReply = "";
        if (query.includes("scholarship") || query.includes("matric") || query.includes("sc") || query.includes("obc") || query.includes("education")) {
          fallbackReply = "🎓 Post Matric & Higher Education Scholarship:\n• Benefit: 100% Tuition Fee coverage + Monthly Stipend\n• Eligibility: SC / ST / OBC category students with family income ≤ ₹2.50 Lakhs/year\n• Required Docs: SC/OBC Caste Certificate, Income Certificate, College Admission Slip, Marksheets, Aadhaar & Passbook.\n• Verification: DigiLocker auto-verifies your Caste & Marksheet instantly!";
        } else if (query.includes("kisan") || query.includes("farmer") || query.includes("agriculture")) {
          fallbackReply = "🌾 PM-KISAN & Farmer Support Schemes:\n• Benefit: ₹6,000/year direct financial support in 3 equal installments + 3% interest subvention on KCC crop loans\n• Required Docs: Land Ownership (7/12 Extract), Aadhaar Card, Bank Passbook.";
        } else if (query.includes("solar") || query.includes("electricity") || query.includes("surya")) {
          fallbackReply = "☀️ PM Surya Ghar & Solar Energy Schemes:\n• Benefit: Up to ₹78,000 capital subsidy for rooftop solar installation\n• Required Docs: Electricity Bill, Property Proof, Roof Layout Plan, Aadhaar Card.";
        } else if (query.includes("house") || query.includes("housing") || query.includes("pmay")) {
          fallbackReply = "🏠 PMAY Housing Subsidy (Urban & Gramin):\n• Benefit: Credit-linked subsidy up to ₹2.67 Lakhs for home construction or purchase\n• Required Docs: Income Certificate, Property Papers, Site Photos, Aadhaar Card.";
        } else if (query.includes("mudra") || query.includes("loan") || query.includes("business") || query.includes("vishwakarma")) {
          fallbackReply = "💼 MSME & Business Grants:\n• Mudra Shishu: Up to ₹50,000 collateral-free startup loan\n• PM Vishwakarma: Up to ₹3.00 Lakhs for traditional artisans\n• Required Docs: Business Proposal, ID Proof, Bank Statement.";
        } else if (query.includes("digilocker") || query.includes("document") || query.includes("proof")) {
          fallbackReply = "🛡️ Submitted DigiLocker Cryptographic Proofs:\n✓ Aadhaar Card (Identity Verified)\n✓ Income Certificate (Verified)\n✓ Caste Certificate (Category Verified)\n✓ Land Ownership / 7-12 RoR (Verified)\n✓ Bank Passbook & IFSC (DBT Account Verified)";
        } else if (query.includes("track") || query.includes("status") || query.includes("application")) {
          fallbackReply = "⌁ Application Progress & Officer Queue:\n• Stage 1 (Field Officer): VERIFIED & APPROVED ✓\n• Stage 2 (District Officer): UNDER REVIEW ⏳\n• Stage 3 (Finance Approver): PENDING DBT RELEASE 💳";
        } else {
          fallbackReply = `✦ JanSetu AI Support: Information regarding '${msgText}':\n• Coverage: 50 active subsidy schemes across Agriculture, Education, Housing, Green Energy & MSMEs.\n• Workflow: 3-Stage Officer Approval (Field ➔ District ➔ Finance) with 100% Direct Benefit Transfer (DBT).`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-fallback-' + Date.now(),
            sender: 'JanSetu AI Support',
            content: fallbackReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'BOT_REPLY',
            status: 'DELIVERED'
          }
        ]);
      }, 400);
    }
  };

  if (!open) {
    return (
      <button className="chatbot-fab" onClick={() => setOpen(true)}>
        <span>💬</span>
        <span>JanSetu Live Assist</span>
        <span className="chatbot-fab-badge">STOMP WSS</span>
      </button>
    );
  }

  const getStatusColor = () => {
    if (connectionState === 'CONNECTED') return '#10b981'; // Green
    if (connectionState === 'CONNECTING' || connectionState === 'RECONNECTING') return '#f59e0b'; // Yellow/Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="chatbot-window">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar">✦</div>
          <div className="chatbot-title">
            <h4>JanSetu Live AI Assistant</h4>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(), display: 'inline-block' }}></span>
              {connectionState === 'CONNECTED' ? 'Live WebSocket Connected' : connectionState === 'CONNECTING' ? 'Connecting to STOMP...' : connectionState === 'RECONNECTING' ? 'Reconnecting STOMP...' : 'Offline (Fallback Mode)'}
            </p>
          </div>
        </div>
        <button className="chatbot-close" onClick={() => setOpen(false)}>×</button>
      </div>

      {/* Messages Feed */}
      <div className="chatbot-messages">
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg ${m.sender === (profile.name || 'Asha Ramesh Patil') ? 'user' : 'bot'}`}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px', opacity: 0.8 }}>
              {m.sender}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{m.content}</div>
            <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '4px', opacity: 0.6, display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
              <span>{m.timestamp}</span>
              {m.sender === (profile.name || 'Asha Ramesh Patil') && (
                <span>{m.status === 'SENDING' ? '🕒' : m.status === 'SENT' ? '✓' : '✓✓'}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="chat-chips">
        <button className="chat-chip" onClick={() => handleSendMessage('How do I apply for PM-KISAN?')}>🌾 PM-KISAN</button>
        <button className="chat-chip" onClick={() => handleSendMessage('Check my solar scheme eligibility')}>☀️ Solar Rooftop</button>
        <button className="chat-chip" onClick={() => handleSendMessage('Status of DigiLocker documents?')}>🛡️ DigiLocker Docs</button>
        <button className="chat-chip" onClick={() => handleSendMessage('Track my active application status')}>⌁ Application Status</button>
      </div>

      {/* Input Form */}
      <div className="chatbot-input-area">
        <input 
          type="text" 
          placeholder="Ask live AI about 50 schemes or status..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="chatbot-send" onClick={() => handleSendMessage()}>Send</button>
      </div>
    </div>
  );
}
