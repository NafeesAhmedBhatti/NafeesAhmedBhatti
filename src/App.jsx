import React, { useState, useRef, useEffect, useCallback } from 'react';
import mammoth from 'mammoth';

// ─── Constants ───────────────────────────────────────────────
const COLORS = {
  bg: '#09090B',
  surface: '#131316',
  surfaceLight: '#1A1A1F',
  border: '#27272A',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  accent: '#38BDF8',
  accentGlow: 'rgba(56,189,248,0.25)',
  gradient1: '#38BDF8',
  gradient2: '#818CF8',
  gradient3: '#C084FC',
  success: '#34D399',
  error: '#F87171',
};

const MODES = [
  { id: 'explain', label: 'Explain Simply', icon: '📖', desc: 'Easy language with examples' },
  { id: 'quiz', label: 'Quiz Me', icon: '📝', desc: '3 MCQs from your notes' },
  { id: 'keypoints', label: 'Key Points', icon: '🔑', desc: 'Important bullet points' },
  { id: 'ask', label: 'Ask Anything', icon: '💬', desc: 'Custom Q&A about notes' },
];

const SYSTEM_PROMPTS = {
  explain: (n) => `You are a friendly study tutor. The student has uploaded their notes. Explain the following notes in very simple, easy-to-understand language with examples and emojis. Use clear formatting with headers and bullet points. Notes:\n\n${n}`,
  quiz: (n) => `Based on the following notes, generate 3 MCQs. Format exactly like:\n\n**Q1.** [question]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\n\n✅ **Answer:** [letter] — [brief explanation]\n\nRepeat for Q2, Q3. Notes:\n\n${n}`,
  keypoints: (n) => `Extract the most important key points from these notes in clear bullet format. Bold main terms. Use:\n\n• **[Term]** — explanation\n\nNotes:\n\n${n}`,
  ask: (n) => `You are a helpful tutor. Answer questions based on these notes only. If not in notes, say so politely. Notes:\n\n${n}`,
};

const NAV_LINKS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'features', label: 'Features', icon: '⚡' },
  { id: 'study', label: 'Study Now', icon: '📚' },
];

// ─── 3D Card Component ───────────────────────────────────────
function Card3D({ children, style = {}, glow = false, className = '' }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale3d(1.02,1.02,1.02)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale3d(1,1,1)';
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        borderRadius: '20px',
        ...(glow ? { boxShadow: `0 0 40px ${COLORS.accentGlow}, 0 8px 32px rgba(0,0,0,0.4)` } : {}),
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 40);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(start);
    }, 30);
    return () => clearInterval(id);
  }, [target]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

// ─── Floating Orb Component ──────────────────────────────────
function FloatingOrb({ color, size, top, left, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute', top, left, width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10, transparent)`,
      filter: `blur(${parseInt(size) / 4}px)`,
      animation: `floatOrb 8s ease-in-out infinite`, animationDelay: `${delay}s`,
      pointerEvents: 'none',
    }} />
  );
}

// ─── Feature Card ────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), delay); }, [delay]);
  return (
    <Card3D style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: `all 0.6s ease ${delay}ms` }}>
      <div style={{
        padding: '32px', borderRadius: '20px', background: COLORS.surface,
        border: `1px solid ${COLORS.border}`, height: '100%',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: `linear-gradient(135deg, ${COLORS.gradient1}20, ${COLORS.gradient2}20)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', marginBottom: '20px',
        }}>{icon}</div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px', color: COLORS.text }}>{title}</h3>
        <p style={{ fontSize: '14px', color: COLORS.textMuted, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </Card3D>
  );
}

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ value, suffix, label, gradient }) {
  return (
    <div style={{
      textAlign: 'center', padding: '32px 24px', borderRadius: '20px',
      background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceLight})`,
      border: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ fontSize: '36px', fontWeight: 700, background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        <AnimatedNumber target={value} suffix={suffix} />
      </div>
      <div style={{ fontSize: '14px', color: COLORS.textMuted, marginTop: '8px' }}>{label}</div>
    </div>
  );
}

