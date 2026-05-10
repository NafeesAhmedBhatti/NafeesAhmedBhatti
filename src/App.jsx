import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mammoth from 'mammoth';
import {
  BookOpen, Upload, Brain, Sparkles, FileText, Zap, Target, ArrowRight,
  RotateCcw, X, Send, GraduationCap, MessageCircle, ListChecks, Bot, User,
  Download, Search, BarChart3, Layers, Lightbulb, Play, Pause, CheckCircle2,
  XCircle, Timer, Trophy, Flame, PenTool, ChevronDown, ChevronLeft, Settings,
  Bell, Moon, Sun, Calendar, ClipboardList, Home, LogOut, Plus, TrendingUp,
  Clock, Award, Bookmark, Star, MoreHorizontal, Edit3, Trash2, Filter,
  ArrowUpRight, Activity, LineChart as LineChartIcon, BarChart2,
  Eye, FileUp, HelpCircle, XSquare, LayoutDashboard, MessageSquare, BookMarked,
  CreditCard, ChevronRight, Volume2, Maximize2, Minimize2, RefreshCw, ExternalLink,
  CircleDot, Wallet, GraduationCap as Grad, PieChart as PieChartIcon
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════
const T = {
  bg: '#07070F', bg2: '#0B0B16', bg3: '#0F0F1A',
  sidebar: '#0A0A14', sidebarHover: '#0E0E1C',
  surface: '#111120', surface2: '#161630', surface3: '#1C1C3A',
  border: '#1E1E3A', borderLight: '#2A2A50',
  text: '#E8E8F0', text2: '#9898B8', text3: '#5A5A78',
  indigo: '#6366F1', indigoHover: '#5558E6', indigoSoft: 'rgba(99,102,241,0.10)', indigoGlow: 'rgba(99,102,241,0.25)',
  purple: '#8B5CF6', purpleSoft: 'rgba(139,92,246,0.10)',
  cyan: '#06B6D4', cyanSoft: 'rgba(6,182,212,0.10)',
  green: '#10B981', greenSoft: 'rgba(16,185,129,0.10)',
  orange: '#F59E0B', orangeSoft: 'rgba(245,158,11,0.10)',
  red: '#EF4444', redSoft: 'rgba(239,68,68,0.10)',
  pink: '#EC4899', pinkSoft: 'rgba(236,72,153,0.10)',
  blue: '#3B82F6', blueSoft: 'rgba(59,130,246,0.10)',
};

const Ic = (Icon, s = 18, color = T.text2) => <Icon size={s} color={color} strokeWidth={1.7} />;

// ═══════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════
const CSS = `
@keyframes glow-pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1.1)}}
@keyframes slide-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes flipIn{from{transform:rotateY(90deg);opacity:0}to{transform:rotateY(0);opacity:1}}
@keyframes progress{from{width:0}to{width:var(--pw)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
.shimmer{background:linear-gradient(90deg,transparent,rgba(99,102,241,0.08),transparent);background-size:200% 100%;animation:shimmer 2s infinite}
.glow-btn{position:relative;overflow:hidden;transition:all .3s cubic-bezier(.4,0,.2,1)}
.glow-btn::before{content:'';position:absolute;inset:-2px;border-radius:inherit;background:linear-gradient(135deg,${T.indigo},${T.purple},${T.cyan});opacity:0;transition:opacity .3s;z-index:-1;filter:blur(8px)}
.glow-btn:hover::before{opacity:.6}
.glow-btn:hover{transform:translateY(-1px);box-shadow:0 8px 32px rgba(99,102,241,0.25)}
.glow-btn:active{transform:translateY(0) scale(.98)}
`;

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════
const weeklyData = [
  { day: 'Mon', hours: 3.2, tasks: 5 }, { day: 'Tue', hours: 4.5, tasks: 7 },
  { day: 'Wed', hours: 2.8, tasks: 4 }, { day: 'Thu', hours: 5.1, tasks: 8 },
  { day: 'Fri', hours: 4.0, tasks: 6 }, { day: 'Sat', hours: 6.2, tasks: 9 },
  { day: 'Sun', hours: 3.5, tasks: 5 },
];
const subjectData = [
  { name: 'Math', score: 85, color: T.indigo }, { name: 'Science', score: 72, color: T.cyan },
  { name: 'History', score: 91, color: T.purple }, { name: 'English', score: 78, color: T.pink },
  { name: 'CS', score: 95, color: T.green },
];
const pieData = [
  { name: 'Studying', value: 42, color: T.indigo }, { name: 'Quizzes', value: 28, color: T.cyan },
  { name: 'Notes', value: 18, color: T.purple }, { name: 'Flashcards', value: 12, color: T.pink },
];
const upcomingExams = [
  { subject: 'Calculus II', date: 'Dec 18', daysLeft: 3, color: T.red },
  { subject: 'Physics Lab', date: 'Dec 20', daysLeft: 5, color: T.orange },
  { subject: 'Data Structures', date: 'Dec 22', daysLeft: 7, color: T.green },
];
const recentNotes = [
  { name: 'Organic Chemistry Ch.7', subject: 'Chemistry', date: '2h ago', pages: 24 },
  { name: 'Linear Algebra Notes', subject: 'Mathematics', date: '5h ago', pages: 18 },
  { name: 'Machine Learning Basics', subject: 'CS', date: '1d ago', pages: 32 },
  { name: 'World War II Summary', subject: 'History', date: '2d ago', pages: 15 },
];
const tasks = [
  { text: 'Complete Calculus Problem Set', done: false, priority: 'high' },
  { text: 'Read Physics Chapter 12', done: true, priority: 'medium' },
  { text: 'Review ML Flashcards', done: false, priority: 'low' },
  { text: 'Write History Essay Draft', done: false, priority: 'high' },
  { text: 'Practice Data Structures Quiz', done: true, priority: 'medium' },
];
const quotes = [
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts repeated daily.",
  "Don't watch the clock; do what it does — keep going.",
  "Education is the passport to the future.",
  "The beautiful thing about learning is nobody can take it away from you.",
];

const PROMPTS = {
  explain: (n) => `You are a patient tutor. Explain these notes clearly with examples and markdown formatting.\n\nNotes:\n${n}`,
  quiz: (n) => `Generate 5 multiple choice questions from these notes.\n\nFormat:\n## Question N\n**question**\nA) option\nB) option\nC) option\nD) option\n\n> ✅ **Answer: X** — explanation\n\nNotes:\n${n}`,
  keypoints: (n) => `Extract key points from these notes. Use markdown.\n\nNotes:\n${n}`,
  flashcards: (n) => `Generate 8 flashcards from these notes as JSON array only:\n[{"front":"question","back":"answer","hint":"hint"}]\n\nNotes:\n${n}`,
  summarize: (n) => `Create a study summary with key terms and exam predictions.\n\nNotes:\n${n}`,
  ask: (n) => `Answer based on these notes only.\n\nNotes:\n${n}`,
};

const STUDY_TOOLS = [
  { id: 'explain', label: 'Explain', icon: BookOpen, color: T.indigo, prompt: 'Explain my notes' },
  { id: 'quiz', label: 'Quiz', icon: Target, color: T.orange, prompt: 'Generate quiz' },
  { id: 'keypoints', label: 'Key Points', icon: ListChecks, color: T.green, prompt: 'Extract key points' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, color: T.cyan, prompt: 'Generate flashcards' },
  { id: 'summarize', label: 'Summary', icon: FileText, color: T.purple, prompt: 'Summarize notes' },
  { id: 'ask', label: 'Ask AI', icon: MessageCircle, color: T.pink, prompt: null },
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'planner', label: 'Study Planner', icon: Calendar },
  { id: 'notes', label: 'Notes', icon: BookMarked },
  { id: 'quiz', label: 'Quiz Generator', icon: Target },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
async function extractText(file) {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) return await file.text();
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const P = await import('pdfjs-dist'); P.GlobalWorkerOptions.workerSrc = '';
    const ab = await file.arrayBuffer(); const pdf = await P.getDocument({ data: ab }).promise;
    let t = ''; for (let i = 1; i <= pdf.numPages; i++) { const p = await pdf.getPage(i); const ct = await p.getTextContent(); t += ct.items.map(x => x.str).join(' ') + '\n'; } return t.trim();
  }
  if (file.name.endsWith('.docx')) { const ab = await file.arrayBuffer(); const r = await mammoth.extractRawText({ arrayBuffer: ab }); return r.value; }
  return await file.text();
}

