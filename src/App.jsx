import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import mammoth from 'mammoth';
import {
  BookOpen, Upload, Brain, Sparkles, ChevronRight, FileText, Zap, Target,
  ArrowRight, RotateCcw, X, Send, GraduationCap, MessageCircle, ListChecks,
  Bot, User, Clock, Download, Search, BarChart3, Layers, Lightbulb,
  ChevronLeft, ChevronDown, Play, Pause, RotateCcw as Reset, CheckCircle2,
  XCircle, AlertCircle, FlipHorizontal, ArrowUp, ArrowDown, Star, Bookmark,
  Timer, Trophy, Flame, Eye, EyeOff, PenTool, Hash, FileDown, Sparkles as Magic
} from 'lucide-react';

const c = {
  bg: '#0A0A0C', sidebar: '#0E0E11', surface: '#141417', surface2: '#1A1A1E',
  surface3: '#222226', border: '#242428', borderLight: '#2E2E34',
  text: '#EEEEF0', text2: '#9E9EAB', text3: '#5C5C66',
  blue: '#3B82F6', blueHover: '#2563EB', blueSoft: 'rgba(59,130,246,0.12)', blueBorder: 'rgba(59,130,246,0.25)',
  green: '#10B981', greenSoft: 'rgba(16,185,129,0.12)',
  orange: '#F59E0B', orangeSoft: 'rgba(245,158,11,0.12)',
  purple: '#8B5CF6', purpleSoft: 'rgba(139,92,246,0.12)',
  red: '#EF4444', redSoft: 'rgba(239,68,68,0.12)',
  cyan: '#06B6D4', cyanSoft: 'rgba(6,182,212,0.12)',
};
const ic = (I, s = 18, cl = c.text2) => React.createElement(I, { size: s, color: cl, strokeWidth: 1.7 });

const PROMPTS = {
  explain: (n, d) => `You are a patient, encouraging tutor. Explain these notes in ${d === 'easy' ? 'very simple language a 10-year-old could understand, with lots of examples and analogies' : d === 'hard' ? 'detailed academic language with advanced terminology and nuanced analysis' : 'clear, straightforward language with relevant examples'}. Use markdown headers (##) and bullet points.\n\nNotes:\n${n}`,
  quiz: (n, d) => {
    const diff = d === 'easy' ? 'basic recall questions' : d === 'hard' ? 'challenging application and analysis questions' : 'mixed difficulty questions';
    return `Generate exactly 5 multiple choice questions (${diff}) from these notes.\n\nFormat:\n## Question N\n**question**\nA) option\nB) option\nC) option\nD) option\n\n> ✅ **Answer: X** — explanation\n\nNotes:\n${n}`;
  },
  keypoints: (n) => `Extract key points from these notes. Format:\n## Key Points\n**1. [Term]**\nDefinition and why it matters\n\nNotes:\n${n}`,
  ask: (n) => `Answer based on these notes only. If not in notes, say so.\n\nNotes:\n${n}`,
  flashcards: (n) => `Generate 8 flashcards from these notes. Format EXACTLY as JSON array, nothing else:\n[{"front":"question or term","back":"answer or definition","hint":"a memory hint"}]\n\nNotes:\n${n}`,
  fillblank: (n) => `Create a fill-in-the-blank exercise from these notes. Replace 8 key terms with ___. Format:\n## Fill in the Blanks\n\n1. Sentence with ___ for missing term.\n\n---\n## Answers\n1. **term** — explanation\n\nNotes:\n${n}`,
  compare: (n) => `From these notes, identify 3 pairs of related concepts and compare them. Format:\n## Comparison\n\n### [Concept A] vs [Concept B]\n| Aspect | [A] | [B] |\n|---|---|---|\n| definition | ... | ... |\n| example | ... | ... |\n| key difference | ... | ... |\n\nNotes:\n${n}`,
  summarize: (n) => `Create a study summary of these notes. Include:\n## Summary\n- One paragraph overview\n## Key Terms\n- Term: definition\n## Formulas (if any)\n## Most Likely Exam Topics\n- topic — why it's important\n\nNotes:\n${n}`,
  mindmap: (n) => `From these notes, create a text-based mind map showing concept relationships. Format:\n## Mind Map\n\n🏛️ **Main Topic**\n├── 📌 Subtopic 1\n│   ├── detail a\n│   └── detail b\n├── 📌 Subtopic 2\n│   ├── detail c\n│   └── detail d\n└── 📌 Subtopic 3\n    ├── detail e\n    └── detail f\n\nNotes:\n${n}`,
};