// ─── File Extraction ─────────────────────────────────────────
async function extractText(file) {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) return await file.text();
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let t = '';
    for (let i = 1; i <= pdf.numPages; i++) { const p = await pdf.getPage(i); const c = await p.getTextContent(); t += c.items.map(x => x.str).join(' ') + '\n'; }
    return t.trim();
  }
  if (file.name.endsWith('.docx')) { const ab = await file.arrayBuffer(); const r = await mammoth.extractRawText({ arrayBuffer: ab }); return r.value; }
  try { return await file.text(); } catch { throw new Error('Unsupported format'); }
}
function wordCount(t) { return t.trim().split(/\s+/).filter(Boolean).length; }

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home');
  const [notes, setNotes] = useState(null);
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes fadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      @keyframes bounce { 0%,80%,100% { transform:scale(0) } 40% { transform:scale(1) } }
      @keyframes floatOrb { 0%,100% { transform:translateY(0) scale(1) } 50% { transform:translateY(-30px) scale(1.05) } }
      @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
      @keyframes slideUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
      @keyframes shimmer { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
      @keyframes glow { 0%,100% { box-shadow:0 0 20px ${COLORS.accentGlow} } 50% { box-shadow:0 0 40px ${COLORS.accentGlow}, 0 0 80px ${COLORS.accentGlow} } }
      * { scrollbar-width:thin; scrollbar-color:${COLORS.border} transparent; }
      ::-webkit-scrollbar { width:6px } ::-webkit-scrollbar-track { background:transparent } ::-webkit-scrollbar-thumb { background:${COLORS.border}; border-radius:3px }
      ::selection { background:${COLORS.accent}40 }
      html { scroll-behavior:smooth }
    `;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, loading]);
  useEffect(() => { if (!loading && notes && inputRef.current) inputRef.current.focus(); }, [loading, notes]);

  const callAI = async (systemPrompt, history) => {
    const res = await fetch(`${window.__AI_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.__AI_API_KEY}` },
      body: JSON.stringify({ model: 'drytis/kimi-k2.5', max_tokens: 1500, messages: [{ role: 'system', content: systemPrompt }, ...history] }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `API error ${res.status}`); }
    const d = await res.json();
    return d.choices?.[0]?.message?.content || 'No response.';
  };

  const sendModeMessage = async (modeId, notesContent) => {
    const userMsg = modeId === 'explain' ? 'Explain my notes simply' : modeId === 'quiz' ? 'Quiz me on my notes' : modeId === 'keypoints' ? 'Extract key points' : null;
    if (!userMsg) return;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const ai = await callAI(SYSTEM_PROMPTS[modeId](notesContent), []);
      setMessages(prev => [...prev, { role: 'assistant', content: ai }]);
    } catch (err) { setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }]); }
    setLoading(false);
  };

  const handleFile = useCallback(async (file) => {
    try {
      const content = await extractText(file);
      if (!content.trim()) throw new Error('No text found');
      setNotes({ name: file.name, content: content.trim(), wordCount: wordCount(content) });
      setMode('explain'); setMessages([]);
      setPage('study');
      await sendModeMessage('explain', content.trim());
    } catch (err) { alert('Could not read file: ' + err.message); }
  }, []);

  const handleStartPasted = async () => {
    const content = pasteText.trim();
    if (!content) return;
    setNotes({ name: 'Pasted Notes', content, wordCount: wordCount(content) });
    setMode('explain'); setMessages([]); setPasteText('');
    setPage('study');
    await sendModeMessage('explain', content);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !notes || loading) return;
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs); setInput(''); setLoading(true);
    try {
      const history = newMsgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const ai = await callAI(SYSTEM_PROMPTS[mode || 'ask'](notes.content), history);
      setMessages(prev => [...prev, { role: 'assistant', content: ai }]);
    } catch (err) { setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }]); }
    setLoading(false);
  };

  const handleModeChange = (newMode) => {
    if (!notes || loading) return;
    setMode(newMode); setMessages([]);
    if (newMode !== 'ask') sendModeMessage(newMode, notes.content);
  };

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }, [handleFile]);

  // ═══════════════════════════════════════════════════════════
  // NAVBAR
  // ═══════════════════════════════════════════════════════════
  const Navbar = () => (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setPage('home')}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 15px ${COLORS.accentGlow}`,
            fontSize: '20px',
          }}>📚</div>
          <span style={{ fontSize: '20px', fontWeight: 700 }}>
            <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2}, ${COLORS.gradient3})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SmartStudy</span>
            <span style={{ color: COLORS.textMuted, fontWeight: 400, marginLeft: '4px' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {NAV_LINKS.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id === 'study' && !notes ? 'features' : l.id === 'home' ? 'home' : 'study'); setMobileMenu(false); }}
              style={{
                padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
                background: page === l.id ? 'rgba(56,189,248,0.1)' : 'transparent',
                color: page === l.id ? COLORS.accent : COLORS.textMuted,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
              <span style={{ fontSize: '16px' }}>{l.icon}</span>
              <span className="hide-mobile">{l.label}</span>
            </button>
          ))}
          <button onClick={() => setPage(notes ? 'study' : 'features')}
            style={{
              padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
              color: '#000', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: `0 4px 15px ${COLORS.accentGlow}`,
            }}>
            {notes ? '📚 Study Now' : '🚀 Get Started'}
          </button>
        </div>
      </div>
    </nav>
  );

  // ═══════════════════════════════════════════════════════════
  // HOME PAGE
  // ═══════════════════════════════════════════════════════════
  const HomePage = () => (
    <div style={{ minHeight: '100vh', background: COLORS.bg, overflow: 'hidden' }}>
      <Navbar />
      {/* Hero */}
      <section style={{ position: 'relative', paddingTop: '160px', paddingBottom: '80px', textAlign: 'center', padding: '160px 24px 80px' }}>
        <FloatingOrb color={COLORS.gradient1} size="400px" top="-100px" left="-100px" />
        <FloatingOrb color={COLORS.gradient2} size="300px" top="100px" right="-50px" left="auto" />
        <FloatingOrb color={COLORS.gradient3} size="200px" top="300px" left="20%" delay={2} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 20px', borderRadius: '50px', fontSize: '13px',
            background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}30`,
            color: COLORS.accent, marginBottom: '32px',
            animation: 'fadeIn 0.6s ease',
          }}>
            <span style={{ animation: 'pulse 2s infinite' }}>✨</span> Powered by Advanced AI
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.1,
            marginBottom: '24px', animation: 'slideUp 0.8s ease',
          }}>
            Study <span style={{
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2}, ${COLORS.gradient3})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Smarter</span><br />not harder
          </h1>

          <p style={{
            fontSize: '18px', color: COLORS.textMuted, maxWidth: '540px',
            margin: '0 auto 40px', lineHeight: 1.7, animation: 'slideUp 0.8s ease 0.2s both',
          }}>
            Upload your notes and let AI transform them into easy explanations, quizzes, key points, and personalized tutoring. Works for any subject.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', animation: 'slideUp 0.8s ease 0.4s both' }}>
            <button onClick={() => setPage('features')}
              style={{
                padding: '16px 36px', borderRadius: '14px', fontSize: '16px', fontWeight: 600,
                background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                color: '#000', border: 'none', cursor: 'pointer',
                boxShadow: `0 8px 30px ${COLORS.accentGlow}`,
                transition: 'all 0.3s',
              }}>
              Start Learning Free →
            </button>
            <button onClick={() => setPage('features')}
              style={{
                padding: '16px 36px', borderRadius: '14px', fontSize: '16px', fontWeight: 500,
                background: 'transparent', color: COLORS.text,
                border: `1px solid ${COLORS.border}`, cursor: 'pointer', transition: 'all 0.3s',
              }}>
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          <StatCard value={10} suffix="K+" label="Students" gradient={`linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`} />
          <StatCard value={500} suffix="K+" label="Notes Analyzed" gradient={`linear-gradient(135deg, ${COLORS.gradient2}, ${COLORS.gradient3})`} />
          <StatCard value={98} suffix="%" label="Satisfaction" gradient={`linear-gradient(135deg, ${COLORS.gradient3}, ${COLORS.gradient1})`} />
          <StatCard value={4} suffix="" label="Study Modes" gradient={`linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient3})`} />
        </div>
      </section>

      {/* Features Preview */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
            Everything you need to <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ace your exams</span>
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: '16px' }}>Powerful AI tools designed for modern students</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <FeatureCard icon="📖" title="Explain Simply" desc="Complex notes explained in simple language with examples and visual aids. Like having a personal tutor." delay={100} />
          <FeatureCard icon="📝" title="Smart Quizzes" desc="AI generates multiple choice questions from your notes with detailed explanations for each answer." delay={200} />
          <FeatureCard icon="🔑" title="Key Points" desc="Instantly extract the most important concepts, terms, and formulas from lengthy study materials." delay={300} />
          <FeatureCard icon="💬" title="Ask Anything" desc="Chat with your notes — ask any question and get accurate answers based on your study materials." delay={400} />
          <FeatureCard icon="📄" title="Smart Upload" desc="Drag and drop PDFs, DOCX, or TXT files. Paste text directly. Any subject, any language." delay={500} />
          <FeatureCard icon="⚡" title="Instant Results" desc="Get AI-powered study help in seconds. No signup, no login, no payment. Just start studying." delay={600} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${COLORS.border}`, padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📚</div>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>SmartStudy AI</span>
        </div>
        <p style={{ color: COLORS.textMuted, fontSize: '13px' }}>© 2026 SmartStudy AI. Making studying effortless for everyone.</p>
      </footer>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // FEATURES / UPLOAD PAGE
  // ═══════════════════════════════════════════════════════════
  const FeaturesPage = () => (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '120px 24px 60px', position: 'relative' }}>
        <FloatingOrb color={COLORS.gradient1} size="300px" top="80px" left="-150px" />
        <FloatingOrb color={COLORS.gradient3} size="200px" top="400px" left="auto" right="-80px" delay={1} />

        <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 1, animation: 'slideUp 0.6s ease' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
            Upload your <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>notes</span>
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: '15px' }}>AI will teach you everything — any subject, any topic</p>
        </div>

        {/* Drop Zone */}
        <Card3D glow={dragOver} style={{ marginBottom: '32px', animation: 'slideUp 0.6s ease 0.2s both' }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            style={{
              padding: '56px 32px', borderRadius: '20px', background: COLORS.surface,
              border: `2px dashed ${dragOver ? COLORS.accent : COLORS.border}`,
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
            }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', filter: dragOver ? 'drop-shadow(0 0 20px #38BDF8)' : 'none' }}>📄</div>
            <p style={{ fontSize: '17px', fontWeight: 600, marginBottom: '8px', color: dragOver ? COLORS.accent : COLORS.text }}>
              {dragOver ? 'Drop your file here!' : 'Drag & drop your notes file'}
            </p>
            <p style={{ fontSize: '14px', color: COLORS.textMuted }}>or click to browse — PDF, TXT, DOCX</p>
            <input id="file-input" type="file" accept=".pdf,.txt,.docx" onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; }} style={{ display: 'none' }} />
          </div>
        </Card3D>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', animation: 'slideUp 0.6s ease 0.3s both' }}>
          <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
          <span style={{ fontSize: '13px', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>or paste your notes below</span>
          <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
        </div>

        {/* Text Area */}
        <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Paste your lecture notes, textbook content, or any study material here..."
          style={{
            width: '100%', padding: '20px', borderRadius: '16px', background: COLORS.surface,
            border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: '14px',
            minHeight: '160px', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            lineHeight: 1.6, marginBottom: '20px', transition: 'border-color 0.2s',
            animation: 'slideUp 0.6s ease 0.4s both',
          }}
          onFocus={(e) => e.target.style.borderColor = COLORS.accent}
          onBlur={(e) => e.target.style.borderColor = COLORS.border}
        />

        <div style={{ textAlign: 'center', animation: 'slideUp 0.6s ease 0.5s both' }}>
          <button onClick={handleStartPasted} disabled={!pasteText.trim()}
            style={{
              padding: '16px 48px', borderRadius: '14px', fontSize: '16px', fontWeight: 600,
              background: pasteText.trim() ? `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})` : COLORS.border,
              color: pasteText.trim() ? '#000' : COLORS.textMuted,
              border: 'none', cursor: pasteText.trim() ? 'pointer' : 'not-allowed',
              boxShadow: pasteText.trim() ? `0 8px 30px ${COLORS.accentGlow}` : 'none',
              transition: 'all 0.3s',
            }}>
            🚀 Start Studying
          </button>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '48px', animation: 'slideUp 0.6s ease 0.6s both' }}>
          {['📖 Explain', '📝 Quiz', '🔑 Key Points', '💬 Ask Anything'].map(f => (
            <span key={f} style={{
              padding: '8px 18px', borderRadius: '50px', fontSize: '13px',
              background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted,
            }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // STUDY PAGE (Chat Interface)
  // ═══════════════════════════════════════════════════════════
  const StudyPage = () => (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: COLORS.bg }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}`,
        background: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(20px)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: `0 4px 15px ${COLORS.accentGlow}` }}>📚</div>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>SmartStudy <span style={{ color: COLORS.textMuted, fontWeight: 400 }}>AI</span></span>
          {notes && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '50px', fontSize: '12px',
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
              color: COLORS.success, maxWidth: '250px',
            }}>
              ✅ {notes.name} <span style={{ opacity: 0.6 }}>({notes.wordCount} words)</span>
              <button onClick={() => { setNotes(null); setMessages([]); setMode(null); setPage('features'); }}
                style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', fontSize: '14px', padding: '0 2px' }}>✕</button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setMessages([]); if (mode !== 'ask') sendModeMessage(mode, notes.content); }}
            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
            🔄 New Chat
          </button>
          <button onClick={() => { setNotes(null); setMessages([]); setMode(null); setPage('features'); }}
            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
            📂 Change Notes
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div style={{
        display: 'flex', gap: '6px', padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.bg, flexShrink: 0, overflowX: 'auto',
      }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => handleModeChange(m.id)}
            style={{
              padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 500,
              background: mode === m.id ? `linear-gradient(135deg, ${COLORS.gradient1}20, ${COLORS.gradient2}20)` : 'transparent',
              color: mode === m.id ? COLORS.accent : COLORS.textMuted,
              border: mode === m.id ? `1px solid ${COLORS.accent}40` : `1px solid transparent`,
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
            <span style={{ fontSize: '16px' }}>{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.length === 0 && mode === 'ask' && (
          <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Ask anything about your notes</p>
            <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Type your question in the input below</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeIn 0.3s ease',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0, marginRight: '12px',
                background: `linear-gradient(135deg, ${COLORS.gradient1}20, ${COLORS.gradient2}20)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                border: `1px solid ${COLORS.border}`,
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: '70%', padding: '16px 20px', borderRadius: '20px',
              background: msg.role === 'user' ? `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})` : COLORS.surface,
              color: msg.role === 'user' ? '#000' : COLORS.text,
              fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordWrap: 'break-word',
              border: msg.role === 'user' ? 'none' : `1px solid ${COLORS.border}`,
              borderTopRightRadius: msg.role === 'user' ? '6px' : '20px',
              borderTopLeftRadius: msg.role === 'assistant' ? '6px' : '20px',
              boxShadow: msg.role === 'user' ? `0 4px 20px ${COLORS.accentGlow}` : 'none',
            }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0, marginRight: '12px',
              background: `linear-gradient(135deg, ${COLORS.gradient1}20, ${COLORS.gradient2}20)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              border: `1px solid ${COLORS.border}`,
            }}>🤖</div>
            <div style={{
              padding: '16px 24px', borderRadius: '20px', borderTopLeftRadius: '6px',
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              {[0, 150, 300].map(d => <div key={d} style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS.accent, animation: 'bounce 1.4s infinite', animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '12px', padding: '16px 20px',
        borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface, flexShrink: 0,
      }}>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={notes ? (mode === 'ask' ? 'Ask anything about your notes...' : 'Ask a follow-up...') : 'Upload notes first...'}
          disabled={!notes || loading}
          style={{
            flex: 1, padding: '14px 20px', borderRadius: '14px', background: COLORS.bg,
            border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: '14px',
            outline: 'none', transition: 'border-color 0.2s', opacity: !notes || loading ? 0.5 : 1,
          }}
          onFocus={(e) => { if (notes) e.target.style.borderColor = COLORS.accent; }}
          onBlur={(e) => e.target.style.borderColor = COLORS.border}
        />
        <button onClick={handleSend} disabled={!input.trim() || loading}
          style={{
            padding: '14px 28px', borderRadius: '14px', border: 'none',
            background: input.trim() && !loading ? `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})` : COLORS.border,
            color: input.trim() && !loading ? '#000' : COLORS.textMuted,
            fontSize: '14px', fontWeight: 600, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            boxShadow: input.trim() ? `0 4px 15px ${COLORS.accentGlow}` : 'none',
            transition: 'all 0.3s',
          }}>
          Send ➤
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // ROUTE
  // ═══════════════════════════════════════════════════════════
  if (page === 'study' && notes) return <StudyPage />;
  if (page === 'features' || page === 'study') return <FeaturesPage />;
  return <HomePage />;
}