const callAI = async (sys, hist = []) => {
  const r = await fetch(`${window.__AI_BASE_URL}/v1/chat/completions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.__AI_API_KEY}` },
    body: JSON.stringify({ model: 'drytis/kimi-k2.5', max_tokens: 1500, messages: [{ role: 'system', content: sys }, ...hist] }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `Error ${r.status}`); }
  return (await r.json()).choices?.[0]?.message?.content || 'No response.';
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

// -- Stat Card --
function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div style={{ padding: 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden', transition: 'all .3s' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, borderRadius: '50%', background: `${color}06`, filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(Icon, 20, color)}</div>
        {trend && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.green, background: T.greenSoft, padding: '3px 8px', borderRadius: 6 }}>{Ic(TrendingUp, 12, T.green)}{trend}</div>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.text3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// -- Premium Button --
function GlowButton({ children, onClick, color = T.indigo, icon: Icon, size = 'md', variant = 'primary', disabled, style = {} }) {
  const sizes = { sm: { padding: '8px 16px', fontSize: 12 }, md: { padding: '11px 22px', fontSize: 13 }, lg: { padding: '14px 32px', fontSize: 15 } };
  const s = sizes[size] || sizes.md;
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  return (
    <button onClick={onClick} disabled={disabled}
      className="glow-btn"
      style={{
        ...s, fontWeight: 600, borderRadius: 10, border: isOutline ? `1px solid ${color}30` : isGhost ? '1px solid transparent' : 'none',
        background: isOutline || isGhost ? 'transparent' : `linear-gradient(135deg, ${color}, ${T.purple})`,
        color: isOutline || isGhost ? color : '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden',
        opacity: disabled ? 0.5 : 1, letterSpacing: '-0.2px', ...style,
      }}>
      {Icon && Ic(Icon, size === 'sm' ? 14 : size === 'lg' ? 18 : 16, isOutline || isGhost ? color : '#fff')}
      {children}
    </button>
  );
}

// -- Progress Ring --
function ProgressRing({ value, size = 80, stroke = 6, color = T.indigo }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
}

// -- Pomodoro --
function PomodoroWidget() {
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('focus');
  const iv = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime(t => { if (t <= 1) { setRunning(false); return 0; } return t - 1; }), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = Math.floor(time / 60), s = time % 60;
  const pct = ((iv[mode] - time) / iv[mode]) * 100;
  return (
    <div style={{ padding: 20, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>{Ic(Timer, 16, T.indigo)} Pomodoro</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['focus', '25m'], ['short', '5m'], ['long', '15m']].map(([id, lb]) => (
            <button key={id} onClick={() => { setMode(id); setTime(iv[id]); setRunning(false); }}
              style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, background: mode === id ? T.indigoSoft : T.bg2, color: mode === id ? T.indigo : T.text3, border: 'none', cursor: 'pointer' }}>{lb}</button>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-2px' }}>{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</div>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: T.surface3, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${T.indigo}, ${T.cyan})`, width: `${pct}%`, transition: 'width 1s linear' }} />
      </div>
      <button onClick={() => setRunning(!running)} className="glow-btn"
        style={{ width: '100%', padding: 10, borderRadius: 8, background: running ? T.orangeSoft : `linear-gradient(135deg, ${T.indigo}, ${T.purple})`, color: running ? T.orange : '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {running ? Ic(Pause, 14, T.orange) : Ic(Play, 14, '#fff')} {running ? 'Pause' : 'Start Focus'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════
function Landing({ onEnter }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '15%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '60%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(6,182,212,0.05), transparent 70%)`, filter: 'blur(60px)' }} />
      </div>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(7,7,15,0.8)', backdropFilter: 'blur(20px) saturate(1.5)', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${T.indigo}, ${T.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${T.indigo}40` }}>{Ic(Brain, 16, '#fff')}</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.5px' }}>SmartStudy<span style={{ color: T.text3, fontWeight: 400 }}> AI</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Tools', 'About'].map(l => <span key={l} style={{ fontSize: 13, color: T.text2, cursor: 'pointer' }}>{l}</span>)}
          <GlowButton onClick={onEnter} icon={ArrowRight}>Get Started</GlowButton>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 80, textAlign: 'center', padding: '160px 24px 80px', position: 'relative' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: T.indigoSoft, border: `1px solid ${T.indigoGlow}`, marginBottom: 28, fontSize: 12, color: T.indigo, fontWeight: 500 }}>
            {Ic(Sparkles, 13, T.indigo)} Powered by Advanced AI
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 56px)', fontWeight: 900, letterSpacing: '-2.5px', lineHeight: 1.05, marginBottom: 20 }}>
            Study smarter with<br />
            <span style={{ background: `linear-gradient(135deg, ${T.indigo}, ${T.cyan}, ${T.purple})`, backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>your AI tutor</span>
          </h1>
          <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 36px' }}>Upload your notes, get explanations, quizzes, flashcards, and a personalized study plan — all in one platform.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <GlowButton onClick={onEnter} icon={Sparkles} size="lg" style={{ boxShadow: `0 4px 32px ${T.indigo}35` }}>Start Studying</GlowButton>
            <GlowButton variant="outline" color={T.text2} size="lg" icon={Play}>Watch Demo</GlowButton>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            [Brain, 'AI Chat', 'Ask anything', T.indigo],
            [Target, 'Quiz Gen', 'Test yourself', T.orange],
            [Layers, 'Flashcards', 'Spaced review', T.cyan],
            [FileText, 'Summarizer', 'Key points', T.purple],
            [Calendar, 'Planner', 'Schedule study', T.green],
            [BarChart2, 'Analytics', 'Track progress', T.pink],
          ].map(([Ic2, title, desc, color]) => (
            <div key={title} style={{ padding: 22, borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center', cursor: 'pointer', transition: 'all .3s' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{Ic(Ic2, 20, color)}</div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</h3>
              <p style={{ fontSize: 12, color: T.text3 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '24px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: T.text3 }}>© 2026 SmartStudy AI — Built for students who want to learn smarter.</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD PAGES
// ═══════════════════════════════════════════════════════════════

function DashboardPage({ setPage }) {
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  return (
    <div style={{ animation: 'slide-up .4s ease' }}>
      {/* Welcome */}
      <div style={{ padding: 28, borderRadius: 20, background: `linear-gradient(135deg, ${T.surface}, ${T.surface2})`, border: `1px solid ${T.border}`, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${T.indigo}12, transparent)`, filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>Good evening, Student 👋</h1>
            <p style={{ color: T.text2, fontSize: 14, maxWidth: 400, lineHeight: 1.6, fontStyle: 'italic' }}>"{q}"</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <ProgressRing value={72} size={72} stroke={5} color={T.indigo} />
              <p style={{ fontSize: 10, color: T.text3, marginTop: 6 }}>Today's Goal</p>
            </div>
            <div style={{ padding: '14px 18px', borderRadius: 14, background: `${T.orange}10`, border: `1px solid ${T.orange}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>{Ic(Flame, 16, T.orange)}<span style={{ fontSize: 20, fontWeight: 800 }}>{7}</span></div>
              <p style={{ fontSize: 10, color: T.text3 }}>Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon={Clock} label="Study Hours" value="24.5h" sub="+3.2h this week" color={T.indigo} trend="+12%" />
        <StatCard icon={CheckCircle2} label="Tasks Done" value="47" sub="of 56 total" color={T.green} trend="+8%" />
        <StatCard icon={FileText} label="Assignments" value="5" sub="due this week" color={T.orange} />
        <StatCard icon={Target} label="Quiz Accuracy" value="86%" sub="avg score" color={T.cyan} trend="+5%" />
        <StatCard icon={TrendingUp} label="Productivity" value="92" sub="this week index" color={T.purple} trend="+15%" />
        <StatCard icon={Zap} label="AI Usage" value="134" sub="queries today" color={T.pink} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Weekly Chart */}
        <div style={{ padding: 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>{Ic(Activity, 15, T.indigo)} Weekly Study Hours</h3>
            <span style={{ fontSize: 11, color: T.text3 }}>Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs><linearGradient id="gIndigo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.indigo} stopOpacity={0.3} /><stop offset="95%" stopColor={T.indigo} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: T.text3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.text3 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: T.text }} />
              <Area type="monotone" dataKey="hours" stroke={T.indigo} strokeWidth={2} fill="url(#gIndigo)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ padding: 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{Ic(PieChartIcon, 15, T.purple)} Study Breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {pieData.map(d => <span key={d.name} style={{ fontSize: 10, color: T.text3, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />{d.name}</span>)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Subject Performance */}
        <div style={{ padding: 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{Ic(Award, 15, T.green)} Subject Performance</h3>
          {subjectData.map(s => (
            <div key={s.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12 }}>{s.name}</span><span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.score}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: T.surface3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: s.color, width: `${s.score}%`, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <div style={{ padding: 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{Ic(Calendar, 15, T.orange)} Upcoming Exams</h3>
          {upcomingExams.map(e => (
            <div key={e.subject} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: T.bg2, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${e.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic(BookOpen, 16, e.color)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{e.subject}</p>
                <p style={{ fontSize: 11, color: T.text3 }}>{e.date}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: e.daysLeft <= 3 ? T.red : e.color, background: e.daysLeft <= 3 ? T.redSoft : `${e.color}10`, padding: '3px 8px', borderRadius: 6 }}>{e.daysLeft}d left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AI CHAT PAGE
// ═══════════════════════════════════════════════════════════════
function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [tool, setTool] = useState('explain');
  const chatRef = useRef();

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);

  const handleFile = useCallback(async (f) => {
    try {
      const ct = await extractText(f);
      if (!ct.trim()) throw new Error('Empty file');
      setNotes({ name: f.name, content: ct.trim() });
      setShowUpload(false);
      // Auto-explain
      setMessages([{ role: 'user', content: 'Explain my notes' }]); setLoading(true);
      const ai = await callAI(PROMPTS.explain(ct.trim()));
      setMessages(p => [...p, { role: 'assistant', content: ai }]);
      setLoading(false);
    } catch (e) { alert('Error: ' + e.message); }
  }, []);

  const sendTool = async (id, nc) => {
    const t = STUDY_TOOLS.find(x => x.id === id);
    if (!t?.prompt || !nc) return;
    setMessages(p => [...p, { role: 'user', content: t.prompt }]); setLoading(true);
    try { const ai = await callAI(PROMPTS[id](nc)); setMessages(p => [...p, { role: 'assistant', content: ai }]); }
    catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const send = async () => {
    const t = input.trim(); if (!t || loading) return;
    const nm = [...messages, { role: 'user', content: t }]; setMessages(nm); setInput(''); setLoading(true);
    try {
      const sys = notes ? PROMPTS.ask(notes.content) : 'You are SmartStudy AI, a helpful study assistant. Be concise and helpful.';
      const ai = await callAI(sys, nm.map(m => ({ role: m.role, content: m.content })));
      setMessages(p => [...p, { role: 'assistant', content: ai }]);
    } catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.role === 'user' ? 'You' : 'AI'}]\n${m.content}\n`).join('\n---\n\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = 'smartstudy-chat.txt'; a.click();
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', animation: 'slide-up .4s ease' }}>
      {/* Chat sidebar */}
      <div style={{ width: 220, borderRight: `1px solid ${T.border}`, background: T.bg2, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: 14, borderBottom: `1px solid ${T.border}` }}>
          <GlowButton onClick={() => setShowUpload(true)} size="sm" icon={Upload} style={{ width: '100%', justifyContent: 'center' }}>Upload Notes</GlowButton>
        </div>
        {notes && (
          <div style={{ padding: 12, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ padding: '8px 10px', borderRadius: 8, background: T.greenSoft, display: 'flex', alignItems: 'center', gap: 8 }}>
              {Ic(FileText, 12, T.green)}
              <span style={{ fontSize: 11, color: T.green, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notes.name}</span>
              <button onClick={() => setNotes(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>{Ic(X, 10, T.text3)}</button>
            </div>
          </div>
        )}
        <div style={{ padding: 10, flex: 1 }}>
          <p style={{ fontSize: 9, color: T.text3, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 6px', marginBottom: 6 }}>Study Tools</p>
          {STUDY_TOOLS.map(t => (
            <button key={t.id} onClick={() => { if (loading) return; setTool(t.id); if (notes) sendTool(t.id, notes.content); }}
              style={{ width: '100%', padding: '7px 8px', borderRadius: 7, fontSize: 11, background: tool === t.id ? `${t.color}10` : 'transparent', color: tool === t.id ? t.color : T.text2, border: tool === t.id ? `1px solid ${t.color}20` : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
              {Ic(t.icon, 13, tool === t.id ? t.color : T.text3)} {t.label}
            </button>
          ))}
        </div>
        {messages.length > 0 && (
          <div style={{ padding: 10, borderTop: `1px solid ${T.border}` }}>
            <button onClick={exportChat} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 11, background: T.surface, border: `1px solid ${T.border}`, color: T.text3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {Ic(Download, 12, T.text3)} Export Chat
            </button>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: T.indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>{Ic(Bot, 26, T.indigo)}</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>SmartStudy AI</h2>
                <p style={{ fontSize: 13, color: T.text3, maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>Upload your notes or ask me anything. I can explain, quiz, summarize, and more.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && <div style={{ width: 28, height: 28, borderRadius: 8, background: T.indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{Ic(Bot, 13, T.indigo)}</div>}
                <div style={{ maxWidth: m.role === 'user' ? '70%' : '80%', padding: '12px 15px', borderRadius: 14, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: m.role === 'user' ? `linear-gradient(135deg, ${T.indigo}, ${T.purple})` : T.surface, color: m.role === 'user' ? '#fff' : T.text, border: m.role === 'user' ? 'none' : `1px solid ${T.border}`, borderTopRightRadius: m.role === 'user' ? 4 : 14, borderTopLeftRadius: m.role === 'assistant' ? 4 : 14 }}>{m.content}</div>
                {m.role === 'user' && <div style={{ width: 28, height: 28, borderRadius: 8, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{Ic(User, 13, T.text3)}</div>}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(Bot, 13, T.indigo)}</div>
                <div style={{ padding: '12px 18px', borderRadius: 14, borderTopLeftRadius: 4, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: T.indigo, animation: 'dot 1.2s infinite', animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, background: T.surface, padding: '12px 20px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything about your notes..." disabled={loading}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', opacity: loading ? 0.5 : 1 }} />
            <button onClick={send} disabled={!input.trim() || loading} className="glow-btn"
              style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: input.trim() && !loading ? `linear-gradient(135deg, ${T.indigo}, ${T.purple})` : T.surface3, color: input.trim() && !loading ? '#fff' : T.text3, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              Send {Ic(Send, 13)}
            </button>
          </div>
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={e => { if (e.target === e.currentTarget) setShowUpload(false); }}>
          <div style={{ width: '100%', maxWidth: 440, margin: '0 24px', borderRadius: 18, background: T.surface, border: `1px solid ${T.border}`, animation: 'slide-up .3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Upload Notes</h3>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{Ic(X, 16, T.text3)}</button>
            </div>
            <div style={{ padding: 20 }}>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); setShowUpload(false); }}
                onClick={() => { const f = document.createElement('input'); f.type = 'file'; f.accept = '.pdf,.txt,.docx'; f.onchange = e => { if (e.target.files[0]) { handleFile(e.target.files[0]); setShowUpload(false); } }; f.click(); }}
                style={{ padding: '36px 20px', borderRadius: 12, background: dragOver ? T.indigoSoft : T.surface2, border: `1.5px dashed ${dragOver ? T.indigo : T.borderLight}`, textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}>
                {Ic(Upload, 28, dragOver ? T.indigo : T.text3)}
                <p style={{ fontSize: 13, fontWeight: 500, marginTop: 12, color: dragOver ? T.indigo : T.text }}>Drop file or click to upload</p>
                <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>PDF, TXT, DOCX</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLANNER PAGE
// ═══════════════════════════════════════════════════════════════
function PlannerPage() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
  const schedule = {
    Mon: [{ subj: 'Math', time: '9-10', color: T.indigo }, { subj: 'Physics', time: '11-12', color: T.cyan }],
    Tue: [{ subj: 'CS Lab', time: '9-11', color: T.green }, { subj: 'English', time: '2-3', color: T.pink }],
    Wed: [{ subj: 'Chemistry', time: '10-12', color: T.orange }, { subj: 'History', time: '3-4', color: T.purple }],
    Thu: [{ subj: 'Math', time: '9-10', color: T.indigo }, { subj: 'CS', time: '1-3', color: T.green }],
    Fri: [{ subj: 'Physics', time: '10-11', color: T.cyan }, { subj: 'Quiz Review', time: '2-4', color: T.red }],
  };
  return (
    <div style={{ animation: 'slide-up .4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>Study Planner</h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>Week of December 15 - 21</p>
        </div>
        <GlowButton icon={Plus} size="sm">Add Session</GlowButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Timetable */}
        <div style={{ padding: 20, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, overflow: 'auto' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{Ic(Calendar, 14, T.indigo)} Weekly Timetable</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 1, minWidth: 500 }}>
            <div />
            {days.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: T.text2, padding: '8px 0' }}>{d}</div>)}
            {hours.map(h => (
              <React.Fragment key={h}>
                <div style={{ fontSize: 10, color: T.text3, padding: '6px 4px', display: 'flex', alignItems: 'center' }}>{h}</div>
                {days.map(d => {
                  const slot = schedule[d]?.find(s => {
                    const [sh] = s.time.split('-');
                    return parseInt(sh) === parseInt(h);
                  });
                  return (
                    <div key={d + h} style={{ minHeight: 36, borderRadius: 6, background: slot ? `${slot.color}12` : T.bg2, border: slot ? `1px solid ${slot.color}20` : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: slot?.color, fontWeight: 500, transition: 'all .2s' }}>
                      {slot?.subj}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PomodoroWidget />
          <div style={{ padding: 20, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{Ic(Sparkles, 14, T.purple)} AI Recommendations</h3>
            {[
              'Focus more on Calculus — exam in 3 days',
              'Review Physics flashcards twice today',
              'Schedule 2hr CS lab practice',
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: 12, lineHeight: 1.5 }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: `${T.purple}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{Ic(Lightbulb, 10, T.purple)}</span>
                <span style={{ color: T.text2 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NOTES PAGE
// ═══════════════════════════════════════════════════════════════
function NotesPage() {
  const [search, setSearch] = useState('');
  const filtered = recentNotes.filter(n => n.name.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ animation: 'slide-up .4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>My Notes</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
              style={{ padding: '8px 12px 8px 32px', borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, outline: 'none', width: 200 }} />
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Search, 13, T.text3)}</div>
          </div>
          <GlowButton icon={Upload} size="sm">Upload</GlowButton>
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['All', 'Mathematics', 'CS', 'Chemistry', 'History', 'Physics'].map(c => (
          <button key={c} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: c === 'All' ? T.indigoSoft : T.surface, color: c === 'All' ? T.indigo : T.text3, border: `1px solid ${c === 'All' ? T.indigoGlow : T.border}`, cursor: 'pointer' }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {filtered.map((n, i) => (
          <div key={i} style={{ padding: 18, borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer', transition: 'all .2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(FileText, 16, T.indigo)}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ padding: 4, borderRadius: 6, background: T.bg2, border: 'none', cursor: 'pointer' }}>{Ic(Download, 12, T.text3)}</button>
                <button style={{ padding: 4, borderRadius: 6, background: T.bg2, border: 'none', cursor: 'pointer' }}>{Ic(MoreHorizontal, 12, T.text3)}</button>
              </div>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{n.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.text3 }}>
              <span>{n.subject}</span><span>{n.pages} pages</span>
            </div>
            <div style={{ fontSize: 10, color: T.text3, marginTop: 8 }}>{n.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUIZ PAGE
// ═══════════════════════════════════════════════════════════════
function QuizPage() {
  return (
    <div style={{ animation: 'slide-up .4s ease', textAlign: 'center', paddingTop: 60 }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: T.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>{Ic(Target, 30, T.orange)}</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>Quiz Generator</h1>
      <p style={{ fontSize: 14, color: T.text2, maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.6 }}>Upload your notes or go to AI Chat to generate quizzes from your study material.</p>
      <GlowButton onClick={() => {}} icon={ArrowRight} size="lg">Go to AI Chat</GlowButton>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FLASHCARDS PAGE
// ═══════════════════════════════════════════════════════════════
function FlashcardsPage() {
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  const sampleCards = [
    { front: 'What is the derivative of sin(x)?', back: 'cos(x)', hint: 'Think about the unit circle' },
    { front: 'What does O(n log n) represent?', back: 'Log-linear time complexity', hint: 'Merge sort' },
    { front: 'What is Newton\'s Second Law?', back: 'F = ma', hint: 'Force equals mass times acceleration' },
    { front: 'What is photosynthesis?', back: 'Process by which plants convert light energy into chemical energy', hint: 'Sunlight → glucose' },
  ];
  const card = sampleCards[idx];
  return (
    <div style={{ animation: 'slide-up .4s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 24 }}>Flashcards</h1>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: T.text3 }}>{idx + 1} of {sampleCards.length}</span>
          <div style={{ height: 4, flex: 1, borderRadius: 2, background: T.surface3, marginLeft: 12, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${T.cyan}, ${T.indigo})`, width: `${((idx + 1) / sampleCards.length) * 100}%`, transition: 'width .3s' }} />
          </div>
        </div>
        <div onClick={() => setFlipped(!flipped)} style={{ minHeight: 220, padding: 32, borderRadius: 18, background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: flipped ? 'flipIn .3s ease' : 'none', marginBottom: 20 }}>
          <p style={{ fontSize: 10, color: T.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>{flipped ? '✅ Answer' : '❓ Question'}</p>
          <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5 }}>{flipped ? card.back : card.front}</p>
          {flipped && card.hint && <p style={{ fontSize: 12, color: T.text3, marginTop: 16 }}>💡 {card.hint}</p>}
          {!flipped && <p style={{ fontSize: 11, color: T.text3, marginTop: 20 }}>Click to reveal answer</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setFlipped(false); setIdx(Math.max(0, idx - 1)); }} style={{ flex: 1, padding: 12, borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text2, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            ← Previous
          </button>
          <button onClick={() => { setFlipped(false); setIdx(Math.min(sampleCards.length - 1, idx + 1)); }} style={{ flex: 1, padding: 12, borderRadius: 10, background: `linear-gradient(135deg, ${T.indigo}, ${T.purple})`, border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS PAGE
// ═══════════════════════════════════════════════════════════════
function AnalyticsPage() {
  return (
    <div style={{ animation: 'slide-up .4s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 24 }}>Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          [Trophy, 'Total XP', '2,450', T.indigo],
          [Flame, 'Streak', '7 days', T.orange],
          [Clock, 'Total Hours', '156h', T.cyan],
          [Award, 'Quizzes', '89', T.green],
          [Star, 'Avg Score', '86%', T.purple],
          [Zap, 'AI Queries', '1,247', T.pink],
        ].map(([Ic2, label, val, color]) => (
          <div key={label} style={{ padding: 16, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{Ic(Ic2, 16, color)}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{val}</div>
            <div style={{ fontSize: 10, color: T.text3 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{Ic(BarChart2, 14, T.indigo)} Monthly Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ m: 'Jul', v: 65 }, { m: 'Aug', v: 78 }, { m: 'Sep', v: 82 }, { m: 'Oct', v: 90 }, { m: 'Nov', v: 88 }, { m: 'Dec', v: 95 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: T.text3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.text3 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="v" fill={T.indigo} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ padding: 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{Ic(Award, 14, T.green)} Subject Scores</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis type="number" tick={{ fontSize: 10, fill: T.text3 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: T.text2 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {subjectData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TASKS PAGE
// ═══════════════════════════════════════════════════════════════
function TasksPage() {
  const [items, setItems] = useState(tasks);
  const toggle = i => setItems(p => p.map((t, j) => j === i ? { ...t, done: !t.done } : t));
  const pColors = { high: T.red, medium: T.orange, low: T.green };
  return (
    <div style={{ animation: 'slide-up .4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>Tasks & Reminders</h1>
        <GlowButton icon={Plus} size="sm">Add Task</GlowButton>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[['All', items.length], ['Done', items.filter(t => t.done).length], ['Pending', items.filter(t => !t.done).length]].map(([l, n]) => (
          <div key={l} style={{ padding: '12px 18px', borderRadius: 12, background: T.surface, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{n}</div>
            <div style={{ fontSize: 11, color: T.text3 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {items.map((t, i) => (
          <div key={i} onClick={() => toggle(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : 'none', cursor: 'pointer', transition: 'background .15s' }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${t.done ? T.green : T.borderLight}`, background: t.done ? T.greenSoft : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
              {t.done && Ic(CheckCircle2, 12, T.green)}
            </div>
            <span style={{ flex: 1, fontSize: 13, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? T.text3 : T.text }}>{t.text}</span>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, background: `${pColors[t.priority]}10`, color: pColors[t.priority], fontWeight: 600, textTransform: 'uppercase' }}>{t.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════
function SettingsPage() {
  const [theme, setTheme] = useState('dark');
  const sections = [
    { title: 'Profile', items: ['Name', 'Email', 'University', 'Major'] },
    { title: 'Preferences', items: ['Language', 'Notifications', 'AI Model', 'Default Difficulty'] },
    { title: 'Study', items: ['Daily Goal (hours)', 'Pomodoro Length', 'Break Length', 'Focus Mode'] },
  ];
  return (
    <div style={{ animation: 'slide-up .4s ease', maxWidth: 600 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 24 }}>Settings</h1>
      {/* Theme toggle */}
      <div style={{ padding: 18, borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Ic(theme === 'dark' ? Moon : Sun, 18, T.indigo)}
          <span style={{ fontSize: 13, fontWeight: 500 }}>Theme</span>
        </div>
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          style={{ width: 44, height: 24, borderRadius: 12, background: theme === 'dark' ? T.indigo : T.surface3, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: theme === 'dark' ? 23 : 3, transition: 'left .2s' }} />
        </button>
      </div>
      {sections.map(s => (
        <div key={s.title} style={{ padding: 18, borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{s.title}</h3>
          {s.items.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: T.text2 }}>{item}</span>
              <span style={{ fontSize: 12, color: T.text3, display: 'flex', alignItems: 'center', gap: 4 }}>Edit {Ic(ChevronRight, 12, T.text3)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState('landing');
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef();

  useEffect(() => { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); return () => s.remove(); }, []);
  useEffect(() => { const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) { setNotifOpen(false); setProfileOpen(false); } }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  const enter = () => setPage('dashboard');

  if (page === 'landing') return <Landing onEnter={enter} />;

  const currentPage = page;
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage setPage={setPage} />;
      case 'ai-chat': return <AIChatPage />;
      case 'planner': return <PlannerPage />;
      case 'notes': return <NotesPage />;
      case 'quiz': return <QuizPage />;
      case 'flashcards': return <FlashcardsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'tasks': return <TasksPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage setPage={setPage} />;
    }
  };

  const notifications = [
    { text: 'Calculus exam in 3 days', time: '2h ago', color: T.red },
    { text: 'New AI study recommendation', time: '4h ago', color: T.indigo },
    { text: 'You hit a 7-day streak! 🔥', time: '1d ago', color: T.orange },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', background: T.bg, overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 68 : 232, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width .25s cubic-bezier(.4,0,.2,1)' }}>
        {/* Logo */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${T.indigo}, ${T.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic(Brain, 15, '#fff')}</div>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>SmartStudy<span style={{ color: T.text3, fontWeight: 400 }}> AI</span></span>}
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {SIDEBAR_ITEMS.map(item => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)}
                className={active ? '' : ''}
                style={{ width: '100%', padding: collapsed ? '10px 0' : '9px 12px', borderRadius: 10, fontSize: 12, fontWeight: active ? 600 : 400, background: active ? T.indigoSoft : 'transparent', color: active ? T.indigo : T.text2, border: active ? `1px solid ${T.indigoGlow}` : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, justifyContent: collapsed ? 'center' : 'flex-start', transition: 'all .15s' }}>
                {Ic(item.icon, 17, active ? T.indigo : T.text3)}
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Bottom */}
        <div style={{ padding: 8, borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button onClick={() => { setCollapsed(!collapsed); }}
            style={{ width: '100%', padding: collapsed ? '10px 0' : '9px 12px', borderRadius: 10, fontSize: 12, background: 'transparent', color: T.text3, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            {Ic(ChevronLeft, 16, T.text3)} {!collapsed && 'Collapse'}
          </button>
          <button onClick={() => setPage('landing')}
            style={{ width: '100%', padding: collapsed ? '10px 0' : '9px 12px', borderRadius: 10, fontSize: 12, background: 'transparent', color: T.red, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            {Ic(LogOut, 16, T.red)} {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: 'rgba(7,7,15,0.6)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>{SIDEBAR_ITEMS.find(i => i.id === page)?.label || 'Dashboard'}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} ref={notifRef}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input placeholder="Search..." style={{ width: 180, padding: '7px 12px 7px 32px', borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, outline: 'none' }} />
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Search, 13, T.text3)}</div>
            </div>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {Ic(Bell, 16, T.text2)}
                <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: T.red, border: `2px solid ${T.bg}` }} />
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 44, right: 0, width: 280, borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 100, animation: 'slide-up .2s ease' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                    <span style={{ fontSize: 10, color: T.indigo, cursor: 'pointer' }}>Mark all read</span>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderBottom: i < notifications.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 12, lineHeight: 1.5 }}>{n.text}</p>
                        <p style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.indigo}, ${T.purple})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>
                S
              </button>
              {profileOpen && (
                <div style={{ position: 'absolute', top: 44, right: 0, width: 200, borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 100, animation: 'slide-up .2s ease' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>Student</p>
                    <p style={{ fontSize: 11, color: T.text3 }}>student@university.edu</p>
                  </div>
                  {[
                    [User, 'Profile', () => setPage('settings')],
                    [Settings, 'Settings', () => setPage('settings')],
                    [LogOut, 'Logout', () => setPage('landing')],
                  ].map(([Ic2, label, fn]) => (
                    <button key={label} onClick={() => { fn(); setProfileOpen(false); }}
                      style={{ width: '100%', padding: '10px 16px', fontSize: 12, background: 'transparent', color: label === 'Logout' ? T.red : T.text2, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                      {Ic(Ic2, 14, label === 'Logout' ? T.red : T.text3)} {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}