const TOOLS = [
  { id: 'explain', label: 'Explain', icon: BookOpen, color: c.blue, prompt: 'Explain my notes' },
  { id: 'quiz', label: 'Quiz', icon: Target, color: c.orange, prompt: 'Generate a quiz' },
  { id: 'keypoints', label: 'Key Points', icon: ListChecks, color: c.green, prompt: 'Extract key points' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, color: c.cyan, prompt: 'Generate flashcards' },
  { id: 'fillblank', label: 'Fill Blanks', icon: PenTool, color: c.purple, prompt: 'Create fill-in-the-blank exercise' },
  { id: 'compare', label: 'Compare', icon: ArrowRight, color: c.red, prompt: 'Compare concepts' },
  { id: 'summarize', label: 'Summary', icon: FileText, color: c.orange, prompt: 'Create study summary' },
  { id: 'mindmap', label: 'Mind Map', icon: Lightbulb, color: c.cyan, prompt: 'Create mind map' },
  { id: 'ask', label: 'Ask Anything', icon: MessageCircle, color: c.purple, prompt: null },
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
@keyframes flipIn{from{transform:rotateY(90deg);opacity:0}to{transform:rotateY(0);opacity:1}}
@keyframes slideIn{from{transform:translateX(-8px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes progress{from{width:0}to{width:100%}}
*{scrollbar-width:thin;scrollbar-color:${c.border} transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${c.border};border-radius:4px}::selection{background:${c.blueSoft}}
`;

// ─── Stats Tracker (localStorage) ────────────────────────────
function useStats() {
  const [stats, setStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_stats') || '{}'); } catch { return {}; }
  });
  const save = (s) => { setStats(s); try { localStorage.setItem('ss_stats', JSON.stringify(s)); } catch {} };
  const add = (key, val = 1) => save({ ...stats, [key]: (stats[key] || 0) + val, lastStudy: Date.now() });
  const getStreak = () => {
    const last = stats.lastStudy; if (!last) return 0;
    const now = new Date(); const d = new Date(last);
    const diff = Math.floor((now - d) / 86400000);
    return diff <= 1 ? (stats.streak || 1) : 0;
  };
  return { stats, add, getStreak, save };
}

// ─── Pomodoro Timer ──────────────────────────────────────────
function Pomodoro({ onClose }) {
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // focus | short | long
  const intervals = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime(t => { if (t <= 1) { setRunning(false); return 0; } return t - 1; }), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = Math.floor(time / 60), s = time % 60;
  const progress = ((intervals[mode] - time) / intervals[mode]) * 100;
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 150, width: 280, borderRadius: 16, background: c.surface, border: `1px solid ${c.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>{ic(Timer, 15, c.blue)} Pomodoro</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{ic(X, 16, c.text3)}</button>
      </div>
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-2px', color: time === 0 ? c.green : c.text, marginBottom: 12 }}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
        <div style={{ height: 4, borderRadius: 2, background: c.surface3, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: mode === 'focus' ? c.blue : c.green, width: `${progress}%`, transition: 'width 1s linear' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[['focus', 'Focus'], ['short', 'Short'], ['long', 'Long']].map(([id, label]) => (
            <button key={id} onClick={() => { setMode(id); setTime(intervals[id]); setRunning(false); }}
              style={{ flex: 1, padding: 6, borderRadius: 6, fontSize: 11, fontWeight: 500, background: mode === id ? c.blueSoft : c.surface2, color: mode === id ? c.blue : c.text3, border: 'none', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setRunning(!running)} style={{ flex: 1, padding: 10, borderRadius: 8, background: c.blue, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {running ? ic(Pause, 14, '#fff') : ic(Play, 14, '#fff')} {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={() => { setTime(intervals[mode]); setRunning(false); }} style={{ padding: 10, borderRadius: 8, background: c.surface2, border: `1px solid ${c.border}`, cursor: 'pointer' }}>{ic(Reset, 14, c.text3)}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Flashcard Viewer ────────────────────────────────────────
function FlashcardViewer({ cards, onClose }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [scored, setScored] = useState([]);
  if (!cards?.length) return null;
  const card = cards[idx];
  const score = scored.filter(s => s === 'know').length;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(scored); }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 24px', animation: 'fadeUp 0.3s ease' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: c.text3 }}>{idx + 1} of {cards.length}</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 12, color: c.green, display: 'flex', alignItems: 'center', gap: 4 }}>{ic(CheckCircle2, 12, c.green)} {score}</span>
            <span style={{ fontSize: 12, color: c.red, display: 'flex', alignItems: 'center', gap: 4 }}>{ic(XCircle, 12, c.red)} {scored.length - score}</span>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: c.surface3, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: c.cyan, width: `${((idx + 1) / cards.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        {/* Card */}
        <div onClick={() => setFlipped(!flipped)} style={{ minHeight: 240, padding: 32, borderRadius: 16, background: c.surface, border: `1px solid ${c.border}`, cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: flipped ? 'flipIn 0.3s ease' : 'none', marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: c.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>{flipped ? 'Answer' : 'Question'}</p>
          <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5 }}>{flipped ? card.back : card.front}</p>
          {flipped && card.hint && <p style={{ fontSize: 13, color: c.text3, marginTop: 16, fontStyle: 'italic' }}>💡 Hint: {card.hint}</p>}
          {!flipped && <p style={{ fontSize: 12, color: c.text3, marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>{ic(FlipHorizontal, 14, c.text3)} Click to flip</p>}
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setScored([...scored, 'dont']); setFlipped(false); setIdx(i => Math.min(i + 1, cards.length - 1)); }}
            style={{ flex: 1, padding: 12, borderRadius: 10, background: c.redSoft, border: `1px solid rgba(239,68,68,0.2)`, color: c.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {ic(XCircle, 15, c.red)} Don't Know
          </button>
          <button onClick={() => { setScored([...scored, 'know']); setFlipped(false); setIdx(i => Math.min(i + 1, cards.length - 1)); }}
            style={{ flex: 1, padding: 12, borderRadius: 10, background: c.greenSoft, border: '1px solid rgba(16,185,129,0.2)', color: c.green, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {ic(CheckCircle2, 15, c.green)} Know It
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Panel ─────────────────────────────────────────────
function StatsPanel({ stats, streak, onClose }) {
  const items = [
    [FileText, 'Documents', stats.docs || 0, c.blue],
    [MessageCircle, 'Questions', stats.questions || 0, c.purple],
    [Brain, 'AI Responses', stats.responses || 0, c.green],
    [Target, 'Quizzes Taken', stats.quizzes || 0, c.orange],
    [Layers, 'Flashcards', stats.flashcards || 0, c.cyan],
    [Flame, 'Day Streak', streak, c.red],
  ];
  return (
    <div style={{ position: 'fixed', top: 68, right: 0, width: 300, bottom: 0, background: c.sidebar, borderLeft: `1px solid ${c.border}`, zIndex: 120, animation: 'slideIn 0.2s ease', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px', borderBottom: `1px solid ${c.border}` }}>
        <span style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>{ic(BarChart3, 16, c.blue)} Study Stats</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{ic(X, 16, c.text3)}</button>
      </div>
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map(([Ic, label, val, color]) => (
          <div key={label} style={{ padding: 16, borderRadius: 12, background: c.surface, border: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>{ic(Ic, 16, color)}<span style={{ fontSize: 11, color: c.text3 }}>{label}</span></div>
            <span style={{ fontSize: 24, fontWeight: 700, color }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('landing');
  const [notes, setNotes] = useState(null);
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [paste, setPaste] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [flashcards, setFlashcards] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { stats, add, getStreak } = useStats();
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
    setMessages(p => [...p, { role: 'user', content: tool.prompt }]); setLoading(true);
    add('questions');
    try {
      const ai = await callAI(PROMPTS[id](nc, difficulty), []);
      // Parse flashcards if that mode
      if (id === 'flashcards') {
        try {
          const json = JSON.parse(ai.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
          if (Array.isArray(json) && json[0]?.front) { setFlashcards(json); add('flashcards', json.length); }
        } catch {} // If parse fails, show as text
      }
      setMessages(p => [...p, { role: 'assistant', content: ai }]);
      add('responses');
      if (id === 'quiz') add('quizzes');
    } catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const loadNotes = useCallback(async (content, name) => {
    setNotes({ name, content, wc: wc(content) }); setMode('explain'); setMessages([]);
    setView('app'); setShowUpload(false); add('docs');
    await sendMode('explain', content);
  }, [difficulty]);

  const handleFile = useCallback(async (f) => {
    try { const ct = await extractText(f); if (!ct.trim()) throw new Error('Empty'); await loadNotes(ct.trim(), f.name); }
    catch (e) { alert('Error: ' + e.message); }
  }, [loadNotes]);

  const handleSend = async () => {
    const t = input.trim(); if (!t || !notes || loading) return;
    const nm = [...messages, { role: 'user', content: t }]; setMessages(nm); setInput(''); setLoading(true); add('questions');
    try { const ai = await callAI(PROMPTS[mode || 'ask'](notes.content, difficulty), nm.map(m => ({ role: m.role, content: m.content }))); setMessages(p => [...p, { role: 'assistant', content: ai }]); add('responses'); }
    catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.role === 'user' ? 'You' : 'AI'}]\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `smartstudy-${mode || 'chat'}.txt`; a.click();
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m => m.content.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  // ═══════ LANDING ═══════
  if (view === 'landing' && !notes) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${c.blue}06, transparent 70%)`, filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '-30%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${c.purple}05, transparent 70%)`, filter: 'blur(60px)' }} />
        </div>
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(10,10,12,0.7)', backdropFilter: 'blur(20px) saturate(1.5)', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${c.blue}, ${c.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${c.blue}30` }}>{ic(GraduationCap, 18, '#fff')}</div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.4px' }}>SmartStudy<span style={{ color: c.text3, fontWeight: 400 }}> AI</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {['Features', 'Tools', 'How it works'].map(l => <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: 13, color: c.text2, textDecoration: 'none' }}>{l}</a>)}
            <button onClick={() => setShowUpload(true)} style={{ padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: c.blue, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              Get Started {ic(ArrowRight, 14, '#fff')}
            </button>
          </div>
        </header>
        <section style={{ paddingTop: 180, paddingBottom: 80, textAlign: 'center', padding: '180px 24px 80px', position: 'relative' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 50, background: c.blueSoft, border: `1px solid ${c.blueBorder}`, marginBottom: 36, fontSize: 13, color: c.blue, fontWeight: 500 }}>{ic(Sparkles, 14, c.blue)} AI-Powered Study Assistant</div>
            <h1 style={{ fontSize: 'clamp(38px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 24 }}>Your AI tutor for<br /><span style={{ background: `linear-gradient(135deg, ${c.blue}, ${c.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>any subject</span></h1>
            <p style={{ fontSize: 17, color: c.text2, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 44px' }}>Upload your notes and get explanations, quizzes, flashcards, mind maps, and more — powered by AI.</p>
            <button onClick={() => setShowUpload(true)} style={{ padding: '15px 36px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: `linear-gradient(135deg, ${c.blue}, ${c.blueHover})`, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto', boxShadow: `0 4px 24px ${c.blue}30` }}>
              Start Studying {ic(ArrowRight, 16, '#fff')}
            </button>
          </div>
        </section>

        {/* All Tools Grid */}
        <section id="tools" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 10 }}>9 powerful study tools</h2>
            <p style={{ color: c.text3, fontSize: 15 }}>One upload, unlimited ways to learn</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {TOOLS.map(t => (
              <div key={t.id} style={{ padding: 24, borderRadius: 14, background: c.surface, border: `1px solid ${c.border}`, transition: 'border-color 0.15s', cursor: 'pointer' }} onClick={() => setShowUpload(true)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${t.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{ic(t.icon, 20, t.color)}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.label}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Features */}
        <section id="features" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 10 }}>Advanced Features</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {[
              [Layers, 'AI Flashcards', 'Auto-generated flashcards with flip animation, hints, and progress tracking. Know it or don\'t — track your score.', c.cyan],
              [Timer, 'Pomodoro Timer', 'Built-in focus timer with 25/5/15 minute modes. Track your study sessions and build streaks.', c.red],
              [BarChart3, 'Study Stats', 'Track documents studied, questions asked, quizzes taken, flashcards reviewed, and day streak.', c.blue],
              [Target, 'Difficulty Levels', 'Choose Easy, Medium, or Hard for explanations and quizzes. AI adapts to your level.', c.orange],
              [Search, 'Search Chat', 'Search through your conversation history to find previous answers instantly.', c.purple],
              [Download, 'Export Notes', 'Download any AI response as a text file. Save quizzes, summaries, and flashcards.', c.green],
            ].map(([Ic, title, desc, color]) => (
              <div key={title} style={{ padding: 28, borderRadius: 14, background: c.surface, border: `1px solid ${c.border}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{ic(Ic, 20, color)}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: c.text3, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 100px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 10 }}>How it works</h2>
          </div>
          {[[Upload, 'Upload notes', 'PDF, DOCX, TXT, or paste text', c.blue], [Brain, 'Pick a tool', '9 AI study modes to choose from', c.purple], [Sparkles, 'Learn smarter', 'Instant, personalized AI help', c.green]].map(([I, t, d, co], i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${co}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ic(I, 20, co)}</div>
              <div><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t}</h3><p style={{ fontSize: 13, color: c.text3 }}>{d}</p></div>
            </div>
          ))}
        </section>

        <footer style={{ borderTop: `1px solid ${c.border}`, padding: '28px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: c.text3 }}>© 2026 SmartStudy AI</p>
        </footer>

        {/* Upload Modal */}
        {showUpload && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}>
            <div style={{ width: '100%', maxWidth: 520, margin: '0 24px', borderRadius: 18, background: c.surface, border: `1px solid ${c.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${c.border}` }}>
                <h2 style={{ fontSize: 17, fontWeight: 600 }}>Upload your notes</h2>
                <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>{ic(X, 18, c.text3)}</button>
              </div>
              <div style={{ padding: 24 }}>
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('fi').click()}
                  style={{ padding: '44px 24px', borderRadius: 12, background: dragOver ? c.blueSoft : c.surface2, border: `1.5px dashed ${dragOver ? c.blue : c.borderLight}`, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{ic(Upload, 22, c.blue)}</div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: dragOver ? c.blue : c.text }}>{dragOver ? 'Drop your file' : 'Drag & drop or click to upload'}</p>
                  <p style={{ fontSize: 12, color: c.text3 }}>PDF, TXT, or DOCX</p>
                  <input id="fi" type="file" accept=".pdf,.txt,.docx" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: c.border }} />
                  <span style={{ fontSize: 11, color: c.text3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>or paste text</span>
                  <div style={{ flex: 1, height: 1, background: c.border }} />
                </div>
                <textarea value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste your notes here..."
                  style={{ width: '100%', padding: 14, borderRadius: 10, background: c.surface2, border: `1px solid ${c.border}`, color: c.text, fontSize: 13, minHeight: 100, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: 16 }}
                  onFocus={(e) => e.target.style.borderColor = c.blue} onBlur={(e) => e.target.style.borderColor = c.border} />
                <button onClick={async () => { const ct = paste.trim(); if (!ct) return; await loadNotes(ct, 'Pasted Notes'); setPaste(''); }}
                  disabled={!paste.trim()}
                  style={{ width: '100%', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, background: paste.trim() ? c.blue : c.surface3, color: paste.trim() ? '#fff' : c.text3, border: 'none', cursor: paste.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {ic(Sparkles, 16, paste.trim() ? '#fff' : c.text3)} Start Studying
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════ APP ═══════
  return (
    <div style={{ height: '100vh', display: 'flex', background: c.bg }}>
      {/* Sidebar */}
      <aside style={{ width: 256, background: c.sidebar, borderRight: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${c.blue}, ${c.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic(GraduationCap, 14, '#fff')}</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>SmartStudy<span style={{ color: c.text3, fontWeight: 400 }}> AI</span></span>
        </div>
        {/* Notes badge */}
        <div style={{ padding: 12, borderBottom: `1px solid ${c.border}` }}>
          <div style={{ padding: '8px 10px', borderRadius: 8, background: c.greenSoft, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            {ic(FileText, 13, c.green)}
            <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontWeight: 500, color: c.green, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notes?.name}</p><p style={{ color: c.text3, fontSize: 10 }}>{notes?.wc} words</p></div>
            <button onClick={() => { setNotes(null); setMessages([]); setMode(null); setView('landing'); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{ic(X, 12, c.text3)}</button>
          </div>
        </div>
        {/* Difficulty */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${c.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: c.text3, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', marginBottom: 6 }}>Difficulty</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['easy', 'Easy', c.green], ['medium', 'Medium', c.blue], ['hard', 'Hard', c.red]].map(([id, label, color]) => (
              <button key={id} onClick={() => setDifficulty(id)} style={{ flex: 1, padding: 6, borderRadius: 6, fontSize: 11, fontWeight: 500, background: difficulty === id ? `${color}14` : 'transparent', color: difficulty === id ? color : c.text3, border: difficulty === id ? `1px solid ${color}25` : '1px solid transparent', cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Tools */}
        <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: c.text3, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', marginBottom: 6 }}>Study Tools</p>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { if (loading) return; setMode(t.id); setMessages([]); if (t.id !== 'ask') sendMode(t.id, notes.content); }}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: 12, fontWeight: mode === t.id ? 500 : 400, background: mode === t.id ? `${t.color}10` : 'transparent', color: mode === t.id ? t.color : c.text2, border: mode === t.id ? `1px solid ${t.color}20` : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, textAlign: 'left', transition: 'all 0.15s' }}>
              {ic(t.icon, 14, mode === t.id ? t.color : c.text3)} {t.label}
            </button>
          ))}
        </div>
        {/* Bottom */}
        <div style={{ padding: 10, borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => setShowPomodoro(!showPomodoro)} style={{ width: '100%', padding: 7, borderRadius: 6, fontSize: 11, background: showPomodoro ? c.orangeSoft : c.surface, border: `1px solid ${c.border}`, color: c.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {ic(Timer, 12, c.orange)} Pomodoro Timer
          </button>
          <button onClick={() => setShowStats(!showStats)} style={{ width: '100%', padding: 7, borderRadius: 6, fontSize: 11, background: showStats ? c.blueSoft : c.surface, border: `1px solid ${c.border}`, color: c.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {ic(BarChart3, 12, c.blue)} Study Stats
          </button>
          <button onClick={() => { setMessages([]); if (mode !== 'ask') sendMode(mode, notes.content); }} style={{ width: '100%', padding: 7, borderRadius: 6, fontSize: 11, background: c.surface, border: `1px solid ${c.border}`, color: c.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {ic(RotateCcw, 12, c.text3)} New Chat
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: c.text2 }}>
            {ic(mode ? TOOLS.find(t => t.id === mode)?.icon || Brain : Brain, 14, c.blue)}
            {mode ? TOOLS.find(t => t.id === mode)?.label : 'Study Mode'}
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${difficulty === 'easy' ? c.green : difficulty === 'hard' ? c.red : c.blue}14`, color: difficulty === 'easy' ? c.green : difficulty === 'hard' ? c.red : c.blue, fontWeight: 600 }}>{difficulty}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search chat..."
                style={{ width: 140, padding: '5px 8px 5px 28px', borderRadius: 6, background: c.surface, border: `1px solid ${c.border}`, color: c.text, fontSize: 11, outline: 'none' }} />
              <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>{ic(Search, 12, c.text3)}</div>
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{ic(X, 10, c.text3)}</button>}
            </div>
            {flashcards && <button onClick={() => setFlashcards(null)} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, background: c.cyanSoft, color: c.cyan, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{ic(Layers, 12, c.cyan)} {flashcards.length} Cards</button>}
            <button onClick={exportChat} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, background: c.surface, border: `1px solid ${c.border}`, color: c.text3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{ic(Download, 12, c.text3)} Export</button>
            <button onClick={() => setShowUpload(true)} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, background: c.surface, border: `1px solid ${c.border}`, color: c.text3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{ic(Upload, 12, c.text3)} Change</button>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredMessages.length === 0 && searchQuery && <div style={{ textAlign: 'center', padding: 40, color: c.text3, fontSize: 13 }}>No messages matching "{searchQuery}"</div>}
            {filteredMessages.length === 0 && mode === 'ask' && !searchQuery && (
              <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeUp 0.5s ease' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>{ic(MessageCircle, 24, c.blue)}</div>
                <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Ask anything</p>
                <p style={{ fontSize: 13, color: c.text3 }}>Type your question below</p>
              </div>
            )}
            {filteredMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s ease', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && <div style={{ width: 30, height: 30, borderRadius: 8, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{ic(Bot, 14, c.blue)}</div>}
                <div style={{ maxWidth: m.role === 'user' ? '75%' : '85%', padding: '13px 16px', borderRadius: 14, fontSize: 13, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: m.role === 'user' ? c.blue : c.surface, color: m.role === 'user' ? '#fff' : c.text, border: m.role === 'user' ? 'none' : `1px solid ${c.border}`, borderTopRightRadius: m.role === 'user' ? 4 : 14, borderTopLeftRadius: m.role === 'assistant' ? 4 : 14 }}>{m.content}</div>
                {m.role === 'user' && <div style={{ width: 30, height: 30, borderRadius: 8, background: c.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{ic(User, 14, c.text3)}</div>}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s ease' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: c.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ic(Bot, 14, c.blue)}</div>
                <div style={{ padding: '13px 18px', borderRadius: 14, borderTopLeftRadius: 4, background: c.surface, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c.blue, animation: 'dot 1.2s infinite', animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div style={{ borderTop: `1px solid ${c.border}`, background: c.surface, padding: '14px 20px', flexShrink: 0 }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 8 }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={mode === 'ask' ? 'Ask about your notes...' : 'Follow-up question...'}
              disabled={loading} style={{ flex: 1, padding: '11px 14px', borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 13, outline: 'none', transition: 'border-color 0.15s', opacity: loading ? 0.5 : 1 }}
              onFocus={(e) => e.target.style.borderColor = c.blue} onBlur={(e) => e.target.style.borderColor = c.border} />
            <button onClick={handleSend} disabled={!input.trim() || loading}
              style={{ padding: '11px 20px', borderRadius: 10, border: 'none', background: input.trim() && !loading ? c.blue : c.surface3, color: input.trim() && !loading ? '#fff' : c.text3, fontSize: 13, fontWeight: 600, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
              Send {ic(Send, 13, input.trim() && !loading ? '#fff' : c.text3)}
            </button>
          </div>
        </div>
      </main>

      {/* Overlays */}
      {showPomodoro && <Pomodoro onClose={() => setShowPomodoro(false)} />}
      {showStats && <StatsPanel stats={stats} streak={getStreak()} onClose={() => setShowStats(false)} />}
      {flashcards && <FlashcardViewer cards={flashcards} onClose={() => setFlashcards(null)} />}

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}>
          <div style={{ width: '100%', maxWidth: 480, margin: '0 24px', borderRadius: 16, background: c.surface, border: `1px solid ${c.border}`, animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Upload new notes</h3>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{ic(X, 16, c.text3)}</button>
            </div>
            <div style={{ padding: 20 }}>
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); setShowUpload(false); }}
                onClick={() => { const f = document.createElement('input'); f.type = 'file'; f.accept = '.pdf,.txt,.docx'; f.onchange = (e) => { if (e.target.files[0]) { handleFile(e.target.files[0]); setShowUpload(false); } }; f.click(); }}
                style={{ padding: '36px 20px', borderRadius: 10, background: dragOver ? c.blueSoft : c.surface2, border: `1.5px dashed ${dragOver ? c.blue : c.borderLight}`, textAlign: 'center', cursor: 'pointer' }}>
                {ic(Upload, 28, dragOver ? c.blue : c.text3)}
                <p style={{ fontSize: 13, fontWeight: 500, marginTop: 12 }}>{dragOver ? 'Drop file' : 'Click or drag'}</p>
                <p style={{ fontSize: 11, color: c.text3, marginTop: 4 }}>PDF, TXT, DOCX</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}