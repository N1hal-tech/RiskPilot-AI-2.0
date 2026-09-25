import React, { useEffect, useMemo, useRef, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const SUGGESTIONS = [
  'What is my risk score?',
  'How can I improve my approval chances?',
  'Calculate my DTI ratio',
  'Why is my interest rate high?',
  'Why was my loan sent to review?',
  'What is default probability?',
];

const getSessionId = () => {
  let sid = sessionStorage.getItem('chat_session_id');
  if (!sid) {
    sid = 'session_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
    sessionStorage.setItem('chat_session_id', sid);
  }
  return sid;
};

const renderMarkdown = (text) => {
  return (text || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#eef2ff;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/\n/g, '<br/>')
    .replace(/• /g, '<span style="color:#0f766e">• </span>');
};

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

async function deleteRequest(url) {
  await fetch(url, { method: 'DELETE' });
}

export default function Chatbot({ userId = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState(true);
  const [unread, setUnread] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hi! I'm the RiskPilot AI rule-based assistant.\n\n" +
          'I can explain your risk score, eligibility, interest rate, and application decisions.\n\n' +
          'How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnread((prev) => prev + 1);
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnread(0);
  };

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: messageText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowSuggest(false);
    setIsTyping(true);

    try {
      const data = await postJson(`${API_URL}/api/chat/message`, {
        sessionId,
        message: messageText,
        userId,
      });

      await new Promise((r) => setTimeout(r, 400));

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: data.reply, timestamp: new Date() },
      ]);

      if (!isOpen) setUnread((prev) => prev + 1);
    } catch (e) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'I am having trouble connecting right now. Please try again shortly.',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    await deleteRequest(`${API_URL}/api/chat/session/${sessionId}`);
    setMessages([
      { id: 'welcome-new', role: 'assistant', content: 'Chat cleared. How can I help?', timestamp: new Date() },
    ]);
    setShowSuggest(true);
    sessionStorage.removeItem('chat_session_id');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {!isOpen && (
        <button onClick={handleOpen} style={styles.fabButton} aria-label="Open chat" title="Chat with RiskPilot AI Assistant">
          <span style={{ fontSize: 22 }}>💬</span>
          {unread > 0 && <span style={styles.badge}>{unread}</span>}
        </button>
      )}

      {isOpen && (
        <div style={{ ...styles.chatWindow, height: isMinimized ? '62px' : '590px' }}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>🛡️</div>
              <div>
                <div style={styles.headerTitle}>RiskPilot AI Assistant</div>
                <div style={styles.headerSub}>{isTyping ? 'typing...' : 'online'}</div>
              </div>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.iconButton} onClick={clearChat} title="Clear">⟲</button>
              <button style={styles.iconButton} onClick={() => setIsMinimized((v) => !v)} title="Minimize">{isMinimized ? '▴' : '▾'}</button>
              <button style={styles.iconButton} onClick={() => setIsOpen(false)} title="Close">✕</button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div style={styles.messagesWrap}>
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: isUser ? 'row-reverse' : 'row',
                        gap: 8,
                        marginBottom: 14,
                        alignItems: 'flex-end',
                      }}
                    >
                      {!isUser && <div style={styles.msgAvatar}>🛡️</div>}
                      <div style={{ maxWidth: '80%' }}>
                        <div
                          style={{
                            ...styles.bubble,
                            ...(isUser ? styles.userBubble : styles.aiBubble),
                            ...(msg.isError ? styles.errorBubble : {}),
                          }}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                        />
                        <div style={{ ...styles.timestamp, textAlign: isUser ? 'right' : 'left' }}>{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && <div style={{ fontSize: 12, color: '#64748b' }}>Assistant is typing...</div>}

                {showSuggest && messages.length <= 1 && (
                  <div style={styles.suggestions}>
                    <p style={styles.suggestLabel}>Suggested questions:</p>
                    <div style={styles.suggestGrid}>
                      {SUGGESTIONS.map((q) => (
                        <button key={q} onClick={() => sendMessage(q)} style={styles.suggestChip}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.inputWrap}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your loan..."
                  rows={1}
                  style={styles.textarea}
                  disabled={loading}
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={styles.sendBtn}>
                  {loading ? '...' : '➤'}
                </button>
              </div>
              <div style={styles.footer}>Powered by RiskPilot AI rules</div>
            </>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  fabButton: {
    position: 'fixed',
    bottom: '26px',
    right: '26px',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f766e, #2563eb)',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 12px 30px rgba(15, 118, 110, 0.35)',
    zIndex: 9998,
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '26px',
    right: '26px',
    width: '380px',
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 25px 80px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9999,
    transition: 'height 0.25s ease',
  },
  header: {
    background: 'linear-gradient(135deg, #0f766e, #2563eb)',
    color: '#fff',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { display: 'flex', gap: 10, alignItems: 'center' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 14, fontWeight: 700 },
  headerSub: { fontSize: 12, opacity: 0.9 },
  headerActions: { display: 'flex', gap: 6 },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: 'none',
    color: '#fff',
    background: 'rgba(255,255,255,0.15)',
    cursor: 'pointer',
  },
  messagesWrap: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 12px',
    background: '#f8fafc',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f766e, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 14,
    flexShrink: 0,
  },
  bubble: {
    padding: '10px 12px',
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  userBubble: {
    background: 'linear-gradient(135deg, #0f766e, #2563eb)',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 11,
    color: '#94a3b8',
    padding: '0 2px',
  },
  suggestions: { marginTop: 6 },
  suggestLabel: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  suggestGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  suggestChip: {
    border: '1px solid #d1d5db',
    background: '#fff',
    borderRadius: 18,
    padding: '7px 12px',
    fontSize: 12,
    color: '#374151',
    cursor: 'pointer',
  },
  inputWrap: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '8px 10px',
    resize: 'none',
    outline: 'none',
    fontSize: 14,
    fontFamily: 'inherit',
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #0f766e, #2563eb)',
    color: '#fff',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    background: '#fff',
    borderTop: '1px solid #f1f5f9',
    padding: '7px 10px',
  },
};
