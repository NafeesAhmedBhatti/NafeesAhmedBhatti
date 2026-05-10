import React, { useState, useRef, useEffect, useCallback } from 'react';
import mammoth from 'mammoth';
import { BookOpen, Upload, MessageSquare, Brain, Sparkles, ChevronRight, FileText, Zap, Target, ArrowRight, RotateCcw, X, Send, Menu, ArrowUpRight, Check, Star } from 'lucide-react';

// ─── Tokens ──────────────────────────────────────────────────
const c = {
  bg: '#09090B', bg2: '#0F0F12', surface: '#141418', surfaceHover: '#1C1C21',
  border: '#222228', borderLight: '#2C2C33',
  text: '#EDEDEF', text2: '#A0A0AB', text3: '#66666F',
  blue: '#3B82F6', blueLight: '#60A5FA', blueBg: 'rgba(59,130,246,0.08)', blueBorder: 'rgba(59,130,246,0.2)',
  green: '#22C55E', greenBg: 'rgba(34,197,94,0.08)',
};

const lucide = (Icon, size = 18, color = c.text2) =>
  React.createElement(Icon, { size, color, strokeWidth: 1.8 });

// ─── System Prompts ──────────────────────────────────────────
const PROMPTS = {
  explain: (n) => `You are a patient, clear tutor. Explain these notes in simple language with examples. Use markdown headers and bullet points. Notes:\n\n${n}`,
  quiz: (n) => `Generate 3 MCQs from these notes. Use this format:\n\n**Q1.** question\nA) option\nB) option\nC) option\nD) option\n\n✅ **Answer:** letter — explanation\n\nNotes:\n\n${n}`,
  keypoints: (n) => `Extract key points as bullets. Bold main terms:\n\n• **Term** — explanation\n\nNotes:\n\n${n}`,
  ask: (n) => `Answer based on these notes only. If not in notes, say so. Notes:\n\n${n}`,
};

const MODES = [
  { id: 'explain', label: 'Explain', icon: BookOpen, desc: 'Simple explanation' },
  { id: 'quiz', label: 'Quiz', icon: Target, desc: '3 MCQ questions' },
  { id: 'keypoints', label: 'Key Points', icon: Zap, desc: 'Bullet summary' },
  { id: 'ask', label: 'Ask', icon: MessageSquare, desc: 'Custom question' },
];

// ─── Helpers ─────────────────────────────────────────────────
async function extractText(file) {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) return await file.text();
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const pdfjsLib = await import('pdfjs-dist'); pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    const ab = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let t = ''; for (let i = 1; i <= pdf.numPages; i++) { const p = await pdf.getPage(i); const ct = await p.getTextContent(); t += ct.items.map(x => x.str).join(' ') + '\n'; } return t.trim();
  }
  if (file.name.endsWith('.docx')) { const ab = await file.arrayBuffer(); const r = await mammoth.extractRawText({ arrayBuffer: ab }); return r.value; }
  try { return await file.text(); } catch { throw new Error('Unsupported format'); }
}
const wc = (t) => t.trim().split(/\s+/).filter(Boolean).length;

// ─── Animations ──────────────────────────────────────────────
const css = `
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes dot{0%,80%,100%{opacity:.25}40%{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
*{scrollbar-width:thin;scrollbar-color:${c.border} transparent}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${c.border};border-radius:4px}
::selection{background:${c.blueBg}}
`;

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home');
  const [notes, setNotes] = useState(null);
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [paste, setPaste] = useState('');
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); return () => s.remove(); }, []);
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { !loading && notes && inputRef.current?.focus(); }, [loading, notes]);

  const callAI = async (sys, hist) => {
    const r = await fetch(`${window.__AI_BASE_URL}/v1/chat/completions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.__AI_API_KEY}` },
      body: JSON.stringify({ model: 'drytis/kimi-k2.5', max_tokens: 1500, messages: [{ role: 'system', content: sys }, ...hist] }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `Error ${r.status}`); }
    return (await r.json()).choices?.[0]?.message?.content || 'No response.';
  };

  const sendMode = async (id, nc) => {
    const msg = { explain: 'Explain my notes simply', quiz: 'Generate a quiz', keypoints: 'Extract key points' }[id];
    if (!msg) return;
    setMessages(p => [...p, { role: 'user', content: msg }]); setLoading(true);
    try { const ai = await callAI(PROMPTS[id](nc), []); setMessages(p => [...p, { role: 'assistant', content: ai }]); }
    catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const handleFile = useCallback(async (f) => {
    try {
      const content = await extractText(f);
      if (!content.trim()) throw new Error('Empty file');
      setNotes({ name: f.name, content: content.trim(), wc: wc(content) });
      setMode('explain'); setMessages([]); setPage('study');
      await sendMode('explain', content.trim());
    } catch (e) { alert(e.message); }
  }, []);

  const handleSend = async () => {
    const t = input.trim(); if (!t || !notes || loading) return;
    const nm = [...messages, { role: 'user', content: t }]; setMessages(nm); setInput(''); setLoading(true);
    try { const ai = await callAI(PROMPTS[mode || 'ask'](notes.content), nm.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))); setMessages(p => [...p, { role: 'assistant', content: ai }]); }
    catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  // ═══════ NAV ═══════
  const Nav = () => (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${c.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setPage('home')}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: c.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{lucide(Brain, 18, '#fff')}</div>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>SmartStudy<span style={{ color: c.text3, fontWeight: 400, marginLeft: 3 }}>AI</span></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {[['home', 'Home'], ['features', 'Features']].map(([id, label]) => (
          <button key={id} onClick={() => setPage(id)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: page === id ? c.blueBg : 'transparent', color: page === id ? c.blueLight : c.text3, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>{label}</button>
        ))}
        <button onClick={() => setPage(notes ? 'study' : 'features')} style={{ marginLeft: 8, padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: c.blue, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {notes ? 'Study Now' : 'Get Started'} {lucide(ArrowRight, 14, '#fff')}
        </button>
      </div>
    </nav>
  );

  // ═══════ HOME ═══════
  const Home = () => {
    const [v, setV] = useState(false); useEffect(() => { setTimeout(() => setV(true), 100); }, []);
    const s = (delay) => ({ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)', transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms` });
    return (
      <div style={{ minHeight: '100vh', background: c.bg }}>
        <Nav />
        {/* Gradient mesh */}
        <div style={{ position: 'absolute', top: -200, left: '30%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${c.blue}08, transparent 70%)`, filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Hero */}
        <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 180, paddingBottom: 120, padding: '180px 24px 120px', textAlign: 'center', position: 'relative' }}>
          <div style={{ ...s(0), display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: c.blueBg, border: `1px solid ${c.blueBorder}`, marginBottom: 32 }}>
            <Sparkles size={13} color={c.blueLight} /> <span style={{ fontSize: 12, color: c.blueLight, fontWeight: 500 }}>Powered by AI</span>
          </div>
          <h1 style={{ ...s(100), fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20 }}>
            Study smarter<br /><span style={{ color: c.blueLight }}>not harder</span>
          </h1>
          <p style={{ ...s(200), fontSize: 17, color: c.text2, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 40px' }}>
            Upload your notes and let AI transform them into explanations, quizzes, and study guides. Any subject, instantly.
          </p>
          <div style={{ ...s(300), display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setPage('features')} style={{ padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: c.blue, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Start Learning {lucide(ChevronRight, 16, '#fff')}
            </button>
            <button onClick={() => setPage('features')} style={{ padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 500, background: c.surface, color: c.text2, border: `1px solid ${c.border}`, cursor: 'pointer' }}>
              See Features
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 100px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 1, background: c.border, borderRadius: 16, overflow: 'hidden' }}>
            {[
              [BookOpen, 'Explain Simply', 'Complex notes broken into simple, clear language with real examples'],
              [Target, 'Smart Quizzes', 'Multiple choice questions generated from your notes with explanations'],
              [Zap, 'Key Points', 'Important concepts extracted as a clean, organized bullet list'],
              [MessageSquare, 'Ask Anything', 'Chat with your notes — ask any question and get precise answers'],
              [Upload, 'Easy Upload', 'Drag and drop PDF, DOCX, or TXT. Or paste text directly'],
              [Sparkles, 'Instant Results', 'No signup, no login. Upload and start studying in seconds'],
            ].map(([Icon, title, desc], i) => (
              <div key={i} style={{ padding: 32, background: c.surface }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {lucide(Icon, 20, c.blueLight)}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: c.text3, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['10K+', 'Students'], ['500K+', 'Notes Analyzed'], ['4.9', 'Rating']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: c.text, letterSpacing: '-0.5px' }}>{n}</div>
              <div style={{ fontSize: 13, color: c.text3, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 100px', textAlign: 'center' }}>
          <div style={{ padding: 48, borderRadius: 16, background: `linear-gradient(135deg, ${c.surface}, ${c.bg2})`, border: `1px solid ${c.border}` }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Ready to study smarter?</h2>
            <p style={{ fontSize: 14, color: c.text2, marginBottom: 28 }}>No signup needed. Upload your notes and start now.</p>
            <button onClick={() => setPage('features')} style={{ padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: c.blue, color: '#fff', border: 'none', cursor: 'pointer' }}>
              Get Started Free
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${c.border}`, padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: c.text3 }}>© 2026 SmartStudy AI</p>
        </div>
      </div>
    );
  };

  // ═══════ FEATURES / UPLOAD ═══════
  const Features = () => {
    const [v, setV] = useState(false); useEffect(() => { setTimeout(() => setV(true), 100); }, []);
    const s = (d) => ({ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${d}ms` });
    return (
      <div style={{ minHeight: '100vh', background: c.bg }}>
        <Nav />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '120px 24px 60px' }}>
          <div style={{ ...s(0), textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>Upload your notes</h1>
            <p style={{ color: c.text3, fontSize: 14 }}>AI will help you understand any subject</p>
          </div>

          {/* Drop zone */}
          <div style={{ ...s(100), marginBottom: 28 }}>
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('fi').click()}
              style={{ padding: '48px 24px', borderRadius: 14, background: dragOver ? c.blueBg : c.surface, border: `1.5px dashed ${dragOver ? c.blue : c.border}`, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: c.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {lucide(Upload, 22, c.blueLight)}
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: dragOver ? c.blueLight : c.text }}>{dragOver ? 'Drop to upload' : 'Drag & drop your file'}</p>
              <p style={{ fontSize: 13, color: c.text3 }}>PDF, TXT, or DOCX — or click to browse</p>
              <input id="fi" type="file" accept=".pdf,.txt,.docx" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ ...s(200), display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: c.border }} />
            <span style={{ fontSize: 12, color: c.text3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>or paste text</span>
            <div style={{ flex: 1, height: 1, background: c.border }} />
          </div>

          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste your notes, lecture content, or study material here..."
            style={{ ...s(300), width: '100%', padding: 18, borderRadius: 12, background: c.surface, border: `1px solid ${c.border}`, color: c.text, fontSize: 14, minHeight: 140, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: 20, transition: 'border-color 0.15s' }}
            onFocus={(e) => e.target.style.borderColor = c.blue} onBlur={(e) => e.target.style.borderColor = c.border} />

          <div style={{ ...s(400), textAlign: 'center' }}>
            <button onClick={async () => { const ct = paste.trim(); if (!ct) return; setNotes({ name: 'Pasted Notes', content: ct, wc: wc(ct) }); setMode('explain'); setMessages([]); setPaste(''); setPage('study'); await sendMode('explain', ct); }}
              disabled={!paste.trim()}
              style={{ padding: '14px 44px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: paste.trim() ? c.blue : c.border, color: paste.trim() ? '#fff' : c.text3, border: 'none', cursor: paste.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
              Start Studying
            </button>
          </div>

          <div style={{ ...s(500), display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 }}>
            {MODES.map(m => (
              <span key={m.id} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, background: c.surface, border: `1px solid ${c.border}`, color: c.text3, display: 'flex', alignItems: 'center', gap: 6 }}>
                {lucide(m.icon, 13, c.text3)} {m.desc}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══════ STUDY ═══════
  const Study = () => (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: c.bg }}>
      {/* Top bar */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${c.border}`, background: c.bg, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: c.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{lucide(Brain, 15, '#fff')}</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>SmartStudy</span>
          {notes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 6, background: c.greenBg, fontSize: 12, color: c.green }}>
              {lucide(Check, 13, c.green)} {notes.name} <span style={{ color: c.text3 }}>({notes.wc} words)</span>
              <button onClick={() => { setNotes(null); setMessages([]); setMode(null); setPage('features'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>{lucide(X, 13, c.text3)}</button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setMessages([]); if (mode !== 'ask') sendMode(mode, notes.content); }}
            style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, background: c.surface, border: `1px solid ${c.border}`, color: c.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            {lucide(RotateCcw, 12, c.text3)} New Chat
          </button>
          <button onClick={() => { setNotes(null); setMessages([]); setMode(null); setPage('features'); }}
            style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, background: c.surface, border: `1px solid ${c.border}`, color: c.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            {lucide(Upload, 12, c.text3)} Change Notes
          </button>
        </div>
      </div>

      {/* Modes */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 20px', borderBottom: `1px solid ${c.border}`, background: c.bg, flexShrink: 0 }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { if (!notes || loading) return; setMode(m.id); setMessages([]); if (m.id !== 'ask') sendMode(m.id, notes.content); }}
            style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: mode === m.id ? c.blueBg : 'transparent', color: mode === m.id ? c.blueLight : c.text3, border: mode === m.id ? `1px solid ${c.blueBorder}` : '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 7 }}>
            {lucide(m.icon, 15, mode === m.id ? c.blueLight : c.text3)} {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.length === 0 && mode === 'ask' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeUp 0.4s ease' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: c.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{lucide(MessageSquare, 26, c.blueLight)}</div>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Ask anything</p>
            <p style={{ fontSize: 13, color: c.text3 }}>Type your question about the notes below</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.3s ease' }}>
            {m.role === 'assistant' && <div style={{ width: 32, height: 32, borderRadius: 8, background: c.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0, marginTop: 2 }}>{lucide(Brain, 16, c.blueLight)}</div>}
            <div style={{ maxWidth: '68%', padding: '14px 18px', borderRadius: 14, background: m.role === 'user' ? c.blue : c.surface, color: m.role === 'user' ? '#fff' : c.text, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', border: m.role === 'user' ? 'none' : `1px solid ${c.border}`, borderTopRightRadius: m.role === 'user' ? 4 : 14, borderTopLeftRadius: m.role === 'assistant' ? 4 : 14 }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: c.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 }}>{lucide(Brain, 16, c.blueLight)}</div>
            <div style={{ padding: '14px 20px', borderRadius: 14, borderTopLeftRadius: 4, background: c.surface, border: `1px solid ${c.border}`, display: 'flex', gap: 5 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: c.blueLight, animation: `dot 1.2s infinite`, animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${c.border}`, background: c.surface, flexShrink: 0 }}>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={notes ? (mode === 'ask' ? 'Ask about your notes...' : 'Follow-up question...') : 'Upload notes first...'}
          disabled={!notes || loading}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 14, outline: 'none', transition: 'border-color 0.15s', opacity: !notes || loading ? 0.4 : 1 }}
          onFocus={(e) => { if (notes) e.target.style.borderColor = c.blue; }} onBlur={(e) => e.target.style.borderColor = c.border} />
        <button onClick={handleSend} disabled={!input.trim() || loading}
          style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: input.trim() && !loading ? c.blue : c.border, color: input.trim() && !loading ? '#fff' : c.text3, fontSize: 14, fontWeight: 600, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
          Send {lucide(Send, 14, input.trim() && !loading ? '#fff' : c.text3)}
        </button>
      </div>
    </div>
  );

  if (page === 'study' && notes) return <Study />;
  if (page === 'features' || page === 'study') return <Features />;
  return <Home />;
}