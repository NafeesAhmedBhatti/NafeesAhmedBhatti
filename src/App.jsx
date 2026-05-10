import React, { useState, useRef, useEffect, useCallback } from 'react';
import mammoth from 'mammoth';
import {
  BookOpen, Upload, MessageSquare, Brain, Sparkles, ChevronRight, FileText, Zap, Target,
  ArrowRight, RotateCcw, X, Send, Menu, Home, Layers, GraduationCap, Plus, Settings,
  MessageCircle, ListChecks, Lightbulb, Hash, Clock, BookMarked, Star, ChevronDown, Bot, User, LayoutDashboard, PenTool
} from 'lucide-react';

const c = {
  bg: '#0A0A0C',
  sidebar: '#0E0E11',
  surface: '#141417',
  surface2: '#1A1A1E',
  surface3: '#222226',
  border: '#242428',
  borderLight: '#2E2E34',
  text: '#EEEEF0',
  text2: '#9E9EAB',
  text3: '#5C5C66',
  blue: '#3B82F6',
  blueHover: '#2563EB',
  blueSoft: 'rgba(59,130,246,0.12)',
  blueBorder: 'rgba(59,130,246,0.25)',
  green: '#10B981',
  greenSoft: 'rgba(16,185,129,0.12)',
  orange: '#F59E0B',
  purple: '#8B5CF6',
};

const icon = (I, s = 18, cl = c.text2) => React.createElement(I, { size: s, color: cl, strokeWidth: 1.7 });

const PROMPTS = {
  explain: (n) => `You are a patient, encouraging tutor. Read these student notes and explain them in simple, clear language. Use markdown formatting with headers (##) and bullet points. Give real-world examples. Be friendly but precise.\n\nNotes:\n${n}`,
  quiz: (n) => `Generate exactly 3 multiple choice questions from these notes.\n\nFor each question use this format:\n## Question N\n**[question text]**\n\nA) option\nB) option\nC) option\nD) option\n\n> ✅ **Answer: X** — brief explanation\n\nNotes:\n${n}`,
  keypoints: (n) => `Extract the most important key points from these notes.\n\nFormat as:\n## Key Points\n\n**1. [Term]**\nExplanation of this concept\n\n**2. [Term]**\nExplanation\n\n(continue for all important points)\n\nNotes:\n${n}`,
  ask: (n) => `You are a helpful AI tutor. Answer the student's question based ONLY on these notes. If the answer isn't in the notes, say "That's not covered in your notes — but here's what I can tell you:" and give a brief general answer.\n\nNotes:\n${n}`,
};

const TOOLS = [
  { id: 'explain', label: 'Explain', icon: BookOpen, color: c.blue, desc: 'Explain in simple language', prompt: 'Explain my notes simply' },
  { id: 'quiz', label: 'Quiz', icon: Target, color: c.orange, desc: 'Generate MCQ quiz', prompt: 'Quiz me on my notes' },
  { id: 'keypoints', label: 'Key Points', icon: ListChecks, color: c.green, desc: 'Extract key points', prompt: 'Extract the key points' },
  { id: 'ask', label: 'Ask Anything', icon: MessageCircle, color: c.purple, desc: 'Ask any question', prompt: null },
];

async function extractText(file) {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) return await file.text();
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const P = await import('pdfjs-dist'); P.GlobalWorkerOptions.workerSrc = '';
    const ab = await file.arrayBuffer(); const pdf = await P.getDocument({ data: ab }).promise;
    let t = ''; for (let i = 1; i <= pdf.numPages; i++) { const p = await pdf.getPage(i); const ct = await p.getTextContent(); t += ct.items.map(x => x.str).join(' ') + '\n'; } return t.trim();
  }
  if (file.name.endsWith('.docx')) { const ab = await file.arrayBuffer(); const r = await mammoth.extractRawText({ arrayBuffer: ab }); return r.value; }
  try { return await file.text(); } catch { throw new Error('Unsupported format'); }
}
const wc = (t) => t.trim().split(/\s+/).filter(Boolean).length;

const css = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
*{scrollbar-width:thin;scrollbar-color:${c.border} transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${c.border};border-radius:4px}::selection{background:${c.blueSoft}}
`;

export default function App() {
  const [view, setView] = useState('landing'); // landing | app
  const [notes, setNotes] = useState(null);
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [paste, setPaste] = useState('');
  const [showUpload, setShowUpload] = useState(false);
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
    const tool = TOOLS.find(t => t.id === id);
    if (!tool?.prompt) return;
    setMessages(p => [...p, { role: 'user', content: tool.prompt }]);
    setLoading(true);
    try { const ai = await callAI(PROMPTS[id](nc), []); setMessages(p => [...p, { role: 'assistant', content: ai }]); }
    catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const loadNotes = useCallback(async (content, name) => {
    setNotes({ name, content, wc: wc(content) });
    setMode('explain'); setMessages([]); setView('app'); setShowUpload(false);
    await sendMode('explain', content);
  }, []);

  const handleFile = useCallback(async (f) => {
    try { const ct = await extractText(f); if (!ct.trim()) throw new Error('Empty'); await loadNotes(ct.trim(), f.name); }
    catch (e) { alert('Error: ' + e.message); }
  }, [loadNotes]);

  const handleSend = async () => {
    const t = input.trim(); if (!t || !notes || loading) return;
    const nm = [...messages, { role: 'user', content: t }]; setMessages(nm); setInput(''); setLoading(true);
    try { const ai = await callAI(PROMPTS[mode || 'ask'](notes.content), nm.map(m => ({ role: m.role, content: m.content }))); setMessages(p => [...p, { role: 'assistant', content: ai }]); }
    catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  // ═══════════════════════════════════════════════════
  // LANDING PAGE
  // ═══════════════════════════════════════════════════
  if (view === 'landing' && !notes) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg }}>
        {/* CSS gradient mesh */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${c.blue}06 0%, transparent 70%)`, filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '-30%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${c.purple}05 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        </div>

        {/* ── Navbar ── */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(10,10,12,0.7)', backdropFilter: 'blur(20px) saturate(1.5)', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${c.blue}, ${c.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${c.blue}30` }}>
              {icon(GraduationCap, 18, '#fff')}
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.4px' }}>SmartStudy</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: c.blueSoft, color: c.blue, fontWeight: 600, letterSpacing: '0.5px' }}>AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {['Features', 'How it works'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: 13, color: c.text2, textDecoration: 'none', transition: 'color 0.15s' }}>{l}</a>
            ))}
            <button onClick={() => setShowUpload(true)} style={{ padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: c.blue, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'background 0.15s' }}>
              Get Started {icon(ArrowRight, 14, '#fff')}
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: 'center', padding: '180px 24px 100px', position: 'relative' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 50, background: c.blueSoft, border: `1px solid ${c.blueBorder}`, marginBottom: 36, fontSize: 13, color: c.blue, fontWeight: 500 }}>
              {icon(Sparkles, 14, c.blue)} AI-Powered Study Assistant
            </div>
            <h1 style={{ fontSize: 'clamp(38px, 6vw, 58px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 24, color: c.text }}>
              Your AI tutor for<br />
              <span style={{ background: `linear-gradient(135deg, ${c.blue}, ${c.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>any subject</span>
            </h1>
            <p style={{ fontSize: 17, color: c.text2, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 44px' }}>
              Upload your notes. Get explanations, quizzes, key points, and instant answers. Study smarter in seconds.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button onClick={() => setShowUpload(true)} style={{ padding: '15px 36px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: `linear-gradient(135deg, ${c.blue}, ${c.blueHover})`, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 24px ${c.blue}30`, transition: 'transform 0.15s, box-shadow 0.15s' }}>
                Start Studying {icon(ArrowRight, 16, '#fff')}
              </button>
            </div>
          </div>

          {/* Demo preview */}
          <div style={{ maxWidth: 820, margin: '60px auto 0', borderRadius: 16, border: `1px solid ${c.border}`, background: c.surface, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${c.border}` }}>
              <div style={{ width: 220, borderRight: `1px solid ${c.border}`, padding: '16px 12px', background: c.sidebar }}>
                {['Explain', 'Quiz Me', 'Key Points', 'Ask'].map((t, i) => (
                  <div key={t} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10, background: i === 0 ? c.blueSoft : 'transparent', color: i === 0 ? c.blue : c.text3, fontWeight: i === 0 ? 500 : 400 }}>
                    {icon([BookOpen, Target, ListChecks, MessageCircle][i], 15, i === 0 ? c.blue : c.text3)} {t}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 20, minHeight: 200 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon(Bot, 14, c.blue)}</div>
                  <div style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: c.surface2, fontSize: 13, color: c.text2, lineHeight: 1.7, border: `1px solid ${c.border}` }}>
                    Here's a simple explanation of photosynthesis:<br /><br />
                    <strong style={{ color: c.text }}>Plants make their own food</strong> using sunlight, water, and CO₂. Think of it like a recipe... 🌱
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 12 }}>Four powerful study modes</h2>
            <p style={{ color: c.text3, fontSize: 15 }}>AI adapts to how you learn best</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {TOOLS.map((t, i) => (
              <div key={t.id} style={{ padding: 28, borderRadius: 14, background: c.surface, border: `1px solid ${c.border}`, transition: 'border-color 0.15s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${t.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  {icon(t.icon, 22, t.color)}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t.label}</h3>
                <p style={{ fontSize: 13, color: c.text3, lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 100px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 12 }}>How it works</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              [Upload, 'Upload your notes', 'Drag & drop a PDF, DOCX, or TXT file — or paste text directly', c.blue],
              [Brain, 'Choose a study mode', 'Pick from Explain, Quiz, Key Points, or Ask Anything', c.purple],
              [Sparkles, 'Learn smarter', 'Get instant, AI-powered study help personalized to your notes', c.green],
            ].map(([Ic, title, desc, color], i) => (
              <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon(Ic, 20, color)}</div>
                  {i < 2 && <div style={{ width: 1, flex: 1, background: c.border, margin: '8px 0' }} />}
                </div>
                <div style={{ paddingBottom: 36 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: c.text3, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${c.border}`, padding: '28px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: c.text3 }}>© 2026 SmartStudy AI — Making studying effortless</p>
        </footer>

        {/* ── Upload Modal ── */}
        {showUpload && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}>
            <div style={{ width: '100%', maxWidth: 520, margin: '0 24px', borderRadius: 18, background: c.surface, border: `1px solid ${c.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${c.border}` }}>
                <h2 style={{ fontSize: 17, fontWeight: 600 }}>Upload your notes</h2>
                <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>{icon(X, 18, c.text3)}</button>
              </div>
              <div style={{ padding: 24 }}>
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('fi').click()}
                  style={{ padding: '44px 24px', borderRadius: 12, background: dragOver ? c.blueSoft : c.surface2, border: `1.5px dashed ${dragOver ? c.blue : c.borderLight}`, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{icon(Upload, 22, c.blue)}</div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: dragOver ? c.blue : c.text }}>{dragOver ? 'Drop your file' : 'Drag & drop or click to upload'}</p>
                  <p style={{ fontSize: 12, color: c.text3 }}>PDF, TXT, or DOCX</p>
                  <input id="fi" type="file" accept=".pdf,.txt,.docx" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: c.border }} />
                  <span style={{ fontSize: 11, color: c.text3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>or paste text</span>
                  <div style={{ flex: 1, height: 1, background: c.border }} />
                </div>
                <textarea value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste your notes or study material here..."
                  style={{ width: '100%', padding: 14, borderRadius: 10, background: c.surface2, border: `1px solid ${c.border}`, color: c.text, fontSize: 13, minHeight: 100, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: 16, transition: 'border-color 0.15s' }}
                  onFocus={(e) => e.target.style.borderColor = c.blue} onBlur={(e) => e.target.style.borderColor = c.border} />
                <button onClick={async () => { const ct = paste.trim(); if (!ct) return; await loadNotes(ct, 'Pasted Notes'); setPaste(''); }}
                  disabled={!paste.trim()}
                  style={{ width: '100%', padding: '13px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: paste.trim() ? c.blue : c.surface3, color: paste.trim() ? '#fff' : c.text3, border: 'none', cursor: paste.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {icon(Sparkles, 16, paste.trim() ? '#fff' : c.text3)} Start Studying
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // APP — Sidebar + Chat
  // ═══════════════════════════════════════════════════
  return (
    <div style={{ height: '100vh', display: 'flex', background: c.bg }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: 260, background: c.sidebar, borderRight: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ height: 60, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${c.blue}, ${c.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon(GraduationCap, 16, '#fff')}</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>SmartStudy<span style={{ color: c.text3, fontWeight: 400 }}> AI</span></span>
        </div>

        {/* Notes info */}
        <div style={{ padding: 16, borderBottom: `1px solid ${c.border}` }}>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: c.greenSoft, border: `1px solid rgba(16,185,129,0.15)`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
            {icon(FileText, 14, c.green)}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, color: c.green, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notes?.name}</p>
              <p style={{ color: c.text3, fontSize: 11 }}>{notes?.wc} words loaded</p>
            </div>
            <button onClick={() => { setNotes(null); setMessages([]); setMode(null); setView('landing'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>{icon(X, 14, c.text3)}</button>
          </div>
        </div>

        {/* Study Tools */}
        <div style={{ padding: '12px 12px 8px', flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: c.text3, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', marginBottom: 8 }}>Study Tools</p>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { if (loading) return; setMode(t.id); setMessages([]); if (t.id !== 'ask') sendMode(t.id, notes.content); }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: mode === t.id ? 500 : 400, background: mode === t.id ? `${t.color}12` : 'transparent', color: mode === t.id ? t.color : c.text2, border: mode === t.id ? `1px solid ${t.color}25` : '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, textAlign: 'left' }}>
              {icon(t.icon, 16, mode === t.id ? t.color : c.text3)} {t.label}
              {mode === t.id && <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5 }}>Active</span>}
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ padding: 12, borderTop: `1px solid ${c.border}` }}>
          <button onClick={() => { setMessages([]); if (mode !== 'ask') sendMode(mode, notes.content); }}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: c.surface, border: `1px solid ${c.border}`, color: c.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, transition: 'all 0.15s' }}>
            {icon(RotateCcw, 13, c.text3)} New Chat
          </button>
          <button onClick={() => setShowUpload(true)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: c.surface, border: `1px solid ${c.border}`, color: c.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
            {icon(Upload, 13, c.text3)} Change Notes
          </button>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mode indicator bar */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${c.border}`, background: c.bg, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: c.text2 }}>
            {icon(mode ? TOOLS.find(t => t.id === mode)?.icon || Brain : Brain, 15, c.blue)}
            {mode ? TOOLS.find(t => t.id === mode)?.label || 'Study' : 'Study Mode'}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => { if (loading) return; setMode(t.id); setMessages([]); if (t.id !== 'ask') sendMode(t.id, notes.content); }}
                style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, background: mode === t.id ? `${t.color}14` : 'transparent', color: mode === t.id ? t.color : c.text3, border: mode === t.id ? `1px solid ${t.color}20` : '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {messages.length === 0 && mode === 'ask' && (
              <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeUp 0.5s ease' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>{icon(MessageCircle, 24, c.blue)}</div>
                <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Ask anything about your notes</p>
                <p style={{ fontSize: 13, color: c.text3 }}>Type your question below to get started</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s ease', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    {icon(Bot, 16, c.blue)}
                  </div>
                )}
                <div style={{
                  maxWidth: m.role === 'user' ? '75%' : '85%', padding: '14px 18px', borderRadius: 14, fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  background: m.role === 'user' ? c.blue : c.surface,
                  color: m.role === 'user' ? '#fff' : c.text,
                  border: m.role === 'user' ? 'none' : `1px solid ${c.border}`,
                  borderTopRightRadius: m.role === 'user' ? 4 : 14,
                  borderTopLeftRadius: m.role === 'assistant' ? 4 : 14,
                }}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: c.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    {icon(User, 16, c.text3)}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s ease' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon(Bot, 16, c.blue)}
                </div>
                <div style={{ padding: '14px 20px', borderRadius: 14, borderTopLeftRadius: 4, background: c.surface, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: c.blue, animation: 'dot 1.2s infinite', animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div style={{ borderTop: `1px solid ${c.border}`, background: c.surface, padding: '16px 24px', flexShrink: 0 }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 10 }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={mode === 'ask' ? 'Ask anything about your notes...' : 'Ask a follow-up question...'}
              disabled={loading}
              style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 14, outline: 'none', transition: 'border-color 0.15s', opacity: loading ? 0.5 : 1 }}
              onFocus={(e) => e.target.style.borderColor = c.blue} onBlur={(e) => e.target.style.borderColor = c.border} />
            <button onClick={handleSend} disabled={!input.trim() || loading}
              style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: input.trim() && !loading ? c.blue : c.surface3, color: input.trim() && !loading ? '#fff' : c.text3, fontSize: 14, fontWeight: 600, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
              Send {icon(Send, 14, input.trim() && !loading ? '#fff' : c.text3)}
            </button>
          </div>
        </div>
      </main>

      {/* ── Upload Modal (in app) ── */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}>
          <div style={{ width: '100%', maxWidth: 480, margin: '0 24px', borderRadius: 16, background: c.surface, border: `1px solid ${c.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${c.border}` }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Upload new notes</h3>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{icon(X, 16, c.text3)}</button>
            </div>
            <div style={{ padding: 20 }}>
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); setShowUpload(false); }}
                onClick={() => { const f = document.createElement('input'); f.type = 'file'; f.accept = '.pdf,.txt,.docx'; f.onchange = (e) => { if (e.target.files[0]) { handleFile(e.target.files[0]); setShowUpload(false); } }; f.click(); }}
                style={{ padding: '36px 20px', borderRadius: 10, background: dragOver ? c.blueSoft : c.surface2, border: `1.5px dashed ${dragOver ? c.blue : c.borderLight}`, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                {icon(Upload, 28, dragOver ? c.blue : c.text3)}
                <p style={{ fontSize: 13, fontWeight: 500, marginTop: 12, color: dragOver ? c.blue : c.text2 }}>{dragOver ? 'Drop file here' : 'Click or drag file'}</p>
                <p style={{ fontSize: 11, color: c.text3, marginTop: 4 }}>PDF, TXT, DOCX</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}