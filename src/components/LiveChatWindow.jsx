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
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-fallback-' + Date.now(),
            sender: 'JanSetu AI Support',
            content: `✦ Live Assist: ${msgText.toLowerCase().includes('solar') ? 'PM Surya Ghar scheme grants up to ₹78,000 for solar rooftop.' : 'You can track active schemes, DigiLocker verified proofs, or officer approval queues live!'}`,
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
            <div>{m.content}</div>
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
