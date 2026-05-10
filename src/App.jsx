import React, { useState, useRef, useEffect, useCallback } from 'react';
import mammoth from 'mammoth';

// SmartStudy AI v2 — model: drytis/kimi-k2.5

// ─── Constants ───────────────────────────────────────────────
const COLORS = {
  bg: '#0D1117',
  surface: '#161B22',
  surfaceHover: '#1C2128',
  border: '#30363D',
  text: '#E6EDF3',
  textMuted: '#8B949E',
  accent: '#38BDF8',
  accentDark: '#0C4A6E',
  userBubble: '#38BDF8',
  error: '#F85149',
  success: '#3FB950',
};

const MODES = [
  { id: 'explain', label: '📖 Explain Simply', shortLabel: 'Explain' },
  { id: 'quiz', label: '📝 Quiz Me', shortLabel: 'Quiz' },
  { id: 'keypoints', label: '🔑 Key Points', shortLabel: 'Key Points' },
  { id: 'ask', label: '💬 Ask Anything', shortLabel: 'Ask' },
];

const SYSTEM_PROMPTS = {
  explain: (notes) => `You are a friendly study tutor. The student has uploaded their notes. Explain the following notes in very simple, easy-to-understand language with examples and emojis. Use clear formatting. Notes:\n\n${notes}`,
  quiz: (notes) => `Based on the following notes, generate 3 MCQs. Format exactly like this:\n\nQ1. [question]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\n✅ Answer: [letter] - [brief explanation]\n\nRepeat for Q2 and Q3. Notes:\n\n${notes}`,
  keypoints: (notes) => `Extract and list the most important key points from the following notes in clear bullet format. Bold the main terms. Use this format:\n\n• **[Main Term]** — explanation\n\nNotes:\n\n${notes}`,
  ask: (notes) => `You are a helpful tutor. Answer the student's questions based on the following notes only. If the answer is not in the notes, say so politely and suggest what the student might want to study. Notes:\n\n${notes}`,
};

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  app: { display: 'flex', flexDirection: 'column', height: '100vh', background: COLORS.bg },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}`,
    background: COLORS.surface, flexShrink: 0, gap: '12px', flexWrap: 'wrap',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { fontSize: '20px', fontWeight: 700, color: COLORS.text, display: 'flex', alignItems: 'center', gap: '8px' },
  badge: (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
    background: active ? 'rgba(56,189,248,0.15)' : 'rgba(139,148,158,0.1)',
    color: active ? COLORS.accent : COLORS.textMuted,
    border: `1px solid ${active ? 'rgba(56,189,248,0.3)' : COLORS.border}`,
    transition: 'all 0.2s', cursor: 'default', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  }),
  headerRight: { display: 'flex', gap: '8px', alignItems: 'center' },
  headerBtn: {
    padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
    background: 'rgba(139,148,158,0.1)', color: COLORS.textMuted,
    border: `1px solid ${COLORS.border}`, cursor: 'pointer', transition: 'all 0.2s',
  },

  modesBar: {
    display: 'flex', gap: '4px', padding: '8px 20px',
    borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg,
    overflowX: 'auto', flexShrink: 0,
  },
  modeTab: (active) => ({
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
    background: active ? 'rgba(56,189,248,0.15)' : 'transparent',
    color: active ? COLORS.accent : COLORS.textMuted,
    border: 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
  }),

  chatArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },

  messageRow: (isUser) => ({
    display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
    animation: 'fadeIn 0.3s ease',
  }),
  messageBubble: (isUser) => ({
    maxWidth: '75%', padding: '12px 16px', borderRadius: '16px',
    background: isUser ? COLORS.userBubble : COLORS.surface,
    color: isUser ? '#0D1117' : COLORS.text,
    fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordWrap: 'break-word',
    border: isUser ? 'none' : `1px solid ${COLORS.border}`,
    borderTopRightRadius: isUser ? '4px' : '16px',
    borderTopLeftRadius: isUser ? '16px' : '4px',
  }),
  aiAvatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginRight: '8px',
  },

  typingIndicator: {
    display: 'flex', gap: '4px', padding: '12px 16px',
    background: COLORS.surface, borderRadius: '16px', borderTopLeftRadius: '4px',
    border: `1px solid ${COLORS.border}`, alignSelf: 'flex-start',
    animation: 'fadeIn 0.3s ease',
  },
  typingDot: (delay) => ({
    width: '8px', height: '8px', borderRadius: '50%',
    background: COLORS.accent, animation: `bounce 1.4s infinite`, animationDelay: `${delay}ms`,
  }),

  inputBar: {
    display: 'flex', gap: '10px', padding: '16px 20px',
    borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface, flexShrink: 0,
  },
  inputField: (disabled) => ({
    flex: 1, padding: '12px 16px', borderRadius: '12px',
    background: COLORS.bg, border: `1px solid ${COLORS.border}`,
    color: COLORS.text, fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s', opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  }),
  sendBtn: (disabled) => ({
    padding: '12px 20px', borderRadius: '12px', border: 'none',
    background: disabled ? COLORS.border : COLORS.accent,
    color: disabled ? COLORS.textMuted : '#0D1117',
    fontSize: '14px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  }),

  welcome: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '40px 20px', gap: '32px', overflowY: 'auto',
  },
  welcomeIcon: { fontSize: '64px', marginBottom: '8px' },
  welcomeTitle: { fontSize: '28px', fontWeight: 700, color: COLORS.text, textAlign: 'center' },
  welcomeSub: { fontSize: '15px', color: COLORS.textMuted, textAlign: 'center', maxWidth: '400px' },

  dropZone: (dragOver) => ({
    width: '100%', maxWidth: '500px', padding: '48px 32px', borderRadius: '16px',
    border: `2px dashed ${dragOver ? COLORS.accent : COLORS.border}`,
    background: dragOver ? 'rgba(56,189,248,0.05)' : COLORS.surface,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    cursor: 'pointer', transition: 'all 0.2s',
    boxShadow: dragOver ? `0 0 30px rgba(56,189,248,0.15)` : 'none',
  }),
  dropIcon: { fontSize: '48px', opacity: 0.6 },
  dropText: { fontSize: '14px', color: COLORS.textMuted, textAlign: 'center' },
  dropHint: { fontSize: '12px', color: COLORS.textMuted, opacity: 0.6 },

  textArea: {
    width: '100%', maxWidth: '500px', padding: '16px', borderRadius: '12px',
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    color: COLORS.text, fontSize: '14px', minHeight: '120px', resize: 'vertical',
    outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
    transition: 'border-color 0.2s',
  },
  startBtn: (disabled) => ({
    padding: '12px 32px', borderRadius: '12px', border: 'none',
    background: disabled ? COLORS.border : COLORS.accent,
    color: disabled ? COLORS.textMuted : '#0D1117',
    fontSize: '15px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  }),

  removeBtn: {
    background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer',
    fontSize: '16px', padding: '0 4px', lineHeight: 1, transition: 'color 0.2s',
  },
};

// ─── Keyframes injected once ─────────────────────────────────
const keyframes = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
`;

// ─── File Extraction Helpers ─────────────────────────────────
async function extractText(file) {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return await file.text();
  }
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    // Dynamic import for pdfjs-dist to avoid build issues
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text.trim();
  }
  if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  // Fallback: try as text
  try { return await file.text(); } catch { throw new Error('Unsupported file format'); }
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Main App Component ─────────────────────────────────────
export default function App() {
  const [notes, setNotes] = useState(null); // { name, content, wordCount }
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Inject keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-focus input after AI responds
  useEffect(() => {
    if (!loading && notes && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, notes]);

  const handleFile = useCallback(async (file) => {
    try {
      const content = await extractText(file);
      if (!content.trim()) throw new Error('No text found in file');
      setNotes({ name: file.name, content: content.trim(), wordCount: wordCount(content) });
      setMode('explain');
      setMessages([]);
      // Auto-send first explain
      await sendModeMessage('explain', content.trim());
    } catch (err) {
      alert('Could not read file: ' + err.message);
    }
  }, []);

  const sendModeMessage = async (modeId, notesContent) => {
    const modeObj = MODES.find(m => m.id === modeId);
    const userMsg = modeId === 'explain' ? 'Explain my notes simply'
      : modeId === 'quiz' ? 'Quiz me on my notes'
      : modeId === 'keypoints' ? 'Extract key points from my notes'
      : null;

    if (!userMsg) return; // 'ask' mode doesn't auto-send

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const aiContent = await callAI(SYSTEM_PROMPTS[modeId](notesContent), []);
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  const callAI = async (systemPrompt, history) => {
    const apiBase = window.__AI_BASE_URL || '';
    const apiKey = window.__AI_API_KEY || '';

    const res = await fetch(`${apiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'drytis/kimi-k2.5',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response received.';
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !notes || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const systemPrompt = SYSTEM_PROMPTS[mode || 'ask'](notes.content);
      const aiContent = await callAI(systemPrompt, history);
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  const handleModeChange = (newMode) => {
    if (!notes || loading) return;
    setMode(newMode);
    setMessages([]);
    if (newMode !== 'ask') {
      sendModeMessage(newMode, notes.content);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    if (mode !== 'ask') {
      sendModeMessage(mode, notes.content);
    }
  };

  const handleChangeNotes = () => {
    setNotes(null);
    setMessages([]);
    setMode(null);
    setPasteText('');
  };

  const handleStartPasted = async () => {
    const content = pasteText.trim();
    if (!content) return;
    setNotes({ name: 'Pasted Notes', content, wordCount: wordCount(content) });
    setMode('explain');
    setMessages([]);
    setPasteText('');
    await sendModeMessage('explain', content);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  // ─── Welcome Screen ──────────────────────────────────────
  if (!notes) {
    return (
      <div style={styles.welcome}>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.welcomeIcon}>📚</div>
          <h1 style={styles.welcomeTitle}>SmartStudy AI</h1>
          <p style={styles.welcomeSub}>Upload your notes, AI will teach you</p>
        </div>

        <div
          style={styles.dropZone(dragOver)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div style={styles.dropIcon}>📄</div>
          <p style={{ fontSize: '15px', color: COLORS.text, fontWeight: 500 }}>
            {dragOver ? 'Drop your file here!' : 'Drag & drop your notes file'}
          </p>
          <p style={styles.dropText}>or click to browse</p>
          <p style={styles.dropHint}>Supports PDF, TXT, DOCX</p>
          <input id="file-input" type="file" accept=".pdf,.txt,.docx" onChange={handleFileInput} style={{ display: 'none' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '500px' }}>
          <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
          <span style={{ fontSize: '13px', color: COLORS.textMuted }}>or paste your notes below</span>
          <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
        </div>

        <textarea
          style={styles.textArea}
          placeholder="Paste your notes text here..."
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = COLORS.accent}
          onBlur={(e) => e.target.style.borderColor = COLORS.border}
        />

        <button
          style={styles.startBtn(!pasteText.trim())}
          onClick={handleStartPasted}
          disabled={!pasteText.trim()}
          onMouseEnter={(e) => { if (pasteText.trim()) e.target.style.opacity = '0.9'; }}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Start Studying
        </button>
      </div>
    );
  }

  // ─── Main Chat Interface ─────────────────────────────────
  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>📚 SmartStudy AI</div>
          <div style={styles.badge(true)}>
            ✅ {notes.name} <span style={{ opacity: 0.6 }}>({notes.wordCount} words)</span>
            <button style={styles.removeBtn} onClick={handleChangeNotes} title="Remove notes">✕</button>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.headerBtn} onClick={handleNewChat}
            onMouseEnter={(e) => { e.target.style.background = COLORS.surfaceHover; e.target.style.color = COLORS.text; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(139,148,158,0.1)'; e.target.style.color = COLORS.textMuted; }}
          >🔄 New Chat</button>
          <button style={styles.headerBtn} onClick={handleChangeNotes}
            onMouseEnter={(e) => { e.target.style.background = COLORS.surfaceHover; e.target.style.color = COLORS.text; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(139,148,158,0.1)'; e.target.style.color = COLORS.textMuted; }}
          >📂 Change Notes</button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div style={styles.modesBar}>
        {MODES.map(m => (
          <button key={m.id} style={styles.modeTab(mode === m.id)} onClick={() => handleModeChange(m.id)}
            onMouseEnter={(e) => { if (mode !== m.id) e.target.style.background = 'rgba(139,148,158,0.1)'; }}
            onMouseLeave={(e) => { if (mode !== m.id) e.target.style.background = 'transparent'; }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea} ref={chatRef}>
        {messages.length === 0 && mode === 'ask' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
            <p style={{ fontSize: '16px', fontWeight: 500 }}>Ask anything about your notes</p>
            <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.6 }}>Type your question below</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={styles.messageRow(msg.role === 'user')}>
            {msg.role === 'assistant' && <div style={styles.aiAvatar}>🤖</div>}
            <div style={styles.messageBubble(msg.role === 'user')}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={styles.typingIndicator}>
            <div style={styles.aiAvatar}>🤖</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '4px' }}>
              {[0, 150, 300].map((delay) => <div key={delay} style={styles.typingDot(delay)} />)}
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div style={styles.inputBar}>
        <input
          ref={inputRef}
          style={styles.inputField(!notes || loading)}
          placeholder={notes ? (mode === 'ask' ? 'Ask anything about your notes...' : 'Ask a follow-up...') : 'Upload notes first...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!notes || loading}
          onFocus={(e) => { if (notes) e.target.style.borderColor = COLORS.accent; }}
          onBlur={(e) => e.target.style.borderColor = COLORS.border}
        />
        <button
          style={styles.sendBtn(!input.trim() || loading)}
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}