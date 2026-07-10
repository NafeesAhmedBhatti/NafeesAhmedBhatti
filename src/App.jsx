import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { jsPDF } from 'jspdf';
import katex from 'katex';
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
  CircleDot, Wallet, GraduationCap as Grad, PieChart as PieChartIcon, AlertTriangle, Shield, Crown,
  Camera, Mic, MicOff, Map, Video, FileDown, Keyboard, Rocket, Medal, Radio,
  Speaker, BookOpenCheck, PenLine, BrainCircuit, Goal, BadgeCheck, Menu,
  Mail, Wifi, Bug, HardDrive, Lock,
  Globe, Monitor, Smartphone, Type, Scale
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// ═══════════════════════════════════════════════════════════════
// THEME — Soft Pastel Mint Green (Reference Match)
// ═══════════════════════════════════════════════════════════════
const T = {
  bg: '#D7F3E1', bg2: '#E6FCEF', bg3: '#EAF9F0',
  sidebar: '#32C971', sidebarHover: '#2AB862',
  surface: '#FFFFFF', surface2: '#F5F3F4', surface3: '#F0EEEF',
  border: '#E5E7EB', borderLight: '#ECEEF0',
  text: '#111111', text2: '#6B7280', text3: '#9CA3AF',
  mint: '#32C971', mintHover: '#2AB862', mintSoft: 'rgba(50,201,113,0.12)', mintGlow: 'rgba(57,193,108,0.25)',
  lightMint: '#A9F5C6', lightMintSoft: 'rgba(169,245,198,0.20)',
  paleMint: '#E6FCEF',
  emerald: '#39C16C', emeraldSoft: 'rgba(57,193,108,0.12)',
  deepGreen: '#0E3D27',
  sky: '#7DD3FC', skySoft: 'rgba(125,211,252,0.12)',
  amber: '#FBBF24', amberSoft: 'rgba(251,191,36,0.12)',
  rose: '#FB7185', roseSoft: 'rgba(251,113,133,0.12)',
  violet: '#A78BFA', violetSoft: 'rgba(167,139,250,0.12)',
  // Compatibility aliases
  indigo: '#32C971', indigoHover: '#2AB862', indigoSoft: 'rgba(50,201,113,0.12)', indigoGlow: 'rgba(57,193,108,0.25)',
  purple: '#A78BFA', purpleSoft: 'rgba(167,139,250,0.12)',
  cyan: '#39C16C', cyanSoft: 'rgba(57,193,108,0.12)',
  green: '#10B981', greenSoft: 'rgba(16,185,129,0.12)',
  orange: '#FBBF24', orangeSoft: 'rgba(251,191,36,0.12)',
  red: '#EF4444', redSoft: 'rgba(239,68,68,0.10)',
  pink: '#EC4899', pinkSoft: 'rgba(236,72,153,0.10)',
  blue: '#0EA5E9', blueSoft: 'rgba(14,165,233,0.10)',
};

const DARK = {
  bg: '#0D1117', bg2: '#161B22', bg3: '#1C2333',
  sidebar: '#1A7A4A', sidebarHover: '#15904F',
  surface: '#21262D', surface2: '#2D333B', surface3: '#373E47',
  border: '#30363D', borderLight: '#262C36',
  text: '#E6EDF3', text2: '#8B949E', text3: '#6E7681',
  mint: '#3FB950', mintHover: '#2EA043', mintSoft: 'rgba(63,185,80,0.15)', mintGlow: 'rgba(63,185,80,0.25)',
  lightMint: '#238636', lightMintSoft: 'rgba(35,134,54,0.20)',
  paleMint: '#0D1B17',
  emerald: '#3FB950', emeraldSoft: 'rgba(63,185,80,0.15)',
  deepGreen: '#7EE787',
  sky: '#79C0FF', skySoft: 'rgba(121,192,255,0.12)',
  amber: '#D29922', amberSoft: 'rgba(210,153,34,0.12)',
  rose: '#F85149', roseSoft: 'rgba(248,81,73,0.12)',
  violet: '#BC8CFF', violetSoft: 'rgba(188,140,255,0.12)',
  indigo: '#3FB950', indigoHover: '#2EA043', indigoSoft: 'rgba(63,185,80,0.15)', indigoGlow: 'rgba(63,185,80,0.25)',
  purple: '#BC8CFF', purpleSoft: 'rgba(188,140,255,0.12)',
  cyan: '#3FB950', cyanSoft: 'rgba(63,185,80,0.15)',
  green: '#3FB950', greenSoft: 'rgba(63,185,80,0.15)',
  orange: '#D29922', orangeSoft: 'rgba(210,153,34,0.12)',
  red: '#F85149', redSoft: 'rgba(248,81,73,0.10)',
  pink: '#F778BA', pinkSoft: 'rgba(247,120,186,0.10)',
  blue: '#79C0FF', blueSoft: 'rgba(121,192,255,0.10)',
  isDark: true,
};

// Active theme getter — default to light
function getTheme() {
  try { return JSON.parse(localStorage.getItem('smartstudy_dark')) === true ? DARK : T; } catch { return T; }
}

const Ic = (Icon, s = 18, color = T.text2) => <Icon size={s} color={color} strokeWidth={1.7} />;

// ═══════════════════════════════════════════════════════════════
// SIMPLE MARKDOWN RENDERER (with KaTeX math support)
// ═══════════════════════════════════════════════════════════════
function renderMath(latex, displayMode = false) {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode });
  } catch { return latex; }
}

function renderMD(text) {
  const isMob = typeof window !== 'undefined' && window.innerWidth < 768;
  if (!text) return text;
  // Handle display math ($$...$$) first — replace with placeholders
  const mathBlocks = [];
  let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const idx = mathBlocks.length;
    mathBlocks.push(renderMath(math.trim(), true));
    return `MATHBLOCK${idx}END`;
  });
  // Handle inline math ($...$) — but not currency like $5 or $10
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    // Skip if it looks like currency (just a number)
    if (/^\d+([\.,]\d+)?$/.test(math.trim())) return `$${math}$`;
    const idx = mathBlocks.length;
    mathBlocks.push(renderMath(math.trim(), false));
    return `MATHBLOCK${idx}END`;
  });

  const blocks = processed.split(/\n\n+/);
  const rendered = blocks.map((block, bi) => {
    const lines = block.split('\n');
    return lines.map((line, li) => {
      // Headings
      if (line.startsWith('## ')) return <div key={`${bi}-${li}`} style={{ fontSize: isMob ? 13 : 15, fontWeight: 700, marginTop: li === 0 ? 0 : 12, marginBottom: 4, color: T.text }}>{inlineMD(line.slice(3), mathBlocks)}</div>;
      if (line.startsWith('# ')) return <div key={`${bi}-${li}`} style={{ fontSize: isMob ? 14 : 17, fontWeight: 800, marginTop: li === 0 ? 0 : 14, marginBottom: 6, color: T.text }}>{inlineMD(line.slice(2), mathBlocks)}</div>;
      // Blockquote
      if (line.startsWith('> ')) return <div key={`${bi}-${li}`} style={{ borderLeft: `3px solid ${T.mint}`, paddingLeft: 12, margin: '6px 0', fontSize: isMob ? 11 : 12, color: T.text2, fontStyle: 'italic', background: `${T.mint}08`, padding: '8px 12px', borderRadius: 8 }}>{inlineMD(line.slice(2), mathBlocks)}</div>;
      // Bullet
      if (/^[•\-\*]\s/.test(line)) return <div key={`${bi}-${li}`} style={{ display: 'flex', gap: 8, margin: '3px 0', fontSize: isMob ? 12 : 13, lineHeight: 1.7 }}><span style={{ color: T.mint, fontWeight: 700, flexShrink: 0 }}>•</span><span>{inlineMD(line.replace(/^[•\-\*]\s/, ''), mathBlocks)}</span></div>;
      // Numbered list
      if (/^\d+[\.\)]\s/.test(line)) { const num = line.match(/^(\d+)/)?.[1]; return <div key={`${bi}-${li}`} style={{ display: 'flex', gap: 8, margin: '3px 0', fontSize: isMob ? 12 : 13, lineHeight: 1.7 }}><span style={{ color: T.mint, fontWeight: 700, flexShrink: 0, width: 18 }}>{num}.</span><span>{inlineMD(line.replace(/^\d+[\.\)]\s/, ''), mathBlocks)}</span></div>; }
      // Empty line
      if (!line.trim()) return <div key={`${bi}-${li}`} style={{ height: 6 }} />;
      // Regular paragraph (may contain math placeholders)
      return <div key={`${bi}-${li}`} style={{ margin: '4px 0', fontSize: isMob ? 12 : 13, lineHeight: 1.75 }}>{inlineMD(line, mathBlocks)}</div>;
    });
  });
  return <>{rendered}</>;
}

function inlineMD(text, mathBlocks = []) {
  if (!text) return text;
  const parts = [];
  let remaining = text;
  let key = 0;
  while (remaining) {
    // Math block placeholders first
    const mathMatch = remaining.match(/MATHBLOCK(\d+)END/);
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);
    // Code inline
    const codeMatch = remaining.match(/`(.+?)`/);
    
    const matches = [
      mathMatch ? { type: 'math', match: mathMatch, index: mathMatch.index } : null,
      boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index } : null,
      italicMatch && !boldMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index } : null,
    ].filter(Boolean).sort((a, b) => a.index - b.index);

    if (matches.length === 0) { parts.push(<span key={key++}>{remaining}</span>); break; }
    const first = matches[0];
    if (first.index > 0) parts.push(<span key={key++}>{remaining.slice(0, first.index)}</span>);
    if (first.type === 'math') {
      const idx = parseInt(first.match[1]);
      parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: mathBlocks[idx] || '' }} />);
    }
    else if (first.type === 'bold') parts.push(<strong key={key++} style={{ fontWeight: 700, color: T.deepGreen }}>{first.match[1]}</strong>);
    else if (first.type === 'italic') parts.push(<em key={key++} style={{ fontStyle: 'italic', color: T.text2 }}>{first.match[1]}</em>);
    else if (first.type === 'code') parts.push(<code key={key++} style={{ background: T.bg2, padding: '1px 5px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>{first.match[1]}</code>);
    remaining = remaining.slice(first.index + first.match[0].length);
  }
  return <>{parts}</>;
}

// Persistent notes storage helper
const ALL_NOTES_KEY = 'smartstudy_all_notes';
function loadAllNotes() { try { return JSON.parse(localStorage.getItem(ALL_NOTES_KEY) || '[]'); } catch { return []; } }
function saveAllNotes(notes) { localStorage.setItem(ALL_NOTES_KEY, JSON.stringify(notes)); }

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff/86400000)}d ago`;
  return new Date(iso).toLocaleDateString();
}

// Settings persistence
const SETTINGS_KEY = 'smartstudy_settings';
function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY)); if (s) return s; } catch {}
  return { name: 'Student', email: '', university: '', major: '', language: 'English' };
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

// ═══════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════
const CSS = `
@keyframes glow-pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1.1)}}
@keyframes slide-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes flipIn{from{transform:rotateY(90deg);opacity:0}to{transform:rotateY(0);opacity:1}}
@keyframes progress{from{width:0}to{width:var(--pw)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes progress-fill{0%{width:0}20%{width:25}50%{width:55%}75%{width:80%}100%{width:100%}}
.shimmer{background:linear-gradient(90deg,transparent,rgba(50,201,113,0.06),transparent);background-size:200% 100%;animation:shimmer 2s infinite}

/* ── Button hover/active ── */
button:hover{transition:all .2s ease}
button:active{transform:scale(.98);transition-duration:.08s}
@keyframes liquid-ripple{0%{transform:scale(0);opacity:1}100%{transform:scale(1);opacity:0}}
@keyframes aurora-shift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(5%,-3%) scale(1.05)}100%{transform:translate(-3%,5%) scale(0.98)}}
@keyframes aurora-flow{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes aurora-flow2{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes sparkle-float{0%,100%{opacity:0;transform:translateY(0) scale(0.5)}50%{opacity:1;transform:translateY(-6px) scale(1)}}
@keyframes hero-float{0%,100%{transform:translateY(0) rotateX(0deg) rotateY(0deg)}25%{transform:translateY(-18px) rotateX(3deg) rotateY(-3deg)}50%{transform:translateY(-8px) rotateX(-2deg) rotateY(4deg)}75%{transform:translateY(-22px) rotateX(4deg) rotateY(-2deg)}}
@keyframes card3d-enter{from{opacity:0;transform:perspective(800px) rotateY(-15deg) translateX(-40px) scale(0.9)}to{opacity:1;transform:perspective(800px) rotateY(0) translateX(0) scale(1)}}
@keyframes float3d{0%,100%{transform:perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0)}25%{transform:perspective(600px) rotateX(5deg) rotateY(-5deg) translateZ(20px)}50%{transform:perspective(600px) rotateX(-3deg) rotateY(8deg) translateZ(10px)}75%{transform:perspective(600px) rotateX(6deg) rotateY(-3deg) translateZ(25px)}}
@keyframes orbit{from{transform:rotate(0deg) translateX(120px) rotate(0deg)}to{transform:rotate(360deg) translateX(120px) rotate(-360deg)}}
@keyframes orbit2{from{transform:rotate(120deg) translateX(90px) rotate(-120deg)}to{transform:rotate(480deg) translateX(90px) rotate(-480deg)}}
@keyframes orbit3{from{transform:rotate(240deg) translateX(160px) rotate(-240deg)}to{transform:rotate(600deg) translateX(160px) rotate(-600deg)}}
@keyframes pulse3d{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(50,201,113,0.3)}50%{transform:scale(1.05);box-shadow:0 0 40px 10px rgba(50,201,113,0.15)}}
@keyframes slide3d-left{from{opacity:0;transform:perspective(600px) rotateY(20deg) translateX(-60px)}to{opacity:1;transform:perspective(600px) rotateY(0) translateX(0)}}
@keyframes slide3d-right{from{opacity:0;transform:perspective(600px) rotateY(-20deg) translateX(60px)}to{opacity:1;transform:perspective(600px) rotateY(0) translateX(0)}}
@keyframes slide3d-up{from{opacity:0;transform:perspective(600px) rotateX(-10deg) translateY(40px) scale(0.95)}to{opacity:1;transform:perspective(600px) rotateX(0) translateY(0) scale(1)}}
@keyframes glow-pulse{0%,100%{filter:brightness(1) drop-shadow(0 0 8px rgba(50,201,113,0.3))}50%{filter:brightness(1.2) drop-shadow(0 0 24px rgba(50,201,113,0.6))}}
@keyframes counter-up{from{opacity:0;transform:perspective(400px) rotateX(30deg) translateY(20px)}to{opacity:1;transform:perspective(400px) rotateX(0) translateY(0)}}
@keyframes mesh-gradient{0%{background-position:0% 50%}25%{background-position:100% 0%}50%{background-position:100% 100%}75%{background-position:0% 100%}100%{background-position:0% 50%}}
@keyframes tilt-swirl{0%{transform:perspective(800px) rotateX(0) rotateY(0) rotateZ(0)}33%{transform:perspective(800px) rotateX(8deg) rotateY(-8deg) rotateZ(2deg)}66%{transform:perspective(800px) rotateX(-5deg) rotateY(10deg) rotateZ(-1deg)}100%{transform:perspective(800px) rotateX(0) rotateY(0) rotateZ(0)}}
@keyframes hero-float-3d{0%,100%{transform:perspective(1000px) rotateY(-12deg) rotateX(5deg) translateY(0)}50%{transform:perspective(1000px) rotateY(-8deg) rotateX(8deg) translateY(-16px)}}
@keyframes float-card{0%,100%{transform:translateY(0) translateZ(0)}50%{transform:translateY(-12px) translateZ(20px)}}
@keyframes float-card-delay{0%,100%{transform:translateY(0) translateZ(0)}50%{transform:translateY(-18px) translateZ(30px)}}
@keyframes pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.5);opacity:0}}
@keyframes slide-up-fade{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes slide-up-fade-d1{0%,12%{opacity:0;transform:translateY(30px)}25%{opacity:1;transform:translateY(0)}100%{opacity:1;transform:translateY(0)}}
@keyframes slide-up-fade-d2{0%,22%{opacity:0;transform:translateY(30px)}35%{opacity:1;transform:translateY(0)}100%{opacity:1;transform:translateY(0)}}
@keyframes slide-up-fade-d3{0%,32%{opacity:0;transform:translateY(30px)}45%{opacity:1;transform:translateY(0)}100%{opacity:1;transform:translateY(0)}}
@keyframes card-enter{from{opacity:0;transform:perspective(800px) rotateY(8deg) translateY(20px) scale(.95)}to{opacity:1;transform:perspective(800px) rotateY(0) translateY(0) scale(1)}}
@keyframes card-enter-d1{0%,8%{opacity:0;transform:perspective(800px) rotateY(8deg) translateY(20px) scale(.95)}18%{opacity:1;transform:perspective(800px) rotateY(0) translateY(0) scale(1)}100%{opacity:1;transform:none}}
@keyframes card-enter-d2{0%,16%{opacity:0;transform:perspective(800px) rotateY(8deg) translateY(20px) scale(.95)}26%{opacity:1;transform:perspective(800px) rotateY(0) translateY(0) scale(1)}100%{opacity:1;transform:none}}
@keyframes card-enter-d3{0%,24%{opacity:0;transform:perspective(800px) rotateY(8deg) translateY(20px) scale(.95)}34%{opacity:1;transform:perspective(800px) rotateY(0) translateY(0) scale(1)}100%{opacity:1;transform:none}}
@keyframes card-enter-d4{0%,32%{opacity:0;transform:perspective(800px) rotateY(8deg) translateY(20px) scale(.95)}42%{opacity:1;transform:perspective(800px) rotateY(0) translateY(0) scale(1)}100%{opacity:1;transform:none}}
@keyframes card-enter-d5{0%,40%{opacity:0;transform:perspective(800px) rotateY(8deg) translateY(20px) scale(.95)}50%{opacity:1;transform:perspective(800px) rotateY(0) translateY(0) scale(1)}100%{opacity:1;transform:none}}
@keyframes card-enter-d6{0%,48%{opacity:0;transform:perspective(800px) rotateY(8deg) translateY(20px) scale(.95)}58%{opacity:1;transform:perspective(800px) rotateY(0) translateY(0) scale(1)}100%{opacity:1;transform:none}}
@keyframes glow-soft{0%,100%{box-shadow:0 0 20px rgba(50,201,113,.15)}50%{box-shadow:0 0 40px rgba(50,201,113,.3)}}
@keyframes bar-grow{from{width:0}to{width:var(--w)}}
@keyframes testy-slide{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@media(max-width:768px){.hide-mobile{display:none!important}.mobile-col{flex-direction:column!important}.mobile-full{width:100%!important;min-width:0!important}.mobile-p16{padding:16px!important}.mobile-p12{padding:12px!important}.mobile-text-center{text-align:center!important}.mobile-gap8{gap:8px!important}.mobile-grid-1{grid-template-columns:1fr!important}.mobile-grid-2{grid-template-columns:1fr 1fr!important}.mobile-fs14{font-size:14px!important}.mobile-fs12{font-size:12px!important}.mobile-mb8{margin-bottom:8px!important}.mobile-mb16{margin-bottom:16px!important}*,*::before,*::after{max-width:100vw!important}img,svg,video,canvas{max-width:100%!important;height:auto!important}input,textarea,select{max-width:100%!important;box-sizing:border-box!important}pre,code{overflow-x:auto!important;max-width:100%!important;word-wrap:break-word!important}}
@media(max-width:480px){.hide-xs{display:none!important}.xs-p12{padding:12px!important}.xs-fs12{font-size:12px!important}}
`;

// ═══ Responsive hook ═══
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  return w;
}

// ═══════════════════════════════════════════════════════════════
// DATA — Dynamic stats system (everything starts at zero)
// ═══════════════════════════════════════════════════════════════
const STATS_KEY = 'smartstudy_stats_v2';
const TASKS_KEY = 'smartstudy_tasks';
const ACTIVITIES_KEY = 'smartstudy_activities';

function loadStats() {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY));
    if (s) return s;
  } catch {}
  return { xp: 0, streak: 0, lastActiveDate: null, totalHours: 0, quizzesTaken: 0, quizScores: [], aiQueries: 0, notesUploaded: 0, tasksCompleted: 0, tasksCreated: 0, weeklyXP: [0,0,0,0,0,0,0] };
}
function saveStats(s) { localStorage.setItem(STATS_KEY, JSON.stringify(s)); }
function loadTasks() { try { return JSON.parse(localStorage.getItem(TASKS_KEY)) || []; } catch { return []; } }
function saveTasks(t) { localStorage.setItem(TASKS_KEY, JSON.stringify(t)); }
function loadActivities() { try { return JSON.parse(localStorage.getItem(ACTIVITIES_KEY)) || []; } catch { return []; } }
function saveActivities(a) { localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(a.slice(0, 50))); } // keep last 50

const VOICE_NOTES_KEY = 'smartstudy_voice_notes';
function loadVoiceNotes() { try { return JSON.parse(localStorage.getItem(VOICE_NOTES_KEY) || '[]'); } catch { return []; } }
function saveVoiceNotes(v) { localStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(v)); }

function addXP(amount, reason, stats, setStats, setActivities) {
  const today = new Date().getDay();
  const dayIdx = today === 0 ? 6 : today - 1;
  const todayStr = new Date().toISOString().slice(0, 10);
  let newStreak = stats.streak;
  if (stats.lastActiveDate) {
    const last = new Date(stats.lastActiveDate);
    const diff = Math.floor((new Date(todayStr) - last) / 86400000);
    if (diff === 1) newStreak = stats.streak + 1;
    else if (diff > 1) newStreak = 1;
  } else { newStreak = 1; }
  const newWeeklyXP = [...stats.weeklyXP];
  newWeeklyXP[dayIdx] = (newWeeklyXP[dayIdx] || 0) + amount;
  const updated = { ...stats, xp: stats.xp + amount, streak: newStreak, lastActiveDate: todayStr, weeklyXP: newWeeklyXP };
  saveStats(updated);
  setStats(updated);
  if (setActivities) {
    const acts = loadActivities();
    acts.unshift({ text: reason, time: new Date().toISOString(), xp: amount, color: T.mint });
    saveActivities(acts);
    setActivities(acts);
  }
}

const quotes = [
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts repeated daily.",
  "Don't watch the clock; do what it does — keep going.",
  "Education is the passport to the future.",
  "The beautiful thing about learning is nobody can take it away from you.",
];

const PROMPTS = {
  explain: (n) => `You are an expert tutor who explains concepts in the most engaging, easy-to-understand way possible. A 10-year-old should be able to understand you.

Your rules:
- Start with a simple analogy or story that makes the topic click instantly
- Use very simple words and short sentences
- Explain every difficult term in plain English immediately
- Use **bold** for important words, section titles, and key definitions
- Use real-life examples students see every day (school, home, food, sports, games, social media)
- Add emoji to make it visual and fun
- Break everything into clear sections with bold headings
- Use bullet points (•) for lists
- Include a "Before vs After" comparison table
- Add a "Common Mistakes" section so students know what to avoid
- Include a "Memory Trick" — a fun way to remember the main concept

Format your response EXACTLY like this:

**📖 The Big Picture**
(Start with a relatable analogy — "Imagine if..." or "Think of it like...")
(2-3 sentences that make the whole topic click)

**🔑 Key Ideas Explained Simply**
• **Term 1** — simple explanation with a real-life example 🏠
• **Term 2** — simple explanation with a real-life example ⚡
• **Term 3** — simple explanation with a real-life example 🎮
• **Term 4** — simple explanation with a real-life example 📱

**📊 Before vs After**
| Before Learning | After Learning |
|---|---|
| (what students used to think) | (what they now understand) |
| (common misunderstanding) | (the correct idea) |

**⚠️ Common Mistakes to Avoid**
• ❌ Mistake 1 — (why students get this wrong)
• ❌ Mistake 2 — (why students get this wrong)
• ✅ Correct way — (the right approach)

**💡 Real-World Example**
(A detailed, fun example that connects the concept to everyday life — make it relatable and memorable)

**🧠 Memory Trick**
(A fun rhyme, acronym, visual trick, or story to remember the key concept forever)

**📝 30-Second Summary**
(3 lines that capture everything — read this before your exam!)

**🎯 Why This Matters for Your Exam**
(1-2 lines about where this shows up in tests and how many marks it's worth)

Now explain these notes in detail:
${n}`,

  quiz: (n) => `You are a fun quizmaster creating an engaging, comprehensive quiz from these notes. Use simple English that any student can understand.

Create a COMPLETE quiz with EXACTLY this structure:

**🎯 Topic Quiz — Test Your Knowledge!**
(A fun 1-line encouraging message)

---

**📝 Section A: Quick Fire — True or False (5 questions)**

For each: State if it's True ✅ or False ❌, then explain why in 1 simple sentence.

**1.** (statement)
✅/❌ **Answer:** (brief explanation)

(Repeat for 5 T/F questions)

---

**🤔 Section B: Multiple Choice (5 questions)**

**6.** (question text in simple words)
A) option
B) option
C) option
D) option

✅ **Answer: (letter)** — (explain WHY this is correct and WHY the others are wrong in simple terms)

(Repeat for 5 MCQ questions — number them 6-10)

---

**✍️ Section C: Fill in the Blanks (3 questions)**

**11.** ________ is the process where plants make food using sunlight.
✅ **Answer:** Photosynthesis — (brief explanation)

(Repeat for 3 fill-in-the-blank — number them 11-13)

---

**🧠 Section D: Match the Following**

Match Column A with Column B:

| Column A | Column B |
|---|---|
| 1. Term One | a. Definition D |
| 2. Term Two | b. Definition A |
| 3. Term Three | c. Definition B |
| 4. Term Four | d. Definition C |

✅ **Answers:** 1→b, 2→d, 3→c, 4→a — (brief explanations)

---

**💡 Section E: Short Answer Challenge (2 questions)**

**14.** (open-ended question that tests understanding, not memorization)
✅ **Sample Answer:** (a complete but simple answer with key points)

**15.** (application question — "If X happened, what would Y do?")
✅ **Sample Answer:** (step-by-step reasoning in simple terms)

---

**📊 Results & Score Guide**
| Score | Rating | Message |
|---|---|---|
| 13-15 | ⭐⭐⭐ Master | Outstanding! You know this topic inside out! |
| 10-12 | ⭐⭐ Great | Strong understanding! Review the tricky parts. |
| 7-9 | ⭐ Good | Decent! Re-read the sections you got wrong. |
| Below 7 | 📚 Keep Going | Don't worry! Read the notes again and retry. |

**💡 Study Tips Based on This Quiz:**
• (tip about the most commonly missed concept)
• (tip about a tricky topic)
• (encouraging final message)

Now create the complete quiz from these notes:
${n}`,

  keypoints: (n) => `Extract the most important key points from these notes. Use very basic English that any student can understand.

Your rules:
- Each point must be simple and clear
- Use **bold** for important words
- Group related points together under bold headings
- Add a brief example for each major point
- Use bullet points (•)
- Keep each point to 1-2 lines

Format:

**📋 Key Points from Your Notes**

**Section 1: (Topic Name)**
• **Important word** — simple explanation (example: ...)
• **Important word** — simple explanation

**Section 2: (Topic Name)**  
• **Important word** — simple explanation
• **Important word** — simple explanation

**🧠 Things to Remember**
• (top 3 most important takeaways in simple words)

**📚 Words You Should Know**
• **Word 1** — simple meaning
• **Word 2** — simple meaning

Now extract key points from these notes:
${n}`,

  summarize: (n) => `Create a clean, simple study summary of these notes. Use basic English that any student can understand.

Your rules:
- Use **bold** for section titles and key terms
- Keep everything short and to the point
- Use bullet points (•) for lists
- Add simple examples where helpful
- Include a "What to Study for Exam" section

Format:

**📝 Study Summary**

**Overview**
(2-3 simple sentences about what these notes are about)

**Main Topics**
• **Topic 1** — short simple explanation
• **Topic 2** — short simple explanation  
• **Topic 3** — short simple explanation

**Important Formulas / Facts**
• (any formulas, dates, or facts written in simple terms)

**Connections**
(how different topics in the notes relate to each other, in simple words)

**🎯 What to Study for Exam**
• (top 3-5 things most likely to appear on a test)

**⏱ Quick Review (1-Minute Version)**
(3-4 lines that capture the entire topic in the simplest way)

Now summarize these notes:
${n}`,

  ask: (n) => `You are a helpful tutor who answers in very simple, basic English. Follow these rules:
- Use short, simple sentences
- Use **bold** for important words
- Give real-life examples (school, home, food, sports, games)
- Break complex answers into easy steps
- If the student asks about something in the notes, explain it simply
- Always be encouraging and friendly

Student's notes for context:
${n}`,

  mindmap: (n) => `Generate a mind map structure from these notes. Return ONLY valid JSON in this exact format, no other text:
{"title":"Topic","children":[{"title":"Subtopic 1","children":[{"title":"Detail 1"},{"title":"Detail 2"}]},{"title":"Subtopic 2","children":[{"title":"Detail 3"}]}]}
Rules: Max 2 levels deep. Keep titles short (2-4 words). Max 5 main branches, 3 sub-items each. Cover the most important topics.
Notes: ${n}`,

  flashcards: (n) => `Generate 10 spaced repetition flashcards from these notes. Return ONLY a JSON array, no other text:
[{"q":"question in simple words","a":"clear concise answer","interval":1}]
Rules: Each card covers a key concept. Interval is days until next review (1 for new cards). Questions should use basic English. Answers should be short and easy to understand.
Notes: ${n}`,
};

const STUDY_TOOLS = [
  { id: 'explain', label: 'Explain', icon: BookOpen, color: T.indigo, prompt: 'Explain my notes' },
  { id: 'quiz', label: 'Quiz', icon: Target, color: T.orange, prompt: 'Generate quiz' },
  { id: 'keypoints', label: 'Key Points', icon: ListChecks, color: T.green, prompt: 'Extract key points' },
  { id: 'summarize', label: 'Summary', icon: FileText, color: T.purple, prompt: 'Summarize notes' },
  { id: 'mindmap', label: 'Mind Map', icon: Map, color: T.violet, prompt: 'Generate mind map' },
  { id: 'flashcards', label: 'Flashcards', icon: BrainCircuit, color: T.cyan, prompt: 'Generate flashcards' },
  { id: 'ask', label: 'Ask AI', icon: MessageCircle, color: T.pink, prompt: null },
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'study-tools', label: 'Study Tools', icon: Brain },
  { id: 'planner', label: 'Study Planner', icon: Calendar },
  { id: 'notes', label: 'Notes', icon: BookMarked },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
async function extractText(file) {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) return await file.text();
  // Image files — OCR with Tesseract.js
  if (file.type.startsWith('image/') || /\.(png|jpg|jpeg|bmp|tiff|webp)$/i.test(file.name)) {
    const result = await Tesseract.recognize(file, 'eng', { logger: () => {} });
    const text = result.data.text;
    if (!text || text.trim().length < 5) throw new Error('Could not read text from this image. Try a clearer photo or use a PDF/TXT file.');
    return text;
  }
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const pdfjsLib = await import('pdfjs-dist');
    // Disable worker — process in main thread (fine for study notes)
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(ab) }).promise;
    let t = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const p = await pdf.getPage(i);
      const ct = await p.getTextContent();
      t += ct.items.map(x => x.str).join(' ') + '\n';
    }
    return t.trim();
  }
  if (file.name.endsWith('.docx')) {
    const ab = await file.arrayBuffer();
    const r = await mammoth.extractRawText({ arrayBuffer: ab });
    return r.value;
  }
  return await file.text();
}

const LANGUAGE_INSTRUCTIONS = {
  English: 'Respond in English.',
  Urdu: 'Respond in Urdu (اردو). Write the entire response in Urdu script. Use simple Urdu that students can easily understand.',
  Spanish: 'Responde en español. Usa español simple que los estudiantes puedan entender fácilmente.',
  French: 'Répondez en français. Utilisez un français simple que les étudiants peuvent facilement comprendre.',
  German: 'Antworten Sie auf Deutsch. Verwenden Sie einfaches Deutsch, das Studenten leicht verstehen können.',
  Portuguese: 'Responda em português. Use português simples que os alunos possam entender facilmente.',
  Chinese: '用中文回答。使用简单易懂的中文，让学生容易理解。',
  Japanese: '日本語で答えてください。学生が簡単に理解できる日本語を使ってください。',
  Hindi: 'हिंदी में उत्तर दें। ऐसी सरल हिंदी का उपयोग करें जो छात्र आसानी से समझ सकें।',
  Arabic: 'أجب بالعربية. استخدم عربية بسيطة يستطيع الطلاب فهمها بسهولة.',
  Korean: '한국어로 답변하세요. 학생들이 쉽게 이해할 수 있는 간단한 한국어를 사용하세요.',
};

const callAI = async (sys, hist = [], lang = 'English') => {
  const langInstruction = LANGUAGE_INSTRUCTIONS[lang] || LANGUAGE_INSTRUCTIONS.English;
  const fullSystem = `${sys}\n\n${langInstruction}`;
  const r = await fetch(`${window.__AI_BASE_URL}/v1/chat/completions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.__AI_API_KEY}` },
    body: JSON.stringify({ model: 'drytis/kimi-k2.5', max_tokens: 3000, messages: [{ role: 'system', content: fullSystem }, ...hist] }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `Error ${r.status}`); }
  return (await r.json()).choices?.[0]?.message?.content || 'No response.';
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

// -- Stat Card --
function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  const ww = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMob = ww < 768;
  return (
    <div style={{ padding: isMob ? 16 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden', transition: 'all .3s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, borderRadius: '50%', background: `${color}08`, filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: isMob ? 34 : 40, height: isMob ? 34 : 40, borderRadius: isMob ? 10 : 12, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(Icon, isMob ? 16 : 20, color)}</div>
        {trend && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.green, background: T.greenSoft, padding: '3px 8px', borderRadius: 6 }}>{Ic(TrendingUp, 12, T.green)}{trend}</div>}
      </div>
      <div style={{ fontSize: isMob ? 22 : 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: isMob ? 10 : 12, color: T.text3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// -- Liquid Button (enhanced with JS ripples) --
function GlowButton({ children, onClick, color = T.indigo, icon: Icon, size = 'md', variant = 'primary', disabled, style = {} }) {
  const [ripples, setRipples] = useState([]);
  const sizes = { sm: { padding: '8px 16px', fontSize: 12 }, md: { padding: '11px 22px', fontSize: 13 }, lg: { padding: '14px 32px', fontSize: 15 } };
  const s = sizes[size] || sizes.md;
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const handleClick = (e) => {
    if (disabled || !onClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    const maxDim = Math.max(rect.width, rect.height) * 2.5;
    setRipples(prev => [...prev, { id, x, y, size: maxDim }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
    onClick(e);
  };

  return (
    <button onClick={handleClick} disabled={disabled}
      className="liquid-btn"
      style={{
        ...s, fontWeight: 600, borderRadius: 12, border: isOutline ? `1.5px solid ${color}40` : isGhost ? '1.5px solid transparent' : 'none',
        background: isOutline || isGhost ? 'transparent' : `linear-gradient(135deg, ${color}, ${T.purple})`,
        color: isOutline || isGhost ? color : '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden',
        opacity: disabled ? 0.5 : 1, letterSpacing: '-0.2px',
        boxShadow: isOutline || isGhost ? 'none' : `0 2px 12px ${color}25, inset 0 1px 0 rgba(255,255,255,0.15)`,
        ...style,
      }}>
      {/* JS-driven liquid ripples (follow cursor) */}
      {ripples.map(r => (
        <span key={r.id} style={{ position: 'absolute', left: r.x - r.size / 2, top: r.y - r.size / 2, width: r.size, height: r.size, borderRadius: '50%', background: isOutline || isGhost ? `${color}15` : 'rgba(255,255,255,0.3)', transform: 'scale(0)', animation: 'liquid-ripple 0.7s ease-out forwards', pointerEvents: 'none' }} />
      ))}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {Icon && Ic(Icon, size === 'sm' ? 14 : size === 'lg' ? 18 : 16, isOutline || isGhost ? color : '#fff')}
        {children}
      </span>
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
  const isMobPom = typeof window !== 'undefined' && window.innerWidth < 768;
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
    <div style={{ padding: isMobPom ? 14 : 20, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobPom ? 10 : 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: isMobPom ? 11 : 13, fontWeight: 600 }}>{Ic(Timer, isMobPom ? 14 : 16, T.indigo)} Pomodoro</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['focus', '25m'], ['short', '5m'], ['long', '15m']].map(([id, lb]) => (
            <button key={id} onClick={() => { setMode(id); setTime(iv[id]); setRunning(false); }}
              style={{ padding: '3px 8px', borderRadius: 5, fontSize: isMobPom ? 9 : 10, fontWeight: 600, background: mode === id ? T.indigoSoft : T.bg2, color: mode === id ? T.indigo : T.text3, border: 'none', cursor: 'pointer' }}>{lb}</button>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: isMobPom ? 8 : 12 }}>
        <div style={{ fontSize: isMobPom ? 28 : 40, fontWeight: 800, letterSpacing: isMobPom ? '-1px' : '-2px' }}>{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</div>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: T.surface3, marginBottom: isMobPom ? 10 : 14, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${T.indigo}, ${T.cyan})`, width: `${pct}%`, transition: 'width 1s linear' }} />
      </div>
      <button onClick={() => setRunning(!running)} className="glow-btn"
        style={{ width: '100%', padding: isMobPom ? 8 : 10, borderRadius: 8, background: running ? T.orangeSoft : `linear-gradient(135deg, ${T.indigo}, ${T.purple})`, color: running ? T.orange : '#fff', border: 'none', cursor: 'pointer', fontSize: isMobPom ? 11 : 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {running ? Ic(Pause, isMobPom ? 12 : 14, T.orange) : Ic(Play, isMobPom ? 12 : 14, '#fff')} {running ? 'Pause' : 'Start Focus'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════

// -- Full Liquid Button (Landing page only) --
function LiquidButton({ children, onClick, icon: Icon, size = 'md', variant = 'primary', style = {} }) {
  const [ripples, setRipples] = useState([]);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const isMobLiq = typeof window !== 'undefined' && window.innerWidth < 768;
  const sizes = { sm: { padding: isMobLiq ? '8px 16px' : '10px 20px', fontSize: isMobLiq ? 10 : 12 }, md: { padding: isMobLiq ? '10px 20px' : '13px 28px', fontSize: isMobLiq ? 12 : 14 }, lg: { padding: isMobLiq ? '12px 28px' : '17px 40px', fontSize: isMobLiq ? 13 : 16 } };
  const s = sizes[size] || sizes.lg;
  const isOutline = variant === 'outline';

  const handleClick = (e) => {
    if (!onClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    const maxDim = Math.max(rect.width, rect.height) * 2.5;
    setRipples(prev => [...prev, { id, x, y, size: maxDim }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
    onClick(e);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <button
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        ...s, fontWeight: 700, letterSpacing: '-0.3px', fontFamily: 'inherit',
        borderRadius: 14,
        border: isOutline
          ? `1.5px solid ${hovered ? T.indigo : '#c4c4c4'}`
          : 'none',
        background: isOutline
          ? (hovered ? '#f5f3ff' : T.surface)
          : 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
        color: isOutline ? T.text : '#fff', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 10,
        position: 'relative', overflow: 'hidden',
        transform: pressed ? 'scale(0.96)' : hovered ? 'translateY(-3px) scale(1.03)' : 'scale(1)',
        boxShadow: isOutline
          ? (hovered ? '0 8px 24px rgba(99,102,241,0.15)' : '0 1px 3px rgba(0,0,0,0.06)')
          : (hovered
            ? '0 16px 48px rgba(99,102,241,0.3), 0 8px 24px rgba(6,182,212,0.15)'
            : '0 4px 20px rgba(99,102,241,0.2), 0 2px 8px rgba(6,182,212,0.1)'),
        transition: 'all .4s cubic-bezier(.175,.885,.32,1.275)',
        ...style,
      }}>

      {/* Aurora background — colorful flowing bands */}
      {!isOutline && (
        <span style={{
          position: 'absolute', inset: '-20%',
          background: `
            radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, rgba(139,92,246,0.6) 0%, transparent 50%),
            radial-gradient(ellipse at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(6,182,212,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(236,72,153,0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.3) 0%, transparent 40%)
          `,
          animation: 'aurora-shift 6s ease-in-out infinite alternate',
          transition: 'all .3s ease',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }} />
      )}

      {/* Aurora band 1 — slow flowing */}
      {!isOutline && (
        <span style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(110deg, transparent 20%, rgba(139,92,246,0.25) 35%, rgba(6,182,212,0.3) 50%, rgba(236,72,153,0.2) 65%, transparent 80%)',
          backgroundSize: '200% 100%',
          animation: 'aurora-flow 3s ease-in-out infinite',
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }} />
      )}

      {/* Aurora band 2 — offset flow */}
      {!isOutline && (
        <span style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(250deg, transparent 25%, rgba(34,211,238,0.2) 40%, rgba(168,85,247,0.25) 55%, transparent 70%)',
          backgroundSize: '200% 100%',
          animation: 'aurora-flow2 4s ease-in-out infinite',
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }} />
      )}

      {/* Cursor-following glow spot */}
      {!isOutline && hovered && (
        <span style={{
          position: 'absolute',
          left: `${mousePos.x}%`, top: `${mousePos.y}%`,
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          transition: 'left .1s ease, top .1s ease',
          pointerEvents: 'none',
        }} />
      )}

      {/* Glass top edge highlight */}
      <span style={{
        position: 'absolute', top: 0, left: '5%', right: '5%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Glass inner glow */}
      <span style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '40%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
        borderRadius: '14px 14px 50% 50%',
        pointerEvents: 'none',
      }} />

      {/* Floating sparkle particles */}
      {!isOutline && (
        <>
          <span style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', top: '20%', left: '15%', animation: 'sparkle-float 2.5s ease-in-out infinite', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', top: '60%', right: '20%', animation: 'sparkle-float 3s ease-in-out infinite .5s', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', bottom: '25%', left: '40%', animation: 'sparkle-float 2s ease-in-out infinite 1s', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: 'rgba(139,92,246,0.5)', top: '35%', right: '30%', animation: 'sparkle-float 3.5s ease-in-out infinite .3s', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: 'rgba(6,182,212,0.5)', top: '50%', left: '25%', animation: 'sparkle-float 2.8s ease-in-out infinite .8s', pointerEvents: 'none' }} />
        </>
      )}

      {/* Click ripples */}
      {ripples.map(r => (
        <span key={r.id} style={{
          position: 'absolute', left: r.x - r.size / 2, top: r.y - r.size / 2,
          width: r.size, height: r.size, borderRadius: '50%',
          background: isOutline
            ? 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%)',
          transform: 'scale(0)', animation: 'liquid-ripple 0.8s ease-out forwards',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 8, textShadow: isOutline ? 'none' : '0 1px 3px rgba(0,0,0,0.15)' }}>
        {Icon && Ic(Icon, size === 'sm' ? 14 : size === 'lg' ? 18 : 16, isOutline ? T.indigo : '#fff')}
        {children}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEMO WALKTHROUGH — Animated guided tour
// ═══════════════════════════════════════════════════════════════
function DemoWalkthrough({ isMobile, onClose, onEnter }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: 'upload',
      title: 'Upload Your Notes',
      desc: 'Upload PDF, text, or image files of your study material. SmartStudy AI instantly reads and understands your content.',
      color: '#32C971',
      visual: 'upload',
    },
    {
      icon: 'brain',
      title: 'AI Explanations',
      desc: 'Get instant, easy-to-understand explanations of any topic. Ask follow-up questions and learn at your own pace.',
      color: '#8B5CF6',
      visual: 'explain',
    },
    {
      icon: 'quiz',
      title: 'Smart Quizzes',
      desc: 'AI generates personalized quizzes from your notes. Test yourself and track your progress over time.',
      color: '#0EA5E9',
      visual: 'quiz',
    },
    {
      icon: 'flashcard',
      title: 'Flashcards & Spaced Repetition',
      desc: 'Automatically created flashcards with scientifically proven spaced repetition to maximize retention.',
      color: '#F59E0B',
      visual: 'flashcard',
    },
    {
      icon: 'summary',
      title: 'Instant Summaries',
      desc: 'Turn long chapters into concise summaries. Get the key points in seconds, not hours.',
      color: '#EF4444',
      visual: 'summary',
    },
    {
      icon: 'plan',
      title: 'Personalized Study Plan',
      desc: 'AI creates a tailored study schedule based on your goals, exam dates, and learning pace.',
      color: '#10B981',
      visual: 'plan',
    },
  ];

  const s = slides[step];
  const isLast = step === slides.length - 1;

  // Auto-advance
  useEffect(() => {
    if (step < slides.length - 1) {
      const t = setTimeout(() => setStep(step + 1), 5000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const iconMap = {
    upload: Upload, brain: Brain, quiz: ClipboardList,
    flashcard: Layers, summary: FileText, plan: Calendar,
  };
  const Icon = iconMap[s.icon] || Brain;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fade-in .3s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: isMobile ? '94%' : '900px', maxWidth: '100%', maxHeight: isMobile ? '90vh' : '88vh', overflow: 'hidden', borderRadius: 20, background: '#0a0f1a', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Close button */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}>✕</button>

        {/* Progress dots */}
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? s.color : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all .3s' }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: isMobile ? 'auto' : 460 }}>

          {/* Left — Visual mockup */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '60px 24px 20px' : '60px 40px', background: `linear-gradient(135deg, ${s.color}15, transparent)`, position: 'relative', overflow: 'hidden', minHeight: isMobile ? 200 : 'auto' }}>
            <DemoVisual visual={s.visual} color={s.color} isMobile={isMobile} />
          </div>

          {/* Right — Text */}
          <div style={{ flex: 1, padding: isMobile ? '20px 28px 28px' : '60px 48px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: `0 8px 24px ${s.color}40`, animation: 'slide-up-fade .5s ease both' }}>
              {Ic(Icon, 28, '#fff')}
            </div>
            <h3 key={step} style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px', animation: 'slide-up-fade .4s ease both' }}>{s.title}</h3>
            <p key={step + '-desc'} style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32, animation: 'slide-up-fade .5s ease both' }}>{s.desc}</p>

            {/* Step counter */}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginBottom: 16 }}>
              {step + 1} / {slides.length}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s' }}>
                  ← Back
                </button>
              )}
              {isLast ? (
                <button onClick={onEnter} style={{ flex: 1, padding: '12px 24px', borderRadius: 10, background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 16px ${s.color}40`, transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  {Ic(Sparkles, 16, '#fff')} Try It Now — Free
                </button>
              ) : (
                <button onClick={() => setStep(step + 1)} style={{ flex: 1, padding: '12px 24px', borderRadius: 10, background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 16px ${s.color}40`, transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  Next →
                </button>
              )}
            </div>
            {/* Skip */}
            {!isLast && (
              <button onClick={onClose} style={{ marginTop: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer', fontWeight: 500, alignSelf: 'flex-start' }}>Skip demo</button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.05)' }}>
          <div key={step} style={{ height: '100%', background: s.color, borderRadius: 3, width: `${((step + 1) / slides.length) * 100}%`, transition: 'width .5s ease' }} />
        </div>
      </div>
    </div>
  );
}

// ── Demo Visual Mockups ──
function DemoVisual({ visual, color, isMobile }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(t => t + 1), 2000); return () => clearInterval(t); }, []);

  const wrap = (children) => (
    <div style={{ width: isMobile ? '100%' : 300, maxWidth: 300, animation: 'slide-up-fade .6s ease both' }} key={tick}>{children}</div>
  );

  if (visual === 'upload') return wrap(
    <div>
      <div style={{ border: `2px dashed ${color}50`, borderRadius: 16, padding: 32, textAlign: 'center', background: `${color}08`, marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'glow-soft 2s ease-in-out infinite' }}>
          {Ic(Upload, 24, color)}
        </div>
        <p style={{ color: color, fontSize: 13, fontWeight: 600 }}>Drop your notes here</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>PDF, TXT, JPG, PNG</p>
      </div>
      {['📄 Biology_Chapter_5.pdf', '📝 Physics_Notes.txt'].map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: `${color}20` }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{f}</span>
          <span style={{ fontSize: 10, color, fontWeight: 600 }}>✓ Done</span>
        </div>
      ))}
    </div>
  );

  if (visual === 'explain') return wrap(
    <div style={{ width: '100%' }}>
      <div style={{ padding: '12px 14px', borderRadius: 12, background: `${color}15`, marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
        Explain mitosis in simple terms?
      </div>
      <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}20`, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
          {Ic(Brain, 14, color)}
          <span style={{ fontSize: 10, fontWeight: 700, color }}>AI Tutor</span>
        </div>
        Mitosis is how cells divide. One cell splits into two identical copies. Think of it like photocopying a document...
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {['Tell me more', 'Give example', 'Make a quiz'].map(q => (
          <div key={q} style={{ padding: '5px 10px', borderRadius: 8, background: `${color}12`, fontSize: 10, color: `${color}cc` }}>{q}</div>
        ))}
      </div>
    </div>
  );

  if (visual === 'quiz') return wrap(
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 10 }}>📋 Quiz: Biology Ch. 5 — Question 2/5</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>What happens during prophase?</div>
      {['DNA replicates', 'Chromosomes condense', 'Cell splits', 'Nucleus disappears'].map((opt, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: i === 1 ? `${color}18` : 'rgba(255,255,255,0.03)', border: i === 1 ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.05)', marginBottom: 6, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: i === 1 ? `5px solid ${color}` : `1.5px solid rgba(255,255,255,0.2)`, flexShrink: 0 }} />
          {opt}
          {i === 1 && <span style={{ marginLeft: 'auto', color, fontSize: 10, fontWeight: 600 }}>✓</span>}
        </div>
      ))}
      <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 2 ? color : 'rgba(255,255,255,0.1)' }} />)}
      </div>
    </div>
  );

  if (visual === 'flashcard') return wrap(
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ padding: 28, borderRadius: 16, background: `linear-gradient(135deg, ${color}20, ${color}08)`, border: `1px solid ${color}30`, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: `${color}aa`, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Flashcard 3/20</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>What is Meiosis?</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Tap to flip →</div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <div style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', fontSize: 11, color: '#EF4444', fontWeight: 600 }}>✗ Again</div>
        <div style={{ padding: '6px 14px', borderRadius: 8, background: `${color}18`, fontSize: 11, color, fontWeight: 600 }}>✓ Good</div>
        <div style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(50,201,113,0.15)', fontSize: 11, color: '#32C971', fontWeight: 600 }}>★ Easy</div>
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Next review in 3 days</div>
    </div>
  );

  if (visual === 'summary') return wrap(
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 10 }}>📄 Summary — Biology Ch. 5</div>
      <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}20`, marginBottom: 8 }}>
        {['Cell division & mitosis phases', 'DNA replication process', 'Difference between mitosis & meiosis'].map((pt, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            <span style={{ color, fontWeight: 700 }}>•</span> {pt}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, padding: '8px', borderRadius: 8, background: `${color}12`, textAlign: 'center', fontSize: 10, color: `${color}cc` }}>⏱ 2 min read</div>
        <div style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>12 key points</div>
      </div>
    </div>
  );

  if (visual === 'plan') return wrap(
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 10 }}>📅 Your Study Plan — This Week</div>
      {[
        { day: 'Mon', task: 'Biology Ch. 5', pct: 100, done: true },
        { day: 'Tue', task: 'Physics Problems', pct: 60, done: false },
        { day: 'Wed', task: 'Chemistry Review', pct: 0, done: false },
        { day: 'Thu', task: 'Math Practice', pct: 0, done: false },
      ].map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: d.done ? `${color}20` : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: d.done ? color : 'rgba(255,255,255,0.3)' }}>{d.day}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>{d.task}</div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ height: '100%', borderRadius: 2, background: d.done ? color : `${color}80`, width: `${d.pct}%`, transition: 'width .8s ease' }} />
            </div>
          </div>
          {d.done && <span style={{ fontSize: 12, color }}>✓</span>}
        </div>
      ))}
    </div>
  );

  return wrap(<div />);
}

function Landing({ onEnter }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const isTablet = ww >= 768 && ww < 1024;
  const [hoveredCard, setHoveredCard] = useState(null);
  const [testIdx, setTestIdx] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  // Mint-green palette matching app theme
  const L = {
    bg: '#f0fdf4', bgDark: '#0a1a0f',
    mint: '#32C971', mintLight: '#A9F5C6', mintGlow: 'rgba(50,201,113,0.18)',
    surface: '#ffffff', surfaceGlass: 'rgba(255,255,255,0.7)',
    text: '#0f172a', text2: '#475569', text3: '#94a3b8',
    border: 'rgba(50,201,113,0.15)',
  };

  const testimonials = [
    { name: 'Sarah K.', role: 'Medical Student', avatar: '👩‍⚕️', text: 'SmartStudy helped me ace my anatomy finals. The AI tutor explains complex topics better than my textbooks!', stars: 5 },
    { name: 'Ahmed R.', role: 'CS Major', avatar: '👨‍💻', text: 'The flashcard system with spaced repetition is incredible. I remember 3x more than before.', stars: 5 },
    { name: 'Emily T.', role: 'Law Student', avatar: '👩‍⚖️', text: 'I upload my case notes and get instant summaries and quizzes. It saved me hours every week.', stars: 5 },
  ];
  const t = testimonials[testIdx];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(20px, 4vw, 48px)', background: 'rgba(240,253,244,0.85)', backdropFilter: 'blur(16px) saturate(1.5)', borderBottom: '1px solid rgba(50,201,113,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #32C971, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(50,201,113,0.35)', animation: 'glow-soft 3s ease-in-out infinite' }}>{Ic(Brain, 18, '#fff')}</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: L.text, letterSpacing: '-0.5px' }}>Smart<span style={{ color: L.mint }}>Study</span> AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 28 }}>
          {!isMobile && ['Features', 'Tools'].map(l => <span key={l} style={{ fontSize: 13.5, fontWeight: 500, color: L.text2, cursor: 'pointer', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = L.mint} onMouseLeave={e => e.currentTarget.style.color = L.text2}>{l}</span>)}
          <button onClick={onEnter} style={{ padding: '9px 22px', borderRadius: 10, background: L.text, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .3s', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} onMouseEnter={e => { e.currentTarget.style.background = L.mint; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(50,201,113,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'; }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px clamp(20px, 4vw, 64px) 40px', background: `linear-gradient(170deg, ${L.bg} 0%, #fff 50%, ${L.bg} 100%)`, position: 'relative', overflow: 'hidden' }}>
        {/* Soft background blobs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(50,201,113,0.08), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 60, alignItems: 'center', width: '100%' }}>
          {/* Left — Text Content */}
          <div style={{ animation: 'slide-up-fade .8s ease-out both', textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(50,201,113,0.08)', border: '1px solid rgba(50,201,113,0.15)', marginBottom: 24, fontSize: 12, color: L.mint, fontWeight: 600, letterSpacing: '0.3px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.mint, animation: 'glow-soft 2s ease-in-out infinite' }} />
              AI-Powered Study Platform
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', color: L.text, marginBottom: 20 }}>
              Study smarter<br />with your<br />
              <span style={{ background: 'linear-gradient(135deg, #32C971, #10B981, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>personal AI tutor</span>
            </h1>
            <p style={{ fontSize: isMobile ? 14 : 17, color: L.text2, lineHeight: 1.7, maxWidth: isMobile ? '100%' : 440, marginBottom: isMobile ? 20 : 32, fontWeight: 400 }}>
              Upload your notes and get instant explanations, quizzes, flashcards, summaries, and a personalized study plan — all in one platform.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <button onClick={onEnter} style={{ padding: isMobile ? '12px 20px' : '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #32C971, #10B981)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: isMobile ? 13 : 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(50,201,113,0.3)', transition: 'all .3s cubic-bezier(.4,0,.2,1)', position: 'relative', overflow: 'hidden' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(50,201,113,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(50,201,113,0.3)'; }}>
                {Ic(Sparkles, isMobile ? 15 : 18, '#fff')} Start Studying — Free
              </button>
              <button onClick={() => setShowDemo(true)} style={{ padding: isMobile ? '10px 18px' : '14px 28px', borderRadius: 12, background: L.surface, color: L.text2, border: `1px solid ${L.border}`, cursor: 'pointer', fontSize: isMobile ? 12 : 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .3s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = L.mint; e.currentTarget.style.color = L.mint; e.currentTarget.style.background = 'rgba(50,201,113,0.04)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.color = L.text2; e.currentTarget.style.background = L.surface; }}>
                {Ic(Play, isMobile ? 14 : 18, 'currentColor')} Watch Demo
              </button>
            </div>
            <div style={{ display: 'flex', gap: isMobile ? 16 : 24, marginTop: isMobile ? 24 : 32, alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              {[
                ['10K+', 'Students', L.mint],
                ['4.9★', 'Rating', '#FBBF24'],
                ['98%', 'Satisfaction', '#0EA5E9'],
              ].map(([v, l, c]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: 11, color: L.text3, fontWeight: 500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Clean Modern Illustration */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'slide-up-fade-d2 1s ease-out both', padding: isMobile ? 20 : 0 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 460, animation: 'float-card 6s ease-in-out infinite' }}>
              {/* Main Dashboard Card */}
              <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, #32C971, #39C16C)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 16 }}>🧠</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>SmartStudy AI</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[T.mint, T.amber, T.rose].map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: c, opacity: 0.6 }} />)}
                  </div>
                </div>
                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[{ l: 'Notes', v: '24', c: T.mint, e: '📄' }, { l: 'XP', v: '1.2k', c: T.amber, e: '⭐' }, { l: 'Streak', v: '7d', c: T.orange, e: '🔥' }].map((s, i) => (
                    <div key={i} style={{ padding: '10px 8px', borderRadius: 12, background: `${s.c}08`, border: `1px solid ${s.c}15`, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, marginBottom: 2 }}>{s.e}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{s.v}</div>
                      <div style={{ fontSize: 9, color: '#9CA3AF' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {/* AI Chat Preview */}
                <div style={{ padding: 14, borderRadius: 14, background: '#F8FAF9', border: '1px solid #E5E7EB', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(135deg, #32C971, #39C16C)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: 11 }}>🤖</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>The mitochondria is the powerhouse of the cell. It converts glucose into ATP through cellular respiration... 🧬</div>
                  </div>
                </div>
                {/* Mini chart bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 50, padding: '0 4px' }}>
                  {[35, 55, 40, 70, 50, 80, 65, 90, 60, 75, 85, 55].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 4, background: `linear-gradient(180deg, ${T.mint}, ${T.emerald})`, opacity: 0.5 + (h / 200), transition: 'height .3s' }} />
                  ))}
                </div>
                <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 6, textAlign: 'center' }}>Weekly Study Activity</div>
              </div>

              {/* Floating badges */}
              <div style={{ position: 'absolute', top: -14, right: -10, padding: '8px 14px', borderRadius: 12, background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 6, animation: 'hero-float 5s ease-in-out infinite' }}>
                <span style={{ fontSize: 16 }}>🎓</span>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Level 12</div><div style={{ fontSize: 8, color: '#9CA3AF' }}>Scholar</div></div>
              </div>
              <div style={{ position: 'absolute', bottom: -12, left: -14, padding: '8px 14px', borderRadius: 12, background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 6, animation: 'hero-float 6s ease-in-out infinite 1s' }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>92% Done</div><div style={{ fontSize: 8, color: '#9CA3AF' }}>This week</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── FEATURES SECTION ── */}
      <section style={{ padding: '100px clamp(20px, 4vw, 64px)', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 56, animation: 'slide-up-fade .6s ease-out both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, background: 'rgba(50,201,113,0.06)', border: '1px solid rgba(50,201,113,0.1)', fontSize: 11, color: L.mint, fontWeight: 600, marginBottom: 16 }}>
              ✦ Core Features
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', color: L.text, marginBottom: 14 }}>Everything you need to ace your exams</h2>
            <p style={{ fontSize: isMobile ? 13 : 16, color: L.text2, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>Powerful AI tools designed to help you learn faster, remember longer, and score higher.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 260 : 300}px, 1fr))`, gap: isMobile ? 12 : 20 }}>
            {[
              [Brain, 'AI Chat Tutor', 'Ask any question and get clear, step-by-step explanations from your personal AI tutor.', L.mint, 'rgba(50,201,113,0.06)'],
              [Target, 'Smart Quizzes', 'Auto-generated quizzes from your notes to test your knowledge and track improvement.', '#0EA5E9', 'rgba(14,165,233,0.06)'],
              [Layers, 'Spaced Repetition', 'Science-backed flashcard system that schedules reviews at optimal intervals.', '#A78BFA', 'rgba(167,139,250,0.06)'],
              [FileText, 'Note Summarizer', 'Upload PDFs, docs, or images — get instant summaries and key highlights.', '#FBBF24', 'rgba(251,191,36,0.06)'],
              [Calendar, 'Study Planner', 'Personalized study schedules with Pomodoro timer and progress tracking.', '#EC4899', 'rgba(236,72,153,0.06)'],
              [BarChart2, 'Analytics Dashboard', 'Detailed insights into your study habits, XP progress, and achievement badges.', '#F97316', 'rgba(249,115,22,0.06)'],
            ].map(([Ic2, title, desc, color, bg], i) => (
              <div key={title}
                onMouseEnter={e => { setHoveredCard(i); e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { setHoveredCard(null); e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.03)'; }}
                style={{ padding: isMobile ? '18px 16px' : '28px 24px', borderRadius: 18, background: L.surface, border: `1px solid ${hoveredCard === i ? `${color}30` : 'rgba(0,0,0,0.04)'}`, cursor: 'pointer', transition: 'all .4s cubic-bezier(.4,0,.2,1)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', animation: `card-enter-d${i + 1} .8s ease-out both` }}>
                <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 10 : 16, border: `1px solid ${color}15` }}>{Ic(Ic2, isMobile ? 18 : 22, color)}</div>
                <h3 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: L.text, marginBottom: isMobile ? 6 : 8 }}>{title}</h3>
                <p style={{ fontSize: isMobile ? 12 : 14, color: L.text2, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI TOOLS CARDS ── */}
      <section style={{ padding: '100px clamp(20px, 4vw, 64px)', background: L.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, background: 'rgba(50,201,113,0.08)', border: '1px solid rgba(50,201,113,0.12)', fontSize: 11, color: L.mint, fontWeight: 600, marginBottom: 16 }}>
              🤖 AI-Powered Tools
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', color: L.text, marginBottom: 14 }}>Intelligent study tools that adapt to you</h2>
            <p style={{ fontSize: isMobile ? 13 : 16, color: L.text2, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>Our AI analyzes your notes, understands your learning style, and creates personalized study materials.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 150 : 220}px, 1fr))`, gap: isMobile ? 10 : 16 }}>
            {[
              ['📝', 'Note Analysis', 'Extracts key concepts, definitions, and formulas from your uploaded notes', L.mint],
              ['🧪', 'Quiz Generator', 'Creates multiple-choice, short answer, and essay questions from your content', '#0EA5E9'],
              ['🗂️', 'Smart Flashcards', 'Generates review cards with spaced repetition scheduling', '#A78BFA'],
              ['📊', 'Study Analytics', 'Tracks your learning patterns, XP, streaks, and productivity metrics', '#F97316'],
              ['🎯', 'Exam Prep', 'Identifies weak areas and focuses your study sessions effectively', '#EC4899'],
              ['🔊', 'Voice Notes', 'Record lectures and convert to searchable, summarized text', '#FBBF24'],
              ['📐', 'Math / LaTeX', 'Full math notation support with KaTeX rendering for equations', '#6366F1'],
              ['📄', 'PDF Export', 'Export notes, summaries, and study guides as formatted PDFs', '#14B8A6'],
            ].map(([icon, title, desc, color], i) => (
              <div key={title} style={{ padding: isMobile ? '14px 12px' : '22px 18px', borderRadius: 16, background: L.surface, border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all .3s cubic-bezier(.4,0,.2,1)', boxShadow: '0 1px 6px rgba(0,0,0,0.02)', animation: `card-enter-d${Math.min(i + 1, 6)} .6s ease-out both` }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}15`; e.currentTarget.style.borderColor = `${color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)'; }}>
                <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 10 }}>{icon}</div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 6 }}>{title}</h4>
                <p style={{ fontSize: 12, color: L.text3, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px clamp(20px, 4vw, 64px)', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.1)', fontSize: 11, color: '#D97706', fontWeight: 600, marginBottom: 16 }}>
              ⭐ Student Reviews
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-1px', color: L.text, marginBottom: 12 }}>Loved by thousands of students</h2>
          </div>
          <div style={{ perspective: '800px' }}>
            <div key={testIdx} style={{ maxWidth: 600, margin: '0 auto', padding: isMobile ? '24px 20px' : '40px 48px', borderRadius: 22, background: L.surface, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 8px 40px rgba(0,0,0,0.04)', textAlign: 'center', animation: 'testy-slide .5s ease-out' }}>
              <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: isMobile ? 10 : 16 }}>{t.avatar}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
                {[...Array(t.stars)].map((_, i) => <span key={i} style={{ color: '#FBBF24', fontSize: isMobile ? 14 : 18 }}>★</span>)}
              </div>
              <p style={{ fontSize: isMobile ? 14 : 17, color: L.text2, lineHeight: 1.7, marginBottom: isMobile ? 16 : 24, fontStyle: 'italic' }}>"{t.text}"</p>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: L.text }}>{t.name}</div>
                <div style={{ fontSize: 12, color: L.text3, marginTop: 2 }}>{t.role}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setTestIdx(i)} style={{ width: i === testIdx ? 28 : 10, height: 10, borderRadius: 5, background: i === testIdx ? L.mint : 'rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', transition: 'all .3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STUDY ANALYTICS PREVIEW ── */}
      <section style={{ padding: '100px clamp(20px, 4vw, 64px)', background: L.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, background: 'rgba(50,201,113,0.08)', border: '1px solid rgba(50,201,113,0.12)', fontSize: 11, color: L.mint, fontWeight: 600, marginBottom: 16 }}>
                📈 Analytics
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-1px', color: L.text, marginBottom: 16, lineHeight: 1.15 }}>Track your progress with smart analytics</h2>
              <p style={{ fontSize: isMobile ? 13 : 16, color: L.text2, lineHeight: 1.7, marginBottom: isMobile ? 16 : 28 }}>See exactly where you stand. Our analytics dashboard shows XP earned, study streaks, quiz scores, subject breakdowns, and personalized recommendations.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 16 }}>
                {[
                  ['📊', 'Weekly XP Tracking', 'See your learning momentum over time'],
                  ['🎯', 'Subject Breakdown', 'Know exactly where to focus your effort'],
                  ['🏆', 'Achievement Badges', 'Stay motivated with 15 unlockable badges'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: isMobile ? 8 : 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: isMobile ? 18 : 22, lineHeight: 1 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 13, color: L.text3 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Analytics Preview Card */}
            <div style={{ perspective: '1000px' }}>
              <div style={{ padding: isMobile ? 18 : 28, borderRadius: isMobile ? 16 : 22, background: L.surface, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 16px 60px rgba(0,0,0,0.06)', transform: isMobile ? 'none' : 'perspective(800px) rotateY(-5deg)', transition: 'transform .4s', animation: 'float-card 8s ease-in-out infinite' }}
                onMouseEnter={e => !isMobile && (e.currentTarget.style.transform = 'perspective(800px) rotateY(0deg)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'perspective(800px) rotateY(-5deg)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: L.text }}>Study Analytics</h4>
                  <span style={{ fontSize: 11, color: L.mint, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'rgba(50,201,113,0.06)' }}>This Week</span>
                </div>
                {/* Mini stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    ['XP Earned', '1,240', L.mint, '+12%'],
                    ['Streak', '7 days', '#FBBF24', '🔥'],
                    ['Quizzes', '92%', '#0EA5E9', '+5%'],
                    ['Tasks', '18/22', '#A78BFA', '82%'],
                  ].map(([label, val, color, badge]) => (
                    <div key={label} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(240,253,244,0.6)', border: '1px solid rgba(50,201,113,0.06)' }}>
                      <div style={{ fontSize: 10, color: L.text3, marginBottom: 4 }}>{label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, color }}>{val}</span>
                        <span style={{ fontSize: 9, color: L.mint, fontWeight: 600 }}>{badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Progress bars */}
                {[
                  ['Mathematics', 82, L.mint],
                  ['Physics', 65, '#0EA5E9'],
                  ['Chemistry', 48, '#A78BFA'],
                  ['English', 91, '#FBBF24'],
                ].map(([subject, pct, color]) => (
                  <div key={subject} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: L.text2, fontWeight: 500 }}>{subject}</span>
                      <span style={{ color, fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.04)' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`, width: `${pct}%`, transition: 'width 1s ease', '--w': `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '100px clamp(20px, 4vw, 64px)', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '32px 20px' : '64px 48px', borderRadius: isMobile ? 20 : 28, background: `linear-gradient(135deg, ${L.bg}, rgba(50,201,113,0.06))`, border: '1px solid rgba(50,201,113,0.1)', boxShadow: '0 8px 40px rgba(50,201,113,0.08)' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-1.5px', color: L.text, marginBottom: isMobile ? 12 : 16, lineHeight: 1.1 }}>Ready to transform<br />your study?</h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color: L.text2, marginBottom: isMobile ? 20 : 32, lineHeight: 1.7 }}>Join thousands of students who are learning smarter, not harder.</p>
          <button onClick={onEnter} style={{ padding: isMobile ? '12px 28px' : '16px 44px', borderRadius: 14, background: 'linear-gradient(135deg, #32C971, #10B981)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: isMobile ? 14 : 17, fontWeight: 700, boxShadow: '0 6px 24px rgba(50,201,113,0.3)', transition: 'all .3s cubic-bezier(.4,0,.2,1)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(50,201,113,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(50,201,113,0.3)'; }}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px clamp(20px, 4vw, 64px) 32px', background: L.text, color: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr 1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 20 : 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #32C971, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(Brain, 16, '#fff')}</div>
                <span style={{ fontWeight: 800, fontSize: isMobile ? 13 : 16 }}>SmartStudy AI</span>
              </div>
              <p style={{ fontSize: isMobile ? 11 : 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: isMobile ? '100%' : 280 }}>AI-powered study platform that helps students learn smarter with personalized tutoring, quizzes, and analytics.</p>
            </div>
            {[
              ['Product', ['Features', 'API', 'Changelog']],
              ['Resources', ['Documentation', 'Blog', 'Tutorials', 'Community']],
              ['Company', ['About', 'Contact', 'Privacy', 'Terms']],
            ].map(([heading, links]) => (
              <div key={heading}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>{heading}</h4>
                {links.map(link => (
                  <div key={link} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10, cursor: "pointer", transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = "#32C971"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>{link}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 SmartStudy AI. All rights reserved.</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Made with 💚 for students everywhere</p>
          </div>
        </div>
      </footer>

      {/* ── DEMO WALKTHROUGH MODAL ── */}
      {showDemo && (
        <DemoWalkthrough isMobile={isMobile} onClose={() => setShowDemo(false)} onEnter={onEnter} />
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// DASHBOARD PAGES
// ═══════════════════════════════════════════════════════════════

function DashboardPage({ setPage, onUploadNotes, allNotes, onAddNote, stats, earnXP, userSettings }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Dynamic greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Dynamic progress (based on XP milestones: level = XP / 100, progress = XP % 100)
  const level = Math.floor(stats.xp / 100) + 1;
  const levelProgress = stats.xp % 100;
  const totalTasks = stats.tasksCompleted + (loadTasks().filter(t => !t.done).length);
  const completedTasks = stats.tasksCompleted;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleFile = useCallback(async (f) => {
    try {
      const isImage = f.type.startsWith('image/') || /\.(png|jpg|jpeg|bmp|tiff|webp)$/i.test(f.name);
      setUploading(true);
      setUploadProgress(isImage ? 'Scanning image with OCR...' : 'Reading file...');
      // Simulate progress stages for UX
      const p1 = setTimeout(() => setUploadProgress(isImage ? 'Recognizing text from image...' : 'Extracting text...'), 800);
      const p2 = setTimeout(() => setUploadProgress(isImage ? 'Processing recognized text...' : 'Analyzing content...'), 2000);
      const p3 = setTimeout(() => setUploadProgress('Almost ready...'), 3500);
      const ct = await extractText(f);
      clearTimeout(p1); clearTimeout(p2); clearTimeout(p3);
      if (!ct.trim()) throw new Error('Empty file');
      setUploadProgress('Done! Redirecting...');
      const noteData = { name: f.name, content: ct.trim(), wc: ct.trim().split(/\s+/).filter(Boolean).length };
      onUploadNotes(noteData);
      onAddNote({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: f.name, content: ct.trim(), words: noteData.wc, date: new Date().toISOString(), type: f.name.split('.').pop().toUpperCase() });
      earnXP(25, `📄 Uploaded notes: ${f.name}`);
      await new Promise(r => setTimeout(r, 400));
      setShowUpload(false);
      setUploading(false);
      setUploadProgress('');
      setPage('study-tools');
    } catch (e) {
      setUploading(false);
      setUploadProgress('');
      alert('Error: ' + e.message);
    }
  }, [onUploadNotes, onAddNote, earnXP, setPage]);

  return (
    <div style={{ animation: 'slide-up .4s ease', padding: 0 }}>
      {/* Welcome */}
      <div style={{ padding: isMobile ? 14 : 28, borderRadius: isMobile ? 14 : 20, background: `linear-gradient(135deg, ${T.surface}, ${T.surface2})`, border: `1px solid ${T.border}`, marginBottom: isMobile ? 12 : 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${T.indigo}12, transparent)`, filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: isMobile ? 12 : 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: isMobile ? 18 : 26, fontWeight: 800, letterSpacing: isMobile ? '-0.5px' : '-1px', marginBottom: 4 }}>{greeting}, {userSettings?.name || 'Student'} 👋</h1>
            <p style={{ color: T.text2, fontSize: isMobile ? 11 : 14, maxWidth: isMobile ? '100%' : 400, lineHeight: 1.6, fontStyle: 'italic' }}>{stats.xp === 0 ? 'Upload your first notes to start your learning journey!' : `"${q}"`}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 20 }}>
            <div style={{ textAlign: 'center' }}>
              <ProgressRing value={levelProgress} size={isMobile ? 48 : 72} stroke={5} color={T.indigo} />
              <p style={{ fontSize: isMobile ? 9 : 10, color: T.text3, marginTop: 4 }}>Lv.{level} · {levelProgress}%</p>
            </div>
            <div style={{ padding: isMobile ? '10px 14px' : '14px 18px', borderRadius: isMobile ? 10 : 14, background: `${T.orange}10`, border: `1px solid ${T.orange}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>{Ic(Flame, isMobile ? 14 : 16, T.orange)}<span style={{ fontSize: isMobile ? 15 : 20, fontWeight: 800 }}>{stats.streak}</span></div>
              <p style={{ fontSize: isMobile ? 9 : 10, color: T.text3 }}>Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 'auto-fit'}, minmax(${isMobile ? 0 : 170}px, ${isMobile ? '1fr' : '1fr'}))`, gap: isMobile ? 6 : 14, marginBottom: isMobile ? 12 : 24 }}>
        <StatCard icon={FileText} label="Notes Uploaded" value={allNotes.length} sub={allNotes.length > 0 ? `${allNotes.reduce((a, n) => a + (n.words || 0), 0).toLocaleString()} words` : 'Upload to start'} color={T.mint} trend={allNotes.length > 0 ? `+${allNotes.length}` : undefined} />
        <StatCard icon={Zap} label="Total XP" value={stats.xp} sub={`Level ${level}`} color={T.amber} trend={stats.xp > 0 ? `+${stats.xp}` : undefined} />
        <StatCard icon={CheckCircle2} label="Tasks Done" value={completedTasks} sub={`of ${totalTasks} total`} color={T.emerald} trend={completedTasks > 0 ? `+${completedTasks}` : undefined} />
        <StatCard icon={Target} label="Quiz Score" value={stats.quizScores.length > 0 ? `${Math.round(stats.quizScores.reduce((a,b) => a+b, 0) / stats.quizScores.length)}%` : '—'} sub={`${stats.quizzesTaken} quizzes`} color={T.violet} />
        <StatCard icon={MessageCircle} label="AI Queries" value={stats.aiQueries} sub="total questions" color={T.sky} />
        <StatCard icon={TrendingUp} label="Productivity" value={stats.xp > 0 ? Math.min(100, Math.round(stats.xp / 5)) : 0} sub="weekly index" color={T.rose} />
      </div>

{/* Upload + Quick Actions */}
      <div style={{ marginBottom: isMobile ? 12 : 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 8 : 14 }}>
          <h3 style={{ fontSize: isMobile ? 12 : 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>{Ic(Sparkles, isMobile ? 14 : 18, T.mint)} Quick Actions</h3>
        </div>
        {/* Upload card — full width on mobile */}
        <div onClick={() => setShowUpload(true)} style={{ padding: isMobile ? 14 : 28, borderRadius: isMobile ? 12 : 18, background: `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, cursor: 'pointer', transition: 'all .2s', boxShadow: `0 4px 20px ${T.mintGlow}`, display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 20, marginBottom: isMobile ? 6 : 0 }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: isMobile ? 36 : 56, height: isMobile ? 36 : 56, borderRadius: isMobile ? 10 : 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic(Upload, isMobile ? 18 : 26, '#fff')}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: isMobile ? 13 : 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Upload Notes</h4>
            <p style={{ fontSize: isMobile ? 9 : 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>Drop PDF, TXT, or DOCX</p>
          </div>
          {!isMobile && <div style={{ marginLeft: 'auto' }}>{Ic(ArrowRight, 24, 'rgba(255,255,255,0.6)')}</div>}
        </div>
        {/* Action cards — side by side on all screens */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 6 : 12, marginTop: isMobile ? 0 : 12 }}>
          <div onClick={() => setPage('ai-chat')} style={{ padding: isMobile ? 12 : 24, borderRadius: isMobile ? 12 : 18, background: '#FFFFFF', border: `1px solid ${T.border}`, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${T.indigo}15`; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
            <div style={{ width: isMobile ? 30 : 44, height: isMobile ? 30 : 44, borderRadius: isMobile ? 9 : 14, background: T.indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 6 : 12 }}>{Ic(MessageCircle, isMobile ? 15 : 22, T.indigo)}</div>
            <h4 style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600, marginBottom: 2, color: T.text }}>AI Chat</h4>
            <p style={{ fontSize: isMobile ? 9 : 10, color: T.text3 }}>Ask anything</p>
          </div>
          <div onClick={() => setPage('planner')} style={{ padding: isMobile ? 12 : 24, borderRadius: isMobile ? 12 : 18, background: '#FFFFFF', border: `1px solid ${T.border}`, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${T.orange}15`; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
            <div style={{ width: isMobile ? 30 : 44, height: isMobile ? 30 : 44, borderRadius: isMobile ? 9 : 14, background: T.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 6 : 12 }}>{Ic(Calendar, isMobile ? 15 : 22, T.orange)}</div>
            <h4 style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600, marginBottom: 2, color: T.text }}>Planner</h4>
            <p style={{ fontSize: isMobile ? 9 : 10, color: T.text3 }}>Schedule study</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? 6 : 16, marginBottom: isMobile ? 12 : 24 }}>
        {/* Weekly Chart */}
        <div style={{ padding: isMobile ? 12 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 8 : 20 }}>
            <h3 style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600 }}>{Ic(Activity, 15, T.indigo)} Weekly XP</h3>
            <span style={{ fontSize: 10, color: T.text3 }}>This week</span>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 140 : 200}>
            <AreaChart data={['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({ day, xp: stats.weeklyXP[i] || 0 }))}>
              <defs><linearGradient id="gIndigo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.indigo} stopOpacity={0.3} /><stop offset="95%" stopColor={T.indigo} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: T.text3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.text3 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, color: T.text }} labelStyle={{ color: T.text }} />
              <Area type="monotone" dataKey="xp" stroke={T.indigo} strokeWidth={2} fill="url(#gIndigo)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ padding: isMobile ? 16 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, marginBottom: isMobile ? 12 : 16 }}>{Ic(PieChartIcon, 15, T.purple)} Study Breakdown</h3>
          {(() => {
            const pieValues = [
              { name: 'Notes', value: Math.max(stats.notesUploaded, 0), color: T.mint },
              { name: 'AI Queries', value: Math.max(stats.aiQueries, 0), color: T.sky },
              { name: 'Tasks', value: Math.max(stats.tasksCompleted, 0), color: T.violet },
              { name: 'Quizzes', value: Math.max(stats.quizzesTaken, 0), color: T.amber },
            ].filter(d => d.value > 0);
            const emptyPie = pieValues.length === 0;
            const displayData = emptyPie ? [{ name: 'No data', value: 1, color: T.border }] : pieValues;
            return (
              <>
<ResponsiveContainer width="100%" height={isMobile ? 120 : 160}>
	                  <PieChart>
	                    <Pie data={displayData} cx="50%" cy="50%" innerRadius={isMobile ? 30 : 40} outerRadius={isMobile ? 48 : 60} paddingAngle={3} dataKey="value" stroke="none">
                      {displayData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, color: T.text }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {emptyPie ? <span style={{ fontSize: 10, color: T.text3 }}>Start studying to see breakdown</span> :
                    pieValues.map(d => <span key={d.name} style={{ fontSize: 10, color: T.text3, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />{d.name} ({d.value})</span>)}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Bottom section: Notes + Exams side by side on mobile, Activity below */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: isMobile ? 6 : 16, marginBottom: isMobile ? 6 : 0 }}>
        {/* Notes by Subject */}
        <div style={{ padding: isMobile ? 10 : 22, borderRadius: isMobile ? 12 : 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: isMobile ? 10 : 14, fontWeight: 600, marginBottom: isMobile ? 6 : 16 }}>{Ic(Award, isMobile ? 10 : 15, T.green)} {isMobile ? 'Subjects' : 'Notes by Subject'}</h3>
          {(() => {
            const subjectMap = {};
            allNotes.forEach(n => { const s = n.subject || 'General'; subjectMap[s] = (subjectMap[s] || 0) + 1; });
            const entries = Object.entries(subjectMap).sort((a,b) => b[1] - a[1]);
            const maxVal = entries[0]?.[1] || 1;
            const subjectColors = [T.mint, T.sky, T.violet, T.amber, T.rose, T.indigo, T.green];
            if (entries.length === 0) return <div style={{ textAlign: 'center', padding: isMobile ? '6px 0' : '20px 0', color: T.text3, fontSize: isMobile ? 9 : 12 }}><div style={{ fontSize: isMobile ? 14 : 24, marginBottom: 4 }}>📊</div>{isMobile ? 'No data' : 'No notes uploaded yet'}</div>;
            return entries.slice(0, isMobile ? 3 : 10).map(([name, count], i) => (
              <div key={name} style={{ marginBottom: isMobile ? 6 : 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isMobile ? 3 : 5 }}>
                  <span style={{ fontSize: isMobile ? 9 : 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 60 : '100%' }}>{name}</span>
                  <span style={{ fontSize: isMobile ? 9 : 12, fontWeight: 600, color: subjectColors[i % subjectColors.length], flexShrink: 0 }}>{count}</span>
                </div>
                <div style={{ height: isMobile ? 3 : 5, borderRadius: 3, background: T.surface3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: subjectColors[i % subjectColors.length], width: `${(count / maxVal) * 100}%`, transition: 'width 1s ease' }} />
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Exam Countdown */}
        <div style={{ padding: isMobile ? 10 : 22, borderRadius: isMobile ? 12 : 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: isMobile ? 10 : 14, fontWeight: 600, marginBottom: isMobile ? 6 : 16 }}>{Ic(Goal, isMobile ? 10 : 15, T.red)} {isMobile ? 'Exams' : 'Exam Countdown'}</h3>
          {(() => {
            const exams = JSON.parse(localStorage.getItem('smartstudy_exams') || '[]');
            if (exams.length === 0) return (
              <div style={{ textAlign: 'center', padding: isMobile ? '4px 0' : '16px 0' }}>
                <p style={{ fontSize: isMobile ? 9 : 12, color: T.text3, marginBottom: isMobile ? 4 : 10 }}>{isMobile ? 'No exams' : 'Add exam dates'}</p>
                <button onClick={() => {
                  const name = prompt('Exam name:');
                  if (!name) return;
                  const date = prompt('Exam date (YYYY-MM-DD):');
                  if (!date) return;
                  const updated = [...exams, { name, date, id: Date.now() }];
                  localStorage.setItem('smartstudy_exams', JSON.stringify(updated));
                  window.location.reload();
                }} style={{ padding: isMobile ? '4px 8px' : '6px 14px', borderRadius: 8, background: `${T.mint}10`, border: `1px solid ${T.mint}30`, color: T.mint, cursor: 'pointer', fontSize: isMobile ? 9 : 12, fontWeight: 600 }}>+ Add</button>
              </div>
            );
            return <div>{exams.slice(0, isMobile ? 3 : 10).map((ex, i) => {
              const days = Math.ceil((new Date(ex.date) - new Date()) / 86400000);
              const urgent = days <= 7;
              return (
                <div key={ex.id || i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 12, padding: isMobile ? '5px 6px' : '10px 12px', borderRadius: isMobile ? 6 : 10, background: urgent ? `${T.red}08` : T.bg2, marginBottom: isMobile ? 4 : 8, border: urgent ? `1px solid ${T.red}20` : 'none' }}>
                  <div style={{ width: isMobile ? 24 : 40, height: isMobile ? 24 : 40, borderRadius: isMobile ? 6 : 10, background: urgent ? `${T.red}12` : `${T.mint}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: isMobile ? 10 : 16, fontWeight: 800, color: urgent ? T.red : T.mint }}>{days > 0 ? days : '!'}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: isMobile ? 9 : 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</p>
                    <p style={{ fontSize: isMobile ? 8 : 10, color: T.text3 }}>{days > 0 ? `${days}d left` : days === 0 ? 'Today!' : 'Passed'}</p>
                  </div>
                </div>
              );
            })}
            <button onClick={() => {
              const name = prompt('Exam name:');
              if (!name) return;
              const date = prompt('Exam date (YYYY-MM-DD):');
              if (!date) return;
              const updated = [...exams, { name, date, id: Date.now() }];
              localStorage.setItem('smartstudy_exams', JSON.stringify(updated));
              window.location.reload();
            }} style={{ width: '100%', padding: isMobile ? '4px 8px' : '8px 14px', borderRadius: 8, background: `${T.mint}10`, border: `1px solid ${T.mint}30`, color: T.mint, cursor: 'pointer', fontSize: isMobile ? 9 : 12, fontWeight: 600, marginTop: isMobile ? 4 : 8 }}>+ Add</button>
            </div>;
          })()}
        </div>
      </div>

      {/* Recent Activity — full width row below */}
      <div style={{ padding: isMobile ? 10 : 22, borderRadius: isMobile ? 12 : 16, background: T.surface, border: `1px solid ${T.border}`, marginTop: isMobile ? 6 : 16, marginBottom: isMobile ? 12 : 24 }}>
        <h3 style={{ fontSize: isMobile ? 10 : 14, fontWeight: 600, marginBottom: isMobile ? 6 : 16 }}>{Ic(Activity, isMobile ? 10 : 15, T.orange)} {isMobile ? 'Activity' : 'Recent Activity'}</h3>
        {(() => {
          const acts = loadActivities().slice(0, isMobile ? 3 : 5);
          if (acts.length === 0) return <div style={{ textAlign: 'center', padding: isMobile ? '6px 0' : '20px 0', color: T.text3, fontSize: isMobile ? 9 : 12 }}><div style={{ fontSize: isMobile ? 14 : 24, marginBottom: 4 }}>📝</div>{isMobile ? 'No activity' : 'No activity yet'}</div>;
          return acts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, padding: isMobile ? '5px 6px' : '10px 12px', borderRadius: isMobile ? 6 : 10, background: T.bg2, marginBottom: isMobile ? 3 : 8 }}>
              <div style={{ width: isMobile ? 24 : 36, height: isMobile ? 24 : 36, borderRadius: isMobile ? 6 : 10, background: `${a.color || T.mint}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {a.xp ? <span style={{ fontSize: isMobile ? 8 : 11, fontWeight: 700, color: a.color || T.mint }}>+{a.xp}</span> : Ic(Zap, isMobile ? 10 : 16, a.color || T.mint)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: isMobile ? 9 : 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.text}</p>
                <p style={{ fontSize: isMobile ? 8 : 10, color: T.text3 }}>{timeAgo(a.time)}</p>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Achievements */}
      <div style={{ padding: isMobile ? 12 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, marginBottom: isMobile ? 12 : 24, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 8 : 16 }}>
          <h3 style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>{Ic(Trophy, isMobile ? 12 : 15, T.amber)} Achievements</h3>
          <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, color: T.amber }}>{ACHIEVEMENTS.filter(a => a.check(stats)).length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 4 : 10, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {ACHIEVEMENTS.map(a => {
            const done = a.check(stats);
            return (
              <div key={a.id} title={a.desc} style={{ minWidth: isMobile ? 48 : 80, padding: isMobile ? '6px 4px' : '12px 10px', borderRadius: isMobile ? 6 : 12, background: done ? `${T.amber}08` : T.bg2, border: done ? `1.5px solid ${T.amber}30` : `1px solid ${T.border}`, textAlign: 'center', opacity: done ? 1 : 0.45, transition: 'all .2s', flexShrink: 0 }}>
                <div style={{ fontSize: isMobile ? 14 : 24, marginBottom: 1, filter: done ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                <div style={{ fontSize: isMobile ? 6 : 9, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? 40 : 60 }}>{a.title}</div>
                {done && <div style={{ fontSize: 6, color: T.amber, marginTop: 1 }}>✅</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} onClick={e => { if (!uploading && e.target === e.currentTarget) setShowUpload(false); }}>
          <div style={{ width: '100%', maxWidth: 460, margin: isMobile ? '0 12px' : '0 24px', borderRadius: 20, background: '#FFFFFF', border: `1px solid ${T.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.12)', animation: 'slide-up .3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '14px 16px' : '20px 24px', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: uploading ? `${T.mint}15` : T.mintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {uploading
                    ? <div style={{ width: 20, height: 20, border: `3px solid ${T.mint}20`, borderTopColor: T.mint, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    : Ic(Upload, 18, T.mint)
                  }
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: T.text }}>{uploading ? 'Uploading...' : 'Upload Notes'}</h3>
                  {uploading && <p style={{ fontSize: 11, color: T.mint, marginTop: 2, fontWeight: 500 }}>{uploadProgress}</p>}
                </div>
              </div>
              {!uploading && <button onClick={() => setShowUpload(false)} style={{ width: 32, height: 32, borderRadius: 8, background: T.surface2, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(X, 16, T.text3)}</button>}
            </div>
<div style={{ padding: isMobile ? 16 : 24 }}>
	              {uploading ? (
                /* Premium Loading State */
                <div style={{ textAlign: 'center', padding: '20px 20px 10px' }}>
                  {/* Animated file icon */}
                  <div style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${T.mint}12, ${T.emerald}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `1px solid ${T.mint}18`, animation: 'float 2.5s ease-in-out infinite' }}>
                    <span style={{ fontSize: isMobile ? 24 : 32 }}>📄</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: T.bg2, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: `linear-gradient(90deg, ${T.mint}, ${T.emerald})`,
                      animation: 'progress-fill 3s ease-in-out forwards',
                    }} />
                  </div>
                  <p style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Processing your notes</p>
                  <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.6 }}>
                    {uploadProgress === 'Scanning image with OCR...' && '📸 Scanning your image with AI text recognition...'}
                    {uploadProgress === 'Recognizing text from image...' && '🔍 Reading characters from the image...'}
                    {uploadProgress === 'Processing recognized text...' && 'Understanding the text structure...'}
                    {uploadProgress === 'Reading file...' && 'Opening your file and reading contents...'}
                    {uploadProgress === 'Extracting text...' && 'Pulling out all the text from your document...'}
                    {uploadProgress === 'Analyzing content...' && 'Understanding the structure and topics...'}
                    {uploadProgress === 'Almost ready...' && 'Finalizing and preparing for study tools...'}
                    {uploadProgress === 'Done! Redirecting...' && '✅ All set! Taking you to Study Tools...'}
                  </p>
                  {/* Fun tips while waiting */}
                  {uploadProgress !== 'Done! Redirecting...' && (
                    <div style={{ marginTop: 20, padding: '10px 16px', borderRadius: 12, background: `${T.mint}08`, border: `1px solid ${T.mint}15`, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.text2 }}>
                      <span style={{ fontSize: isMobile ? 13 : 16 }}>💡</span>
                      <span>Did you know? Teaching others helps you remember 90% of what you learn!</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Normal Upload Drop Zone */
                <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => { const f = document.createElement('input'); f.type = 'file'; f.accept = '.pdf,.txt,.docx,.png,.jpg,.jpeg,.bmp,.webp'; f.onchange = e => { if (e.target.files[0]) handleFile(e.target.files[0]); }; f.click(); }}
                  style={{ padding: isMobile ? '24px 16px' : '44px 24px', borderRadius: 16, background: dragOver ? T.mintSoft : T.bg2, border: `2px dashed ${dragOver ? T.mint : T.borderLight}`, textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ width: isMobile ? 40 : 52, height: isMobile ? 40 : 52, borderRadius: 16, background: dragOver ? T.mintGlow : T.mintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{Ic(Upload, isMobile ? 20 : 24, dragOver ? T.mint : T.text3)}</div>
                  <p style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: dragOver ? T.mint : T.text, marginBottom: 4 }}>{dragOver ? 'Drop your file!' : 'Drag & drop or click to upload'}</p>
                  <p style={{ fontSize: 12, color: T.text3 }}>Supports PDF, TXT, DOCX, Images (OCR) 📸</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STUDY TOOLS PAGE — Upload + All AI tools with notes context
// ═══════════════════════════════════════════════════════════════
function StudyToolsPage({ notes, onClearNotes, onUploadNotes, onAddNote, stats, earnXP, trackAIQuery, language }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [mindMapData, setMindMapData] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const chatRef = useRef();

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);

  const handleFileUpload = async (f) => {
    try {
      const isImage = f.type.startsWith('image/') || /\.(png|jpg|jpeg|bmp|tiff|webp)$/i.test(f.name);
      setUploading(true);
      setUploadProgress(isImage ? 'Scanning image with OCR...' : 'Reading file...');
      const p1 = setTimeout(() => setUploadProgress(isImage ? 'Recognizing text...' : 'Extracting text...'), 800);
      const p2 = setTimeout(() => setUploadProgress('Processing content...'), 2000);
      const p3 = setTimeout(() => setUploadProgress('Almost ready...'), 3500);
      const ct = await extractText(f);
      clearTimeout(p1); clearTimeout(p2); clearTimeout(p3);
      if (!ct.trim()) throw new Error('Could not extract text from this file');
      setUploadProgress('Done!');
      const noteData = { name: f.name, content: ct.trim(), wc: ct.trim().split(/\s+/).filter(Boolean).length };
      onUploadNotes(noteData);
      if (onAddNote) onAddNote({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: f.name, content: ct.trim(), words: noteData.wc, date: new Date().toISOString(), type: f.name.split('.').pop().toUpperCase() });
      earnXP(25, `📄 Uploaded notes: ${f.name}`);
      await new Promise(r => setTimeout(r, 400));
      setUploading(false);
      setUploadProgress('');
    } catch (e) {
      setUploading(false);
      setUploadProgress('');
      setMessages(p => [...p, { role: 'assistant', content: `❌ Upload error: ${e.message}. Try a different file.` }]);
    }
  };

  const sendTool = async (id) => {
    if (!notes || loading) return;
    const t = STUDY_TOOLS.find(x => x.id === id);
    if (!t?.prompt) return;
    setActiveTool(id);
    setMindMapData(null);
    setFlashcards([]);
    setMessages(p => [...p, { role: 'user', content: t.prompt }]); setLoading(true);
    trackAIQuery();
    try {
      const ai = await callAI(PROMPTS[id](notes.content), [], language);

      // Special handling for mind map
      if (id === 'mindmap') {
        const m = ai.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            setMindMapData(JSON.parse(m[0]));
            setMessages(p => [...p, { role: 'assistant', content: '✅ Mind map generated! See the visual map above.', type: 'mindmap' }]);
          } catch {
            setMessages(p => [...p, { role: 'assistant', content: ai }]);
          }
        } else {
          setMessages(p => [...p, { role: 'assistant', content: ai }]);
        }
      }
      // Special handling for flashcards
      else if (id === 'flashcards') {
        const m = ai.match(/\[[\s\S]*\]/);
        if (m) {
          try {
            const parsed = JSON.parse(m[0]);
            setFlashcards(parsed);
            setFcIndex(0);
            setFcFlipped(false);
            setMessages(p => [...p, { role: 'assistant', content: `✅ ${parsed.length} flashcards generated! See the cards above.`, type: 'flashcards' }]);
          } catch {
            setMessages(p => [...p, { role: 'assistant', content: ai }]);
          }
        } else {
          setMessages(p => [...p, { role: 'assistant', content: ai }]);
        }
      }
      else {
        setMessages(p => [...p, { role: 'assistant', content: ai }]);
      }
      earnXP(15, `🧠 Used ${t.label} on "${notes.name}"`);
    } catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const send = async () => {
    const t = input.trim(); if (!t || loading) return;
    const nm = [...messages, { role: 'user', content: t }]; setMessages(nm); setInput(''); setLoading(true);
    trackAIQuery();
    try {
      const sys = notes ? PROMPTS.ask(notes.content) : 'You are SmartStudy AI, a helpful study assistant.';
      const ai = await callAI(sys, nm.map(m => ({ role: m.role, content: m.content })), language);
      setMessages(p => [...p, { role: 'assistant', content: ai }]);
      earnXP(5, `💬 Asked: "${t.slice(0, 30)}..."`);
    } catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.role === 'user' ? 'You' : 'AI'}]\n${m.content}\n`).join('\n---\n\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = 'smartstudy-tools.txt'; a.click();
  };
  const exportPDF = () => {
    const text = messages.map(m => m.content).join('\n\n---\n\n');
    exportToPDF('Study_Tools', text);
  };

  const toolDescs = {
    explain: 'Deep explanation with examples & tricks',
    quiz: 'Full quiz — MCQ, T/F, match, fill-in',
    keypoints: 'Extract the main ideas',
    summarize: 'Short & sweet overview',
    mindmap: 'Visual topic mind map',
    flashcards: 'Spaced repetition cards',
    ask: 'Ask anything about your notes',
  };

  return (
    <div style={{ display: 'flex', height: isMobile ? 'calc(100vh - 56px - 56px)' : '100%', animation: 'slide-up .4s ease' }}>
      {/* Left: Premium Tools Panel */}
      {!isMobile && <div style={{ width: 310, background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)', borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Upload Notes Button */}
        <div style={{ padding: '14px 16px 8px' }}>
          <input id="study-sidebar-upload" type="file" accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.bmp,.tiff,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
          {uploading ? (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: `${T.mint}08`, border: `1px solid ${T.mint}25`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, border: `2px solid ${T.mint}30`, borderTopColor: T.mint, borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.mint }}>{uploadProgress}</div>
              </div>
            </div>
          ) : (
            <button onClick={() => document.getElementById('study-sidebar-upload').click()}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, background: notes ? T.surface : `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, border: notes ? `1px solid ${T.border}` : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: notes ? T.text2 : '#fff', transition: 'all .25s', boxShadow: notes ? 'none' : `0 4px 16px ${T.mintGlow}` }}
              onMouseEnter={e => { if (!notes) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${T.mintGlow}`; } else { e.currentTarget.style.borderColor = T.mint; e.currentTarget.style.color = T.mint; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = notes ? 'none' : `0 4px 16px ${T.mintGlow}`; if (notes) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; } }}>
              {Ic(Upload, 15)} {notes ? 'Replace Notes' : 'Upload Notes'}
            </button>
          )}
        </div>

        {/* Notes Badge — premium card */}
        {notes && (
          <div style={{ padding: isMobile ? '10px 10px 6px' : '14px 16px 10px' }}>
            <div style={{ padding: isMobile ? '10px 10px' : '12px 14px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(50,201,113,0.08), rgba(16,185,129,0.12))', border: `1px solid rgba(16,185,129,0.18)`, display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, boxShadow: '0 2px 8px rgba(50,201,113,0.08)' }}>
              <div style={{ width: isMobile ? 30 : 38, height: isMobile ? 30 : 38, borderRadius: 12, background: 'rgba(50,201,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic(FileText, isMobile ? 15 : 18, T.green)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: T.green, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notes.name}</p>
                <p style={{ fontSize: 10, color: T.text3 }}>{notes.wc?.toLocaleString()} words loaded</p>
              </div>
              <button onClick={onClearNotes} style={{ background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6 }}>{Ic(X, 13, T.text3)}</button>
            </div>
          </div>
        )}

        {/* Tools List — premium cards */}
        <div style={{ flex: 1, padding: '6px 16px 16px', overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 14, paddingLeft: 2 }}>✨ Study Tools</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STUDY_TOOLS.map(t => {
              const active = activeTool === t.id;
              return (
                <button key={t.id} onClick={() => sendTool(t.id)}
	                  style={{
	                    padding: isMobile ? '10px 10px' : '12px 14px', borderRadius: 14, fontSize: isMobile ? 11 : 13,
	                    fontWeight: active ? 700 : 500,
	                    background: active
	      ? `linear-gradient(135deg, ${t.color}10, ${t.color}08)`
	      : '#FFFFFF',
	                    color: active ? t.color : T.text2,
	                    border: active ? `1.5px solid ${t.color}35` : `1px solid ${T.border}`,
	                    cursor: loading ? 'not-allowed' : 'pointer',
	                    display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, textAlign: 'left',
                    transition: 'all .2s ease',
                    boxShadow: active ? `0 2px 12px ${t.color}12` : '0 1px 3px rgba(0,0,0,0.03)',
                  }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13,
                    background: active ? `${t.color}16` : `${t.color}08`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all .2s',
                  }}>{Ic(t.icon, 20, active ? t.color : t.color + '90')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: active ? t.color : T.text, marginBottom: 1 }}>{t.label}</div>
                    <div style={{ fontSize: 10.5, color: T.text3, lineHeight: 1.3 }}>{toolDescs[t.id]}</div>
                  </div>
                  {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Export + New Chat */}
        <div style={{ padding: isMobile ? '8px 8px 10px' : '10px 16px 14px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: isMobile ? 4 : 8, overflowX: 'auto' }}>
          {messages.length > 0 && (
            <>
              <button onClick={() => { setMessages([]); setActiveTool(null); }}
                style={{ flex: 1, padding: 10, borderRadius: 12, fontSize: 12, background: T.surface2, border: `1px solid ${T.border}`, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                {Ic(RotateCcw, 13)} New
              </button>
              <button onClick={exportChat}
                style={{ flex: 1, padding: 10, borderRadius: 12, fontSize: 12, background: T.surface2, border: `1px solid ${T.border}`, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                {Ic(Download, 13)} TXT
              </button>
              <button onClick={exportPDF}
                style={{ flex: 1, padding: 10, borderRadius: 12, fontSize: 12, background: T.surface2, border: `1px solid ${T.border}`, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                {Ic(FileDown, 13)} PDF
              </button>
            </>
          )}
        </div>
      </div>}

      {/* Right: Premium Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: T.bg }}>
        {/* Mobile tool selector */}
        {isMobile && <div style={{ display: 'flex', gap: 4, padding: '8px 8px 0', overflowX: 'auto', flexShrink: 0, alignItems: 'center' }}>
          <input id="study-mobile-upload" type="file" accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.bmp,.tiff,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
          {uploading ? (
            <div style={{ padding: '6px 12px', borderRadius: 8, background: `${T.mint}10`, border: `1px solid ${T.mint}30`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: T.mint, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ width: 12, height: 12, border: `2px solid ${T.mint}30`, borderTopColor: T.mint, borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} />
              {uploadProgress}
            </div>
          ) : (
            <button onClick={() => document.getElementById('study-mobile-upload').click()}
              style={{ padding: '6px 10px', borderRadius: 8, border: `1.5px solid ${T.mint}`, background: `${T.mint}10`, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: T.mint, whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              {Ic(Upload, 12)} {notes ? 'Replace' : 'Upload'}
            </button>
          )}
          {STUDY_TOOLS.map(t => (
            <button key={t.id} onClick={() => { setActiveTool(t.id); setMessages([]); setInput(''); }}
              style={{ padding: '6px 10px', borderRadius: 8, border: activeTool === t.id ? `1.5px solid ${t.color}` : `1px solid ${T.border}`, background: activeTool === t.id ? `${t.color}10` : T.surface, cursor: 'pointer', fontSize: 11, fontWeight: activeTool === t.id ? 700 : 400, color: activeTool === t.id ? t.color : T.text2, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {t.label}
            </button>
          ))}
        </div>}
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: isMobile ? '40px 12px 20px' : '70px 20px 40px' }}>
                <div style={{ width: isMobile ? 56 : 80, height: isMobile ? 56 : 80, borderRadius: 24, background: `linear-gradient(135deg, ${T.mint}18, ${T.emerald}12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 8px 32px ${T.mintGlow}`, border: `1px solid ${T.mint}20` }}>{Ic(Brain, isMobile ? 24 : 36, T.mint)}</div>
                <h2 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, marginBottom: 8, color: T.text, letterSpacing: '-0.5px' }}>Study Tools</h2>
                <p style={{ fontSize: isMobile ? 12 : 14, color: T.text3, maxWidth: 360, margin: '0 auto', lineHeight: 1.7 }}>Pick a tool to transform your notes into explanations, quizzes, flashcards & more.</p>
                {!notes && (
                  <div style={{ marginTop: isMobile ? 14 : 24 }}>
                    <input id="study-upload-input" type="file" accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.bmp,.tiff,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
                    <button onClick={() => document.getElementById('study-upload-input').click()}
                      style={{ padding: isMobile ? '10px 20px' : '12px 28px', borderRadius: 14, background: `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: isMobile ? 12 : 14, fontWeight: 700, color: '#fff', boxShadow: `0 4px 20px ${T.mintGlow}`, transition: 'all .3s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${T.mintGlow}`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 20px ${T.mintGlow}`; }}>
                      {Ic(Upload, 16, '#fff')} Upload Notes
                    </button>
                    <p style={{ fontSize: 10, color: T.text3, marginTop: 10 }}>PDF, DOCX, TXT, or images with OCR</p>
                  </div>
                )}
                {notes && !messages.length && (
                  <div style={{ marginTop: isMobile ? 14 : 24 }}>
                    <input id="study-upload-replace" type="file" accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.bmp,.tiff,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
                    <button onClick={() => document.getElementById('study-upload-replace').click()}
                      style={{ padding: '8px 16px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.text2, fontWeight: 600, transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.mint; e.currentTarget.style.color = T.mint; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; }}>
                      {Ic(Upload, 13)} Replace notes file
                    </button>
                  </div>
                )}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: isMobile ? 8 : 14, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: isMobile ? 30 : 38, height: isMobile ? 30 : 38, borderRadius: isMobile ? 10 : 13, background: `linear-gradient(135deg, ${T.mint}14, ${T.emerald}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4, border: `1px solid ${T.mint}18` }}>{Ic(Bot, isMobile ? 14 : 18, T.mint)}</div>
                )}
                <div style={{
                  maxWidth: m.role === 'user' ? (isMobile ? '85%' : '68%') : (isMobile ? '95%' : '82%'), padding: isMobile ? '12px 14px' : '15px 18px',
                  borderRadius: isMobile ? 14 : 20, fontSize: isMobile ? 13 : 14, lineHeight: 1.8, wordBreak: 'break-word',
                  background: m.role === 'user' ? `linear-gradient(135deg, ${T.mint}, ${T.emerald})` : '#FFFFFF',
                  color: m.role === 'user' ? '#fff' : T.text,
                  border: m.role === 'user' ? 'none' : `1px solid ${T.border}`,
                  boxShadow: m.role === 'user' ? `0 4px 16px ${T.mintGlow}` : '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
                  borderTopRightRadius: m.role === 'user' ? 6 : 20,
                  borderTopLeftRadius: m.role === 'assistant' ? 6 : 20,
                }}>{m.role === 'assistant' ? renderMD(m.content) : m.content}</div>
                {m.role === 'user' && (
                  <div style={{ width: 38, height: 38, borderRadius: 13, background: `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4, color: '#fff' }}>{Ic(User, 16, '#fff')}</div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: isMobile ? 8 : 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 13, background: `linear-gradient(135deg, ${T.mint}14, ${T.emerald}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.mint}18` }}>{Ic(Bot, 18, T.mint)}</div>
                <div style={{ padding: isMobile ? '10px 14px' : '15px 24px', borderRadius: 20, borderTopLeftRadius: 6, background: '#FFFFFF', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T.mint, animation: 'dot 1.2s infinite', animationDelay: `${i * 0.15}s` }} />)}
                  <span style={{ fontSize: 12, color: T.text3, marginLeft: 4 }}>Thinking...</span>
                </div>
              </div>
            )}

            {/* Mind Map Renderer */}
            {mindMapData && (() => {
              const renderNode = (node, x, y, angle, radius, level = 0) => {
                if (!node) return null;
                const colors = [T.mint, T.blue, T.violet, T.amber, T.rose, T.orange, T.pink];
                const color = colors[level % colors.length];
                const childCount = node.children?.length || 0;
                const fontSize = Math.max(11, 15 - level * 2);
                const pad = Math.max(8, 14 - level * 3);
                return (
                  <g key={`${node.title}-${x}-${y}`}>
                    {level > 0 && <line x1={x - (radius * 0.4 * Math.cos(angle))} y1={y - (radius * 0.4 * Math.sin(angle))} x2={x} y2={y} stroke={color} strokeWidth={Math.max(1, 3 - level)} strokeOpacity={0.4} />}
                    <rect x={x - node.title.length * fontSize * 0.32} y={y - fontSize - pad / 2} width={node.title.length * fontSize * 0.64 + pad} height={fontSize + pad} rx={level === 0 ? 14 : 10} fill={level === 0 ? color : `${color}15`} stroke={color} strokeWidth={level === 0 ? 0 : 1} />
                    <text x={x} y={y + fontSize * 0.35} textAnchor="middle" fontSize={fontSize} fontWeight={level < 2 ? 700 : 500} fill={level === 0 ? '#fff' : T.text} fontFamily="system-ui">{node.title}</text>
                    {node.children?.map((child, i) => {
                      const a = (2 * Math.PI * i) / childCount + angle;
                      const r = radius * (level === 0 ? 1 : 0.7);
                      const cx = x + r * Math.cos(a);
                      const cy = y + r * Math.sin(a);
                      return renderNode(child, cx, cy, a, r * 0.65, level + 1);
                    })}
                  </g>
                );
              };
              return (
                <div style={{ borderRadius: 18, background: '#FFFFFF', border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ padding: isMobile ? '8px 12px' : '12px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>🗺️ {mindMapData.title}</span>
                    <button onClick={() => exportToPDF('MindMap_' + mindMapData.title, JSON.stringify(mindMapData, null, 2))} style={{ padding: '5px 12px', borderRadius: 8, background: T.surface2, border: `1px solid ${T.border}`, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{Ic(FileDown, 12)} PDF</button>
                  </div>
                  <svg width="100%" viewBox="-350 -300 700 600" style={{ display: 'block', minHeight: 360 }}>
                    {renderNode(mindMapData, 0, 0, 0, 160)}
                  </svg>
                </div>
              );
            })()}

            {/* Flashcard Renderer */}
            {flashcards.length > 0 && (() => {
              const fc = flashcards[fcIndex];
              if (!fc) return null;
              return (
                <div style={{ borderRadius: 18, background: '#FFFFFF', border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ padding: isMobile ? '8px 12px' : '12px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>🧠 Flashcard {fcIndex + 1} / {flashcards.length}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => exportToPDF('Flashcards', flashcards.map((c, i) => `Q${i+1}: ${c.q}\nA${i+1}: ${c.a}\n`).join('\n'))} style={{ padding: '5px 12px', borderRadius: 8, background: T.surface2, border: `1px solid ${T.border}`, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>{Ic(FileDown, 12)} PDF</button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: T.bg2 }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${T.mint}, ${T.emerald})`, width: `${((fcIndex + 1) / flashcards.length) * 100}%`, transition: 'width .3s' }} />
                  </div>
                  {/* Card */}
<div onClick={() => setFcFlipped(!fcFlipped)} style={{ minHeight: isMobile ? 140 : 180, padding: isMobile ? 20 : 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center' }}>
	                    <p style={{ fontSize: 10, color: T.text3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{fcFlipped ? '✅ Answer' : '🤔 Question'}</p>
	                    <p style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, lineHeight: 1.6 }}>{fcFlipped ? fc.a : fc.q}</p>
                    {!fcFlipped && <p style={{ fontSize: 12, color: T.text3, marginTop: 16 }}>Click to reveal answer</p>}
                  </div>
                  {/* Navigation */}
                  <div style={{ padding: isMobile ? '8px 12px' : '12px 18px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => { setFcIndex(Math.max(0, fcIndex - 1)); setFcFlipped(false); }} disabled={fcIndex === 0} style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, cursor: fcIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: fcIndex === 0 ? 0.4 : 1 }}>← Prev</button>
                    <div style={{ display: 'flex', gap: 4 }}>{flashcards.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === fcIndex ? T.mint : T.border, transition: 'all .2s' }} />)}</div>
                    <button onClick={() => { setFcIndex(Math.min(flashcards.length - 1, fcIndex + 1)); setFcFlipped(false); }} disabled={fcIndex === flashcards.length - 1} style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, cursor: fcIndex >= flashcards.length - 1 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: fcIndex >= flashcards.length - 1 ? 0.4 : 1 }}>Next →</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        {/* Input bar — premium */}
        <div style={{ borderTop: `1px solid ${T.border}`, background: '#FFFFFF', padding: isMobile ? '8px 6px' : '16px 24px', flexShrink: 0, boxShadow: '0 -2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: isMobile ? 5 : 10, alignItems: 'center' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={notes ? "Ask about your notes..." : "Ask a question..."} disabled={loading}
              style={{ flex: 1, padding: isMobile ? '10px 12px' : '13px 18px', borderRadius: isMobile ? 10 : 14, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: isMobile ? 12 : 14, outline: 'none', opacity: loading ? 0.5 : 1, transition: 'border .2s', minWidth: 0 }} />
            <button onClick={send} disabled={!input.trim() || loading}
              style={{ padding: isMobile ? '10px 12px' : '13px 22px', borderRadius: isMobile ? 10 : 14, border: 'none', background: input.trim() && !loading ? `linear-gradient(135deg, ${T.mint}, ${T.emerald})` : T.surface3, color: input.trim() && !loading ? '#fff' : T.text3, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', fontSize: isMobile ? 11 : 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: isMobile ? 3 : 7, boxShadow: input.trim() ? `0 4px 14px ${T.mintGlow}` : 'none', transition: 'all .2s', whiteSpace: 'nowrap' }}>
              {Ic(Send, isMobile ? 12 : 15)} {isMobile ? '' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AI CHAT PAGE — Clean chat only, no sidebar
// ═══════════════════════════════════════════════════════════════
function AIChatPage({ stats, earnXP, trackAIQuery, language }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' | 'essay' | 'youtube'
  const [essayMode, setEssayMode] = useState('outline');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const chatRef = useRef();

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);

  const send = async () => {
    const t = input.trim(); if (!t || loading) return;
    setMessages(p => [...p, { role: 'user', content: t }]); setInput(''); setLoading(true);
    trackAIQuery();
    try {
      let sys;
      if (mode === 'essay') {
        const prompts = {
          outline: `Create a detailed essay outline for: "${t}". Use **bold** for section titles. Include intro hook, 3 body paragraphs with topic sentences + evidence, counterargument, and conclusion.`,
          thesis: `Generate 3 strong thesis statement options for: "${t}". Use **bold** for each thesis. Explain briefly why each works.`,
          improve: `Improve this text for academic writing. Fix grammar, enhance vocabulary, add transitions. Show before/after:\n\n${t}`,
          paraphrase: `Paraphrase this text in a simpler, clearer way. Keep the same meaning but use different words:\n\n${t}`,
        };
        sys = prompts[essayMode] || prompts.outline;
      } else {
        sys = 'You are SmartStudy AI, a helpful and encouraging study assistant. Give clear, concise answers. Use bullet points and examples when helpful.';
      }
      const nm = [...messages, { role: 'user', content: t }];
      const ai = await callAI(sys, nm.map(m => ({ role: m.role, content: m.content })), language);
      setMessages(p => [...p, { role: 'assistant', content: ai }]);
      earnXP(mode === 'essay' ? 10 : 5, `${mode === 'essay' ? '✍️' : '💬'} ${mode === 'essay' ? 'Essay helper' : 'Chat'}: "${t.slice(0, 25)}..."`);
    } catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]); }
    setLoading(false);
  };

  const sendYouTube = async () => {
    if (!youtubeUrl.trim() || loading) return;
    const url = youtubeUrl.trim();
    const vid = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&#?]+)/)?.[1];
    if (!vid) { setMessages(p => [...p, { role: 'user', content: `📺 ${url}` }, { role: 'assistant', content: '❌ Invalid YouTube URL. Please paste a link like `https://youtube.com/watch?v=...` or `https://youtu.be/...`' }]); setYoutubeUrl(''); return; }
    setMessages(p => [...p, { role: 'user', content: `📺 Summarize: ${url}` }]); setYoutubeUrl(''); setLoading(true);
    trackAIQuery();
    try {
      // Step 1: Fetch transcript from our server
      setMessages(p => [...p, { role: 'assistant', content: '⏳ Fetching video transcript...' }]);
      const tr = await fetch(`/api/youtube-transcript?videoId=${encodeURIComponent(vid)}`);
      const tData = await tr.json();
      if (tData.error && !tData.title) throw new Error(tData.error);

      const videoTitle = tData.title || 'YouTube Video';
      const transcript = tData.transcript || '';

      if (transcript && transcript.length > 20) {
        // Real transcript available — create detailed study notes
        const transcriptChunk = transcript.length > 15000 ? transcript.slice(0, 15000) + '...[truncated]' : transcript;
        const ai = await callAI(
          `A student wants detailed study notes from a YouTube video. Here is the ACTUAL video transcript:\n\n**Title:** ${videoTitle}\n\n**Transcript:**\n${transcriptChunk}\n\nCreate comprehensive study notes from this transcript with these sections:\n- **📖 Overview** — What is this video about? (2-3 sentences)\n- **🔑 Key Concepts** — Main ideas as bullet points with **bold** terms\n- **📝 Detailed Study Notes** — Thorough explanation of the content, organized by topic\n- **💡 Important Takeaways** — The most critical things to remember\n- **🎯 Exam Tips** — What might appear on a test from this topic\n- **❓ Practice Questions** — 3-5 questions to test understanding\n\nUse simple English. Add examples. Make it easy to study from.`,
          [], language
        );
        setMessages(p => { const copy = [...p]; copy.pop(); return [...copy, { role: 'assistant', content: `📺 **${videoTitle}**\n\n---\n\n${ai}` }]; });
        earnXP(15, `📺 Summarized video: ${videoTitle}`);
      } else {
        // No transcript — use video title/metadata to provide topic-based study notes
        const ai = await callAI(
          `A student shared a YouTube video link for study help.\nVideo: https://youtube.com/watch?v=${vid}\nTitle: "${videoTitle}"\n\nThe video doesn't have captions available, so I can't read the transcript. Based on the video title, provide:\n\n1. **📖 What This Video Is Likely About** — Based on the title, explain the topic in 2-3 sentences\n2. **🔑 Key Concepts to Study** — List the main concepts that this topic typically covers (use **bold** terms)\n3. **📝 Study Notes** — Provide detailed study notes on this topic from your knowledge\n4. **💡 Important Takeaways** — Top things to remember\n5. **🎯 Exam Tips** — What might appear on a test\n6. **❓ Practice Questions** — 3-5 questions to test understanding\n\nStart your response with:\n⚠️ **Could not fetch captions for this video.** Here are study notes based on the video's topic:\n\nAlso suggest at the end: *"For more accurate notes, you can paste the video's transcript here (click the 3 dots below the video → Show Transcript → Copy the text)."*\n\nUse simple English with examples.`,
          [], language
        );
        setMessages(p => { const copy = [...p]; copy.pop(); return [...copy, { role: 'assistant', content: `📺 **${videoTitle}**\n\n---\n\n${ai}` }]; });
        earnXP(5, `📺 Topic notes for: ${videoTitle}`);
      }
    } catch (e) {
      setMessages(p => { const copy = [...p]; copy.pop(); return [...copy, { role: 'assistant', content: `❌ Error: ${e.message}\n\n**Tip:** You can manually paste the video's transcript here and I'll create study notes from it.\n\n**How to get the transcript:**\n1. Open the YouTube video\n2. Click the **⋯** (three dots) below the video\n3. Click **Show transcript**\n4. Copy all the text and paste it here` }]; });
    }
    setLoading(false);
  };

  const quickPrompts = [
    { emoji: '🔬', text: 'Explain quantum physics simply' },
    { emoji: '📐', text: 'Help me with calculus' },
    { emoji: '📝', text: 'Study tips for exams' },
    { emoji: '📚', text: 'Summarize a topic for me' },
  ];

  const modeTabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'essay', label: 'Essay Helper', icon: PenLine },
    { id: 'youtube', label: 'Video', icon: Video },
  ];

  const essayModes = [
    { id: 'outline', label: '📝 Outline' },
    { id: 'thesis', label: '🎯 Thesis' },
    { id: 'improve', label: '✨ Improve' },
    { id: 'paraphrase', label: '🔄 Paraphrase' },
  ];

return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100dvh - 112px)' : '100%', background: T.bg, overflow: 'hidden' }}>
      {/* Mode tabs bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 3 : 4, padding: isMobile ? '6px 6px' : '12px 24px', borderBottom: `1px solid ${T.border}`, background: '#FFFFFF', flexShrink: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {modeTabs.map(tab => (
          <button key={tab.id} onClick={() => { setMode(tab.id); setMessages([]); }}
            style={{ padding: isMobile ? '5px 8px' : '8px 16px', borderRadius: isMobile ? 7 : 10, border: mode === tab.id ? `2px solid ${T.mint}` : `1px solid ${T.border}`, background: mode === tab.id ? `${T.mint}10` : T.surface2, cursor: 'pointer', fontSize: isMobile ? 10 : 12, fontWeight: mode === tab.id ? 700 : 500, color: mode === tab.id ? T.mint : T.text2, display: 'flex', alignItems: 'center', gap: isMobile ? 2 : 6, whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s' }}>
            {Ic(tab.icon, isMobile ? 10 : 13)} {isMobile ? tab.label.slice(0, 5) : tab.label}
          </button>
        ))}
        {/* Essay sub-modes */}
        {mode === 'essay' && (
          <div style={{ marginLeft: isMobile ? 2 : 8, display: 'flex', gap: 2, overflowX: 'auto' }}>
            {essayModes.map(em => (
              <button key={em.id} onClick={() => setEssayMode(em.id)}
                style={{ padding: isMobile ? '3px 5px' : '5px 10px', borderRadius: isMobile ? 5 : 8, border: essayMode === em.id ? `1px solid ${T.pink}` : `1px solid ${T.border}`, background: essayMode === em.id ? `${T.pink}10` : 'transparent', cursor: 'pointer', fontSize: isMobile ? 8 : 11, fontWeight: essayMode === em.id ? 600 : 400, color: essayMode === em.id ? T.pink : T.text3, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {em.label}
              </button>
            ))}
          </div>
        )}
        {messages.length > 0 && (
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <button onClick={() => { const text = messages.map(m => `[${m.role === 'user' ? 'You' : 'AI'}]\n${m.content}\n`).join('\n---\n\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = `smartstudy-${mode}.txt`; a.click(); }}
              style={{ padding: isMobile ? '3px 6px' : '5px 10px', borderRadius: 6, background: T.surface2, border: `1px solid ${T.border}`, cursor: 'pointer', fontSize: isMobile ? 8 : 10, fontWeight: 600 }}>{Ic(Download, isMobile ? 8 : 11)}</button>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '8px 4px' : '28px 24px', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 20 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: isMobile ? '16px 2px 8px' : '60px 20px 40px' }}>
              {/* AI avatar */}
              <div style={{ width: isMobile ? 44 : 88, height: isMobile ? 44 : 88, borderRadius: isMobile ? 14 : 26, background: `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: isMobile ? '0 auto 10px' : '0 auto 16px', boxShadow: `0 8px 32px ${T.mintGlow}, 0 0 0 ${isMobile ? 2 : 4}px ${T.mint}15`, color: '#fff' }}>
                {Ic(mode === 'youtube' ? Video : mode === 'essay' ? PenLine : Bot, isMobile ? 20 : 40, '#fff')}
              </div>
              <h2 style={{ fontSize: isMobile ? 15 : 28, fontWeight: 800, marginBottom: 4, color: T.text, letterSpacing: isMobile ? '-0.3px' : '-0.8px' }}>
                {mode === 'youtube' ? 'Video Summarizer' : mode === 'essay' ? 'Essay Helper' : 'Ask me anything'}
              </h2>
              <p style={{ fontSize: isMobile ? 10 : 15, color: T.text3, maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>
                {mode === 'youtube' ? 'Paste a YouTube URL for study notes' : mode === 'essay' ? 'Outlines, thesis & writing help' : 'AI study assistant — ask anything'}
              </p>

              {/* Quick prompts — 2x2 grid on mobile */}
              {mode === 'chat' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 4 : 10, maxWidth: isMobile ? '100%' : 460, margin: isMobile ? '10px auto 0' : '32px auto 0' }}>
                  {quickPrompts.map((q, i) => (
                    <button key={i} onClick={() => setInput(q.text)}
                      style={{ padding: isMobile ? '6px 6px' : '14px 16px', borderRadius: isMobile ? 8 : 16, fontSize: isMobile ? 9 : 13, fontWeight: 500, background: '#FFFFFF', border: `1px solid ${T.border}`, color: T.text2, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: isMobile ? 3 : 10 }}>
                      <span style={{ fontSize: isMobile ? 12 : 20, flexShrink: 0 }}>{q.emoji}</span>
                      <span style={{ lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{isMobile ? q.text.split(' ').slice(0, 3).join(' ') + '...' : q.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: isMobile ? 4 : 14, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && (
                <div style={{ width: isMobile ? 24 : 40, height: isMobile ? 24 : 40, borderRadius: isMobile ? 8 : 14, background: `linear-gradient(135deg, ${T.mint}14, ${T.emerald}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, border: `1px solid ${T.mint}18` }}>
                  {Ic(Bot, isMobile ? 11 : 18, T.mint)}
                </div>
              )}
              <div style={{
                maxWidth: m.role === 'user' ? (isMobile ? '80%' : '68%') : (isMobile ? '88%' : '82%'), padding: isMobile ? '8px 10px' : '15px 18px',
                borderRadius: isMobile ? 10 : 22, fontSize: isMobile ? 12 : 14, lineHeight: isMobile ? 1.6 : 1.7, wordBreak: 'break-word',
                background: m.role === 'user' ? `linear-gradient(135deg, ${T.mint}, ${T.emerald})` : '#FFFFFF',
                color: m.role === 'user' ? '#fff' : T.text,
                border: m.role === 'user' ? 'none' : `1px solid ${T.border}`,
                boxShadow: m.role === 'user' ? `0 2px 8px ${T.mintGlow}` : '0 1px 3px rgba(0,0,0,0.03)',
                borderTopRightRadius: m.role === 'user' ? 3 : (isMobile ? 10 : 22),
                borderTopLeftRadius: m.role === 'assistant' ? 3 : (isMobile ? 10 : 22),
              }}>{m.role === 'assistant' ? renderMD(m.content) : m.content}</div>
              {m.role === 'user' && (
                <div style={{ width: isMobile ? 24 : 40, height: isMobile ? 24 : 40, borderRadius: isMobile ? 8 : 14, background: `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, color: '#fff' }}>
                  {Ic(User, isMobile ? 10 : 17, '#fff')}
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', gap: isMobile ? 4 : 14 }}>
              <div style={{ width: isMobile ? 24 : 40, height: isMobile ? 24 : 40, borderRadius: isMobile ? 8 : 14, background: `linear-gradient(135deg, ${T.mint}14, ${T.emerald}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.mint}18` }}>
                {Ic(Bot, isMobile ? 11 : 18, T.mint)}
              </div>
              <div style={{ padding: isMobile ? '8px 12px' : '15px 24px', borderRadius: isMobile ? 10 : 22, borderTopLeftRadius: 3, background: '#FFFFFF', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: isMobile ? 4 : 7, height: isMobile ? 4 : 7, borderRadius: '50%', background: T.mint, animation: 'dot 1.2s infinite', animationDelay: `${i * 0.15}s` }} />)}
                <span style={{ fontSize: isMobile ? 9 : 12, color: T.text3, marginLeft: 2 }}>...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div style={{ borderTop: `1px solid ${T.border}`, background: '#FFFFFF', padding: isMobile ? '6px 4px' : '18px 24px', flexShrink: 0, boxShadow: '0 -1px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: isMobile ? 4 : 8, alignItems: 'center' }}>
          {mode === 'youtube' ? (
            <>
              <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendYouTube()} placeholder="Paste YouTube URL..."
                style={{ flex: 1, padding: isMobile ? '8px 10px' : '14px 18px', borderRadius: isMobile ? 8 : 16, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: isMobile ? 12 : 14, outline: 'none', minWidth: 0 }} />
              <button onClick={sendYouTube} disabled={!youtubeUrl.trim() || loading}
                style={{ padding: isMobile ? '8px 10px' : '14px 26px', borderRadius: isMobile ? 8 : 16, border: 'none', background: youtubeUrl.trim() ? `linear-gradient(135deg, ${T.red}, ${T.rose})` : T.surface3, color: youtubeUrl.trim() ? '#fff' : T.text3, cursor: youtubeUrl.trim() ? 'pointer' : 'not-allowed', fontSize: isMobile ? 11 : 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                📺 {isMobile ? 'Go' : 'Summarize'}
              </button>
            </>
          ) : (
            <>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={mode === 'essay' ? (essayMode === 'improve' || essayMode === 'paraphrase' ? 'Paste text...' : 'Topic or question...') : 'Ask me anything...'} disabled={loading}
                style={{ flex: 1, padding: isMobile ? '8px 10px' : '14px 18px', borderRadius: isMobile ? 8 : 16, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: isMobile ? 12 : 14, outline: 'none', minWidth: 0, opacity: loading ? 0.5 : 1 }} />
              <button onClick={send} disabled={!input.trim() || loading}
                style={{ padding: isMobile ? '8px 10px' : '14px 26px', borderRadius: isMobile ? 8 : 16, border: 'none', background: input.trim() && !loading ? `linear-gradient(135deg, ${T.mint}, ${T.emerald})` : T.surface3, color: input.trim() && !loading ? '#fff' : T.text3, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', fontSize: isMobile ? 11 : 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: isMobile ? 2 : 8, whiteSpace: 'nowrap' }}>
                {Ic(Send, isMobile ? 11 : 16)} {isMobile ? '' : 'Send'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLANNER PAGE — Fully Editable Student Study Planner
// ═══════════════════════════════════════════════════════════════
const SUBJECT_COLORS = [
  { name: 'Mint', color: '#32C971' }, { name: 'Sky', color: '#0EA5E9' },
  { name: 'Violet', color: '#A78BFA' }, { name: 'Rose', color: '#F472B6' },
  { name: 'Amber', color: '#FBBF24' }, { name: 'Orange', color: '#FB923C' },
  { name: 'Red', color: '#EF4444' }, { name: 'Teal', color: '#14B8A6' },
  { name: 'Indigo', color: '#6366F1' }, { name: 'Pink', color: '#EC4899' },
];

const PLANNER_KEY = 'smartstudy_planner_v2';

function getWeekDates(offset = 0) {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtWeekRange(dates) {
  if (!dates.length) return '';
  return `${fmtDate(dates[0])} – ${fmtDate(dates[6])}`;
}

function PlannerPage({ language }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const hourLabels = ['6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM'];

  const [weekOffset, setWeekOffset] = useState(0);
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(PLANNER_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'
  const [activeDay, setActiveDay] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState([]);
  const [dragOver, setDragOver] = useState(null);
  const [subjects, setSubjects] = useState(() => {
    try {
      const s = localStorage.getItem('smartstudy_subjects');
      return s ? JSON.parse(s) : [
        { name: 'Mathematics', color: '#32C971' },
        { name: 'Physics', color: '#0EA5E9' },
        { name: 'Chemistry', color: '#A78BFA' },
        { name: 'English', color: '#F472B6' },
        { name: 'Computer Science', color: '#FB923C' },
        { name: 'History', color: '#FBBF24' },
      ];
    } catch { return []; }
  });
  const [subjectModal, setSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#32C971' });

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Persist sessions
  useEffect(() => { localStorage.setItem(PLANNER_KEY, JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('smartstudy_subjects', JSON.stringify(subjects)); }, [subjects]);

  // Get sessions for a specific day
  const getSessionsForDay = (dayIdx) => {
    const date = weekDates[dayIdx];
    const key = date.toISOString().slice(0, 10);
    return sessions.filter(s => s.date === key);
  };

  // Save / update session
  const saveSession = (data) => {
    if (editSession) {
      setSessions(prev => prev.map(s => s.id === editSession.id ? { ...s, ...data } : s));
    } else {
      setSessions(prev => [...prev, { ...data, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }]);
    }
    setModalOpen(false);
    setEditSession(null);
  };

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const openAddModal = (dayIdx, hour) => {
    const date = weekDates[dayIdx];
    setEditSession(null);
    setModalOpen({
      date: date.toISOString().slice(0, 10),
      dayIdx,
      startHour: hour,
      endHour: hour + 1,
      subject: subjects[0]?.name || '',
      color: subjects[0]?.color || '#32C971',
      title: '',
      notes: '',
      priority: 'medium',
    });
  };

  const openEditModal = (session) => {
    setEditSession(session);
    setModalOpen({
      date: session.date,
      dayIdx: 0,
      startHour: session.startHour,
      endHour: session.endHour,
      subject: session.subject,
      color: session.color,
      title: session.title || '',
      notes: session.notes || '',
      priority: session.priority || 'medium',
    });
  };

  const addSubject = () => {
    if (newSubject.name.trim()) {
      setSubjects(prev => [...prev, { ...newSubject }]);
      setNewSubject({ name: '', color: '#32C971' });
      setSubjectModal(false);
    }
  };

  const removeSubject = (name) => {
    setSubjects(prev => prev.filter(s => s.name !== name));
  };

  // AI Smart Schedule
  const generateSmartSchedule = async () => {
    setAiLoading(true);
    try {
      const subjectList = subjects.map(s => s.name).join(', ');
      const existingSchedule = sessions.map(s => `${s.subject} ${s.startHour}:00-${s.endHour}:00 on ${s.date}`).join('\n');
      const prompt = `You are a smart study planner for a student. Create a weekly study schedule.

Subjects: ${subjectList}
Current schedule:
${existingSchedule || 'No sessions yet'}

Generate 8-12 study sessions for the current week as a JSON array. Each session:
{"date":"YYYY-MM-DD","startHour":9,"endHour":10,"subject":"Subject Name","title":"Topic to study","priority":"high|medium|low"}

Rules:
- Spread subjects evenly across the week
- Include 1-2 hour blocks, not longer
- Include short review sessions
- Keep evenings lighter
- Vary subjects to avoid burnout
- Use today's date as reference: ${new Date().toISOString().slice(0, 10)}
- The week starts on Monday

Return ONLY the JSON array, no other text.`;

      const res = await callAI(prompt, [], language);
      const jsonMatch = res.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newSessions = parsed.map(s => ({
          ...s,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          color: subjects.find(sub => sub.name === s.subject)?.color || '#32C971',
          notes: '',
        }));
        setSessions(prev => [...prev, ...newSessions]);
        setAiTips(prev => [...prev, { text: `✨ Added ${newSessions.length} AI-suggested sessions!`, time: new Date().toLocaleTimeString() }]);
      }
    } catch (e) {
      setAiTips(prev => [...prev, { text: `❌ AI scheduling failed: ${e.message}`, time: new Date().toLocaleTimeString() }]);
    }
    setAiLoading(false);
  };

  // Get AI tips
  const getAiTips = async () => {
    setAiLoading(true);
    try {
      const weekSessions = sessions.filter(s => {
        const d = new Date(s.date);
        return d >= weekDates[0] && d <= weekDates[6];
      });
      const summary = weekSessions.map(s => `${s.subject}: ${s.startHour}-${s.endHour}`).join(', ');
      const prompt = `You are an AI study advisor. Based on this week's study schedule: ${summary || 'No sessions planned yet'}, give 4 short personalized study tips (1 line each). Return as a JSON array of strings. No other text.`;
      const res = await callAI(prompt, [], language);
      const match = res.match(/\[[\s\S]*\]/);
      if (match) {
        const tips = JSON.parse(match[0]);
        setAiTips(tips.map((t, i) => ({ text: t, time: new Date().toLocaleTimeString() })));
      }
    } catch (e) {
      setAiTips([{ text: 'Could not load AI tips', time: new Date().toLocaleTimeString() }]);
    }
    setAiLoading(false);
  };

  // Study hours stats
  const weekStudyHours = useMemo(() => {
    const hoursPerDay = {};
    days.forEach((d, i) => {
      const daySessions = getSessionsForDay(i);
      hoursPerDay[d] = daySessions.reduce((sum, s) => sum + (s.endHour - s.startHour), 0);
    });
    return hoursPerDay;
  }, [sessions, weekOffset]);

  const totalWeekHours = useMemo(() => Object.values(weekStudyHours).reduce((a, b) => a + b, 0), [weekStudyHours]);
  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();
  const todaySessions = getSessionsForDay(todayIdx);
  const todayHours = todaySessions.reduce((sum, s) => sum + (s.endHour - s.startHour), 0);
  const subjectHours = useMemo(() => {
    const map = {};
    sessions.forEach(s => { map[s.subject] = (map[s.subject] || 0) + (s.endHour - s.startHour); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [sessions]);

  // Drag and drop handlers
  const handleDragStart = (e, session) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(session));
  };
  const handleDrop = (e, dayIdx, hour) => {
    e.preventDefault();
    setDragOver(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const duration = data.endHour - data.startHour;
      const date = weekDates[dayIdx].toISOString().slice(0, 10);
      setSessions(prev => prev.map(s => s.id === data.id ? { ...s, date, startHour: hour, endHour: hour + duration } : s));
    } catch {}
  };

  // ── RENDER ──
  return (
    <div style={{ animation: 'slide-up .4s ease', padding: isMobile ? 12 : 0 }}>
      {/* Header */}
<div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: isMobile ? 8 : 12, flexDirection: isMobile ? 'column' : 'row' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 17 : 22, fontWeight: 800, letterSpacing: '-0.8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {Ic(Calendar, isMobile ? 18 : 24, T.mint)} Study Planner
          </h1>
<p style={{ fontSize: isMobile ? 11 : 13, color: T.text3, marginTop: 2 }}>
            {fmtWeekRange(weekDates)} · {totalWeekHours}h planned
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, flexWrap: 'wrap' }}>
          {/* Week nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '4px 8px' }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={{ ...btnBase, width: 28, height: 28 }}>{Ic(ChevronLeft, 14)}</button>
            <button onClick={() => setWeekOffset(0)} style={{ ...btnBase, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: weekOffset === 0 ? T.mint : T.text2 }}>Today</button>
            <button onClick={() => setWeekOffset(w => w + 1)} style={{ ...btnBase, width: 28, height: 28 }}>{Ic(ChevronRight, 14)}</button>
          </div>
          {/* View toggle */}
          <div style={{ display: 'flex', background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            {['week', 'day'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                style={{ padding: '6px 14px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: viewMode === v ? T.mint : 'transparent', color: viewMode === v ? '#fff' : T.text2,
                  transition: 'all .2s' }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <GlowButton icon={Sparkles} size="sm" onClick={generateSmartSchedule} disabled={aiLoading}>
            {aiLoading ? 'Generating...' : 'AI Schedule'}
          </GlowButton>
          <GlowButton icon={Plus} size="sm" variant="outline" onClick={() => openAddModal(todayIdx, 9)}>
            Add Session
          </GlowButton>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 6 : 12, marginBottom: isMobile ? 12 : 20 }}>
        {[
          { icon: Clock, label: 'This Week', value: `${totalWeekHours}h`, color: T.mint },
          { icon: Calendar, label: 'Today', value: `${todayHours}h`, color: T.sky },
          { icon: BookOpen, label: 'Subjects', value: subjectHours.length, color: T.violet },
          { icon: Target, label: 'Sessions', value: sessions.length, color: T.amber },
        ].map((s, i) => (
          <div key={i} style={{ padding: isMobile ? '10px 12px' : '16px 20px', borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: isMobile ? 32 : 42, height: isMobile ? 32 : 42, borderRadius: 12, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Ic(s.icon, isMobile ? 16 : 20, s.color)}
            </div>
            <div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: '-0.8px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: T.text3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: isMobile ? 12 : 16 }}>
        {/* Left — Timetable */}
        <div style={{ borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          {/* Day tabs for day view */}
          {viewMode === 'day' && (
            <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.bg2 }}>
              {days.map((d, i) => {
                const active = activeDay === i;
                const count = getSessionsForDay(i).length;
                return (
                  <button key={d} onClick={() => setActiveDay(i)}
                    style={{ flex: 1, padding: isMobile ? '8px 4px' : '12px 8px', border: 'none', cursor: 'pointer',
                      background: active ? T.surface : 'transparent', borderBottom: active ? `2px solid ${T.mint}` : '2px solid transparent',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all .2s' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: active ? T.mint : T.text3 }}>{d}</span>
                    <span style={{ fontSize: 10, color: T.text3 }}>{fmtDate(weekDates[i])}</span>
                    {count > 0 && <span style={{ fontSize: 9, color: '#fff', background: T.mint, borderRadius: 8, padding: '1px 6px', fontWeight: 600 }}>{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ padding: 16, overflowX: 'auto' }}>
            {/* Column headers */}
<div style={{ display: 'grid', gridTemplateColumns: viewMode === 'week' ? '52px repeat(7, 1fr)' : '52px 1fr', gap: 2, minWidth: viewMode === 'week' ? (isMobile ? 700 : 600) : 300 }}>
	              <div />
	              {(viewMode === 'week' ? days : [days[activeDay]]).map((d, idx) => {
                const dayIdx = viewMode === 'week' ? idx : activeDay;
                const isToday = dayIdx === todayIdx && weekOffset === 0;
                return (
                  <div key={d + idx} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: isToday ? `${T.mint}10` : 'transparent' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? T.mint : T.text3, textTransform: 'uppercase' }}>{d}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isToday ? T.mint : T.text, marginTop: 2 }}>{weekDates[dayIdx]?.getDate()}</div>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'week' ? '52px repeat(7, 1fr)' : '52px 1fr', gap: 2, marginTop: 4, minWidth: viewMode === 'week' ? (isMobile ? 700 : 600) : 300 }}>
              {hours.map((h, hi) => (
                <React.Fragment key={h}>
                  <div style={{ fontSize: 10, color: T.text3, padding: '6px 4px', height: 44, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', fontWeight: 500 }}>{hourLabels[hi]}</div>
                  {(viewMode === 'week' ? [0,1,2,3,4,5,6] : [activeDay]).map(dayIdx => {
                    const daySessions = getSessionsForDay(dayIdx);
                    const slot = daySessions.find(s => s.startHour <= h && s.endHour > h);
                    const isStart = slot && slot.startHour === h;
                    const duration = slot ? slot.endHour - slot.startHour : 0;
                    const isDragOver = dragOver === `${dayIdx}-${h}`;
                    return (
                      <div key={`${dayIdx}-${h}`}
                        onClick={() => { if (!slot) openAddModal(dayIdx, h); }}
                        onDragOver={e => { e.preventDefault(); setDragOver(`${dayIdx}-${h}`); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => handleDrop(e, dayIdx, h)}
                        style={{
                          height: 44, borderRadius: 8, cursor: slot ? 'default' : 'pointer',
                          background: isDragOver ? `${T.mint}15` : slot ? `${slot.color}12` : T.bg2,
                          border: isDragOver ? `2px dashed ${T.mint}` : slot && isStart ? `1px solid ${slot.color}30` : '1px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .15s', position: 'relative', overflow: 'hidden',
                        }}>
                        {slot && isStart && (
                          <div draggable
                            onDragStart={e => handleDragStart(e, slot)}
                            onClick={e => { e.stopPropagation(); openEditModal(slot); }}
                            style={{
                              width: '100%', height: 44 * duration - 4, position: 'absolute', top: 0, left: 0,
                              background: `linear-gradient(135deg, ${slot.color}18, ${slot.color}28)`,
                              borderLeft: `3px solid ${slot.color}`, borderRadius: 8,
                              padding: '4px 8px', cursor: 'grab', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                              zIndex: 1,
                            }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: slot.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {slot.subject}
                            </div>
                            {slot.title && <div style={{ fontSize: 9, color: T.text3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.title}</div>}
                            <div style={{ fontSize: 9, color: T.text3, marginTop: 1 }}>
                              {slot.startHour > 12 ? (slot.startHour - 12) + 'PM' : slot.startHour + 'AM'} – {slot.endHour > 12 ? (slot.endHour - 12) + 'PM' : slot.endHour + 'AM'}
                            </div>
                          </div>
                        )}
                        {!slot && (
                          <span style={{ fontSize: 16, color: T.border, opacity: 0, transition: 'opacity .15s' }}
                            onMouseEnter={e => e.target.style.opacity = 1}
                            onMouseLeave={e => e.target.style.opacity = 0}>+</span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 14 }}>
          {/* Today's Schedule */}
          <div style={{ padding: isMobile ? 14 : 18, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {Ic(Clock, 14, T.mint)} Today's Schedule
            </h3>
            {todaySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '14px 0' : '20px 0', color: T.text3, fontSize: 12 }}>
                <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 6 }}>📚</div>
                No sessions today. Click a time slot to add one!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todaySessions.sort((a, b) => a.startHour - b.startHour).map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, padding: isMobile ? '8px 8px' : '10px 12px', borderRadius: 10,
                    background: `${s.color}08`, borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.subject}</div>
                      <div style={{ fontSize: 10, color: T.text3 }}>{s.startHour > 12 ? (s.startHour-12)+'PM' : s.startHour+'AM'} – {s.endHour > 12 ? (s.endHour-12)+'PM' : s.endHour+'AM'}{s.title ? ` · ${s.title}` : ''}</div>
                    </div>
                    <button onClick={() => openEditModal(s)} style={{ ...btnBase, width: 24, height: 24, borderRadius: 6, background: `${s.color}12` }}>{Ic(Edit3, 11, s.color)}</button>
                    <button onClick={() => deleteSession(s.id)} style={{ ...btnBase, width: 24, height: 24, borderRadius: 6, background: T.redSoft }}>{Ic(Trash2, 11, T.red)}</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject Hours */}
          {subjectHours.length > 0 && (
            <div style={{ padding: isMobile ? 14 : 18, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                {Ic(BarChart3, 14, T.violet)} Study Breakdown
              </h3>
              {subjectHours.slice(0, 5).map(([subj, hrs], i) => {
                const subjData = subjects.find(s => s.name === subj);
                const clr = subjData?.color || T.mint;
                const maxH = subjectHours[0]?.[1] || 1;
                return (
                  <div key={subj} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{subj}</span>
                      <span style={{ fontSize: 11, color: T.text3 }}>{hrs}h</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: T.bg2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: clr, width: `${(hrs / maxH) * 100}%`, transition: 'width .5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Manage Subjects */}
          <div style={{ padding: isMobile ? 14 : 18, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>{Ic(BookOpen, 14, T.amber)} My Subjects</h3>
              <button onClick={() => setSubjectModal(!subjectModal)} style={{ ...btnBase, fontSize: 11, color: T.mint, fontWeight: 600 }}>
                {subjectModal ? 'Done' : '+ Add'}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {subjects.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8,
                  background: `${s.color}12`, border: `1px solid ${s.color}20`, fontSize: 11, fontWeight: 500, color: s.color }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
                  {s.name}
                  {subjectModal && (
                    <button onClick={() => removeSubject(s.name)} style={{ ...btnBase, marginLeft: 2 }}>{Ic(X, 10, s.color)}</button>
                  )}
                </div>
              ))}
            </div>
            {subjectModal && (
              <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: T.bg2, border: `1px solid ${T.border}` }}>
                <input value={newSubject.name} onChange={e => setNewSubject(p => ({ ...p, name: e.target.value }))}
                  placeholder="Subject name..." style={inputStyle} onKeyDown={e => e.key === 'Enter' && addSubject()} />
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  {SUBJECT_COLORS.map(c => (
                    <button key={c.color} onClick={() => setNewSubject(p => ({ ...p, color: c.color }))}
                      style={{ width: 24, height: 24, borderRadius: 6, background: c.color, border: newSubject.color === c.color ? '2px solid #111' : '2px solid transparent', cursor: 'pointer', transition: 'all .15s' }} />
                  ))}
                </div>
                <GlowButton size="sm" onClick={addSubject} style={{ marginTop: 10, width: '100%' }} disabled={!newSubject.name.trim()}>Add Subject</GlowButton>
              </div>
            )}
          </div>

          {/* Pomodoro */}
          <PomodoroWidget />

          {/* AI Tips */}
          <div style={{ padding: isMobile ? 14 : 18, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>{Ic(Sparkles, 14, T.violet)} AI Study Tips</h3>
              <button onClick={getAiTips} disabled={aiLoading} style={{ ...btnBase, fontSize: 10, color: T.violet, fontWeight: 600 }}>
                {aiLoading ? 'Loading...' : 'Get Tips'}
              </button>
            </div>
            {aiTips.length === 0 ? (
              <div style={{ fontSize: 11, color: T.text3, textAlign: 'center', padding: '8px 0' }}>Click "Get Tips" for personalized advice</div>
            ) : (
              aiTips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 11, lineHeight: 1.5 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: `${T.violet}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{Ic(Lightbulb, 10, T.violet)}</span>
                  <span style={{ color: T.text2 }}>{tip.text || tip}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Session Modal */}
      {modalOpen && <SessionModal
        data={modalOpen}
        onSave={saveSession}
        onClose={() => { setModalOpen(false); setEditSession(null); }}
        onDelete={editSession ? () => { deleteSession(editSession.id); setModalOpen(false); setEditSession(null); } : null}
        subjects={subjects}
        isEdit={!!editSession}
      />}
    </div>
  );
}

// Small helper for consistent button base styles
const btnBase = { border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, transition: 'all .15s' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, fontSize: 12, color: T.text, outline: 'none', transition: 'border .2s' };

// Session Modal
function SessionModal({ data, onSave, onClose, onDelete, subjects, isEdit }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const [form, setForm] = useState({
    date: data.date,
    startHour: data.startHour || 9,
    endHour: data.endHour || 10,
    subject: data.subject || subjects[0]?.name || '',
    color: data.color || subjects[0]?.color || '#32C971',
    title: data.title || '',
    notes: data.notes || '',
    priority: data.priority || 'medium',
  });

  const setField = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'subject') {
        const sub = subjects.find(s => s.name === val);
        if (sub) next.color = sub.color;
      }
      return next;
    });
  };

  const hourOpts = Array.from({ length: 16 }, (_, i) => i + 6);
  const hourLabel = h => h > 12 ? `${h-12}PM` : h === 12 ? '12PM' : `${h}AM`;
  const priorities = [
    { id: 'high', label: 'High', color: T.red, icon: '🔴' },
    { id: 'medium', label: 'Medium', color: T.amber, icon: '🟡' },
    { id: 'low', label: 'Low', color: T.mint, icon: '🟢' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ width: isMobile ? 'calc(100vw - 32px)' : 460, maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', background: T.surface, borderRadius: isMobile ? 16 : 20, border: `1px solid ${T.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ padding: isMobile ? '14px 16px 12px' : '20px 24px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<h3 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
	            {isEdit ? Ic(Edit3, 18, T.mint) : Ic(Plus, 18, T.mint)}
            {isEdit ? 'Edit Session' : 'Add Study Session'}
          </h3>
          <button onClick={onClose} style={{ ...btnBase, width: 30, height: 30, borderRadius: 8, background: T.bg2 }}>{Ic(X, 16)}</button>
        </div>

        <div style={{ padding: isMobile ? '14px 16px' : '20px 24px' }}>
          {/* Subject */}
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, display: 'block' }}>Subject</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {subjects.map(s => (
              <button key={s.name} onClick={() => setField('subject', s.name)}
                style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${s.color}30`,
                  background: form.subject === s.name ? `${s.color}15` : 'transparent', color: form.subject === s.name ? s.color : T.text3,
                  cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
                {s.name}
              </button>
            ))}
          </div>

          {/* Title */}
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, display: 'block' }}>Topic / Title (optional)</label>
          <input value={form.title} onChange={e => setField('title', e.target.value)}
            placeholder="e.g. Chapter 5 — Integration" style={{ ...inputStyle, marginBottom: 16 }} />

          {/* Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, display: 'block' }}>Date</label>
              <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, display: 'block' }}>Start</label>
              <select value={form.startHour} onChange={e => setField('startHour', parseInt(e.target.value))} style={inputStyle}>
                {hourOpts.map(h => <option key={h} value={h}>{hourLabel(h)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, display: 'block' }}>End</label>
              <select value={form.endHour} onChange={e => setField('endHour', parseInt(e.target.value))} style={inputStyle}>
                {hourOpts.filter(h => h > form.startHour).map(h => <option key={h} value={h}>{hourLabel(h)}</option>)}
              </select>
            </div>
          </div>

          {/* Priority */}
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, display: 'block' }}>Priority</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {priorities.map(p => (
              <button key={p.id} onClick={() => setField('priority', p.id)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  border: form.priority === p.id ? `1px solid ${p.color}40` : `1px solid ${T.border}`,
                  background: form.priority === p.id ? `${p.color}12` : 'transparent', color: form.priority === p.id ? p.color : T.text3,
                  cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, display: 'block' }}>Notes (optional)</label>
          <textarea value={form.notes} onChange={e => setField('notes', e.target.value)}
            placeholder="Any extra details for this session..." rows={3}
            style={{ ...inputStyle, marginBottom: 20, resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        {/* Footer */}
        <div style={{ padding: isMobile ? '10px 16px 14px' : '14px 24px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: `1px solid ${T.border}` }}>
          {isEdit && onDelete && (
            <GlowButton variant="ghost" size="sm" onClick={onDelete} style={{ marginRight: 'auto', color: T.red }}>
              {Ic(Trash2, 14, T.red)} Delete
            </GlowButton>
          )}
          <GlowButton variant="ghost" size="sm" onClick={onClose}>Cancel</GlowButton>
          <GlowButton size="sm" onClick={() => onSave(form)} icon={isEdit ? CheckCircle2 : Plus}>
            {isEdit ? 'Save Changes' : 'Add Session'}
          </GlowButton>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NOTES PAGE — Shows uploaded + sample notes
// ═══════════════════════════════════════════════════════════════
function NotesPage({ allNotes, onDeleteNote, onOpenNote, setPage, onUploadNotes, onAddNote, earnXP, language }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);
  const [uploadStep, setUploadStep] = useState('subject'); // 'subject' | 'file' | 'uploading'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'voice'
  // Voice notes state
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceNotes, setVoiceNotes] = useState(() => loadVoiceNotes());
  const [statusMsg, setStatusMsg] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);
  const userStoppedRef = useRef(false);
  const langMap = { English: 'en-US', Urdu: 'ur-PK', Spanish: 'es-ES', French: 'fr-FR', German: 'de-DE', Portuguese: 'pt-BR', Chinese: 'zh-CN', Japanese: 'ja-JP', Hindi: 'hi-IN', Arabic: 'ar-SA', Korean: 'ko-KR' };

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setVoiceSupported(false);
  }, []);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceSupported(false); return; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    userStoppedRef.current = false;
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true;
    recognition.lang = langMap[language] || 'en-US';
    recognition.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setTranscript(t); setStatusMsg(`Listening... ${t.split(/\s+/).length} words`); };
    recognition.onerror = (e) => { if (e.error === 'no-speech') { setStatusMsg('No speech detected — still listening...'); return; } if (e.error === 'aborted') return; setStatusMsg(`Error: ${e.error}`); setRecording(false); };
    recognition.onend = () => { if (!userStoppedRef.current) { try { recognition.start(); } catch {} setStatusMsg('Reconnecting...'); } else { setRecording(false); setStatusMsg(''); } };
    recognition.start(); recognitionRef.current = recognition; setRecording(true); setStatusMsg('Listening...');
  }, [language]);

  const stopRecording = useCallback(() => {
    userStoppedRef.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setRecording(false); setStatusMsg('');
  }, []);

  const saveVoiceNote = () => {
    if (!transcript.trim()) return;
    const note = { id: Date.now().toString(36), text: transcript.trim(), date: new Date().toISOString(), words: transcript.trim().split(/\s+/).length };
    const updated = [note, ...voiceNotes]; setVoiceNotes(updated); saveVoiceNotes(updated);
    if (earnXP) earnXP(10, '🎤 Recorded voice note');
    setTranscript('');
  };
  const deleteVoiceNote = (id) => { const updated = voiceNotes.filter(n => n.id !== id); setVoiceNotes(updated); saveVoiceNotes(updated); };
  const toggleSpeak = (text) => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '')); u.rate = 0.9; window.speechSynthesis.speak(u); } };

  const subjectList = [
    { name: 'Mathematics', icon: '📐', color: '#32C971' },
    { name: 'Physics', icon: '⚡', color: '#0EA5E9' },
    { name: 'Chemistry', icon: '🧪', color: '#A78BFA' },
    { name: 'Biology', icon: '🧬', color: '#14B8A6' },
    { name: 'Computer Science', icon: '💻', color: '#FB923C' },
    { name: 'English', icon: '📖', color: '#EC4899' },
    { name: 'History', icon: '🏛️', color: '#FBBF24' },
    { name: 'Geography', icon: '🌍', color: '#6366F1' },
    { name: 'Economics', icon: '📊', color: '#EF4444' },
    { name: 'Philosophy', icon: '🤔', color: '#8B5CF6' },
    { name: 'Psychology', icon: '🧠', color: '#F472B6' },
    { name: 'Law', icon: '⚖️', color: '#64748B' },
  ];

  const handleFile = async (f) => {
    try {
      setUploadStep('uploading');
      const ct = await extractText(f);
      if (!ct.trim()) throw new Error('Empty file');
      const subject = selectedSubject === 'Other' ? customSubject.trim() : selectedSubject;
      const noteData = { name: f.name, content: ct.trim(), wc: ct.trim().split(/\s+/).filter(Boolean).length };
      onUploadNotes(noteData);
      onAddNote({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: f.name, content: ct.trim(), words: noteData.wc, date: new Date().toISOString(), type: f.name.split('.').pop().toUpperCase(), subject });
      setShowUpload(false);
      setUploadStep('subject');
      setSelectedSubject('');
      setCustomSubject('');
    } catch (e) {
      alert('Error: ' + e.message);
      setUploadStep('file');
    }
  };

  const closeUploadModal = () => {
    setShowUpload(false);
    setUploadStep('subject');
    setSelectedSubject('');
    setCustomSubject('');
  };

  // Only show sample notes if user has no real notes
  const sampleNotes = allNotes.length === 0 ? [
    { id: 's1', name: 'Sample: Organic Chemistry Ch.7', subject: 'Chemistry', date: new Date(Date.now() - 2*3600000).toISOString(), words: 3200, type: 'PDF', sample: true },
    { id: 's2', name: 'Sample: Linear Algebra Notes', subject: 'Mathematics', date: new Date(Date.now() - 5*3600000).toISOString(), words: 2400, type: 'TXT', sample: true },
    { id: 's3', name: 'Sample: Machine Learning Basics', subject: 'CS', date: new Date(Date.now() - 86400000).toISOString(), words: 4200, type: 'PDF', sample: true },
    { id: 's4', name: 'Sample: World War II Summary', subject: 'History', date: new Date(Date.now() - 2*86400000).toISOString(), words: 1800, type: 'DOCX', sample: true },
  ] : [];

  const combined = [...allNotes.map(n => ({ ...n, subject: n.subject || guessSubject(n.name) })), ...sampleNotes];

  // Categories
  const categories = ['All', ...new Set(combined.map(n => n.subject).filter(Boolean))];

  const filtered = combined.filter(n => {
    const matchSearch = !search || n.name.toLowerCase().includes(search.toLowerCase()) || (n.subject || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || n.subject === activeCategory;
    return matchSearch && matchCat;
  });

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  };

  const typeColors = { PDF: T.red, TXT: T.sky, DOCX: T.blue };

  return (
    <div style={{ animation: 'slide-up .4s ease', padding: isMobile ? '8px 4px' : 0 }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 10 : 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 8 : 12 }}>
          <h1 style={{ fontSize: isMobile ? 17 : 22, fontWeight: 800, letterSpacing: '-0.8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeTab === 'voice' ? Ic(Mic, isMobile ? 16 : 24, T.blue) : Ic(BookMarked, isMobile ? 16 : 24, T.mint)} 
            {isMobile ? (activeTab === 'voice' ? 'Voice Notes' : 'Notes') : (activeTab === 'voice' ? 'Voice Notes' : 'My Notes')}
          </h1>
          {/* Tab switcher */}
          <div style={{ display: 'flex', borderRadius: 8, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <button onClick={() => setActiveTab('notes')} style={{ padding: isMobile ? '5px 10px' : '7px 14px', fontSize: isMobile ? 10 : 12, fontWeight: activeTab === 'notes' ? 700 : 400, background: activeTab === 'notes' ? `${T.mint}10` : 'transparent', color: activeTab === 'notes' ? T.mint : T.text3, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{Ic(BookMarked, 10)} {isMobile ? 'Notes' : 'Notes'}</button>
            <button onClick={() => setActiveTab('voice')} style={{ padding: isMobile ? '5px 10px' : '7px 14px', fontSize: isMobile ? 10 : 12, fontWeight: activeTab === 'voice' ? 700 : 400, background: activeTab === 'voice' ? `${T.blue}10` : 'transparent', color: activeTab === 'voice' ? T.blue : T.text3, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{Ic(Mic, 10)} {isMobile ? 'Voice' : 'Voice'}</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <p style={{ fontSize: isMobile ? 10 : 13, color: T.text3 }}>{activeTab === 'voice' ? `${voiceNotes.length} recordings` : `${allNotes.length} uploaded · ${combined.length} total`}</p>
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  style={{ padding: isMobile ? '5px 8px 5px 24px' : '8px 12px 8px 32px', borderRadius: 6, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: isMobile ? 10 : 12, outline: 'none', width: isMobile ? 80 : 200 }} />
                <div style={{ position: 'absolute', left: isMobile ? 6 : 10, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Search, isMobile ? 9 : 13, T.text3)}</div>
              </div>
              <GlowButton icon={Upload} size="sm" onClick={() => setShowUpload(true)}>{isMobile ? '' : 'Upload'}</GlowButton>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'voice' ? (
        /* ══ Voice Notes Tab ══ */
        <div>
          <div style={{ padding: isMobile ? 12 : 24, borderRadius: isMobile ? 12 : 16, background: T.surface, border: `1px solid ${T.border}`, marginBottom: isMobile ? 12 : 20, textAlign: 'center' }}>
            {!voiceSupported ? (
              <div style={{ padding: 12 }}><p style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600 }}>⚠️ Speech Recognition requires Chrome or Edge</p></div>
            ) : (
              <>
                <button onClick={recording ? stopRecording : startRecording}
                  style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: '50%', border: 'none', background: recording ? T.rose : `linear-gradient(135deg, ${T.blue}, ${T.mint})`, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: recording ? `0 0 0 4px ${T.rose}25` : `0 4px 16px ${T.blue}25`, animation: recording ? 'glow-pulse 1.5s infinite' : 'none', transition: 'all .3s' }}>
                  {Ic(recording ? MicOff : Mic, isMobile ? 22 : 28, '#fff')}
                </button>
                <p style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600, color: recording ? T.rose : T.text }}>{recording ? '🔴 Recording...' : 'Tap to start'}</p>
                <p style={{ fontSize: isMobile ? 9 : 11, color: T.text3, marginTop: 2 }}>{statusMsg || `${language || 'English'}`}</p>
              </>
            )}
          </div>
          {transcript && (
            <div style={{ padding: isMobile ? 10 : 18, borderRadius: isMobile ? 10 : 14, background: T.surface, border: `1px solid ${T.border}`, marginBottom: isMobile ? 10 : 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700 }}>Live ({transcript.split(/\s+/).length} words)</span>
                <button onClick={saveVoiceNote} style={{ padding: '3px 8px', borderRadius: 6, background: T.mint, color: '#fff', border: 'none', cursor: 'pointer', fontSize: isMobile ? 9 : 11, fontWeight: 600 }}>💾 Save</button>
              </div>
              <p style={{ fontSize: isMobile ? 11 : 13, lineHeight: 1.6, color: T.text2, whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto' }}>{transcript}</p>
            </div>
          )}
          {voiceNotes.length > 0 && (
            <div>
              <h3 style={{ fontSize: isMobile ? 10 : 13, fontWeight: 700, marginBottom: 6 }}>Saved</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {voiceNotes.map(n => (
                  <div key={n.id} style={{ padding: isMobile ? 8 : 12, borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius: 8, background: `${T.blue}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic(Mic, isMobile ? 12 : 15, T.blue)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: isMobile ? 10 : 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.text.slice(0, 50)}...</p>
                      <p style={{ fontSize: isMobile ? 8 : 10, color: T.text3 }}>{n.words}w · {timeAgo(n.date)}</p>
                    </div>
                    <button onClick={() => toggleSpeak(n.text)} style={{ padding: 2, borderRadius: 4, background: T.surface2, border: `1px solid ${T.border}`, cursor: 'pointer', fontSize: isMobile ? 10 : 12 }}>🔊</button>
                    <button onClick={() => deleteVoiceNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{Ic(Trash2, isMobile ? 10 : 13, T.text3)}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {voiceNotes.length === 0 && !transcript && (
            <div style={{ textAlign: 'center', padding: isMobile ? 16 : 40, borderRadius: isMobile ? 12 : 16, background: T.surface, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: isMobile ? 24 : 40, marginBottom: 8 }}>🎤</div>
              <p style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600, marginBottom: 2 }}>No voice notes yet</p>
              <p style={{ fontSize: isMobile ? 9 : 12, color: T.text3 }}>Record lectures and they'll appear here</p>
            </div>
          )}
        </div>
      ) : (
        /* ══ Notes Tab ══ */
        <>
          {/* Categories — horizontal scroll on mobile */}
          <div style={{ display: 'flex', gap: isMobile ? 4 : 8, marginBottom: isMobile ? 10 : 20, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingBottom: 2, marginLeft: isMobile ? -4 : 0, marginRight: isMobile ? -4 : 0, paddingLeft: isMobile ? 4 : 0, paddingRight: isMobile ? 4 : 0 }}>
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                style={{ padding: isMobile ? '4px 10px' : '6px 14px', borderRadius: isMobile ? 6 : 20, fontSize: isMobile ? 9 : 11, fontWeight: 500, background: activeCategory === c ? T.mintSoft : T.surface, color: activeCategory === c ? T.mint : T.text3, border: `1px solid ${activeCategory === c ? T.mintGlow : T.border}`, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0 }}>{c}</button>
            ))}
          </div>

          {/* Notes grid — single column on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isMobile ? 6 : 12 }}>
            {filtered.map(n => {
              const tc = typeColors[n.type] || T.mint;
              return (
                <div key={n.id} style={{ padding: isMobile ? 8 : 18, borderRadius: isMobile ? 10 : 14, background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer', transition: 'all .2s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.08)`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  {!n.sample && (
                    <div style={{ position: 'absolute', top: isMobile ? 4 : 10, right: isMobile ? 4 : 10, padding: '1px 5px', borderRadius: 4, background: `${T.mint}15`, fontSize: isMobile ? 7 : 9, fontWeight: 700, color: T.mint, letterSpacing: '0.5px' }}>NEW</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 6 : 12 }}>
                    <div style={{ width: isMobile ? 28 : 40, height: isMobile ? 28 : 40, borderRadius: isMobile ? 8 : 12, background: `${tc}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {Ic(n.type === 'PDF' ? FileText : n.type === 'DOCX' ? FileText : Edit3, isMobile ? 12 : 18, tc)}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {!n.sample && onDeleteNote && (
                        <button onClick={e => { e.stopPropagation(); onDeleteNote(n.id); }} style={{ padding: 2, borderRadius: 4, background: T.redSoft, border: 'none', cursor: 'pointer' }}>{Ic(Trash2, isMobile ? 8 : 12, T.red)}</button>
                      )}
                      {n.content && (
                        <button onClick={e => { e.stopPropagation(); setPreviewNote(n); }} style={{ padding: 2, borderRadius: 4, background: T.skySoft, border: 'none', cursor: 'pointer' }}>{Ic(Eye, isMobile ? 8 : 12, T.sky)}</button>
                      )}
                    </div>
                  </div>
                  <h3 style={{ fontSize: isMobile ? 10 : 14, fontWeight: 600, marginBottom: 2, lineHeight: 1.3, paddingRight: n.sample ? 0 : 30, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? 8 : 11, color: T.text3, marginTop: isMobile ? 4 : 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>{Ic(BookOpen, isMobile ? 7 : 10, tc)}{n.subject || 'General'}</span>
                    <span>{(n.words || n.pages * 100 || 0).toLocaleString()}w</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: isMobile ? 4 : 10 }}>
                    <span style={{ fontSize: isMobile ? 8 : 10, color: T.text3 }}>{timeAgo(n.date)}</span>
                    <span style={{ fontSize: isMobile ? 7 : 9, fontWeight: 700, padding: isMobile ? '1px 4px' : '2px 7px', borderRadius: 4, background: `${tc}12`, color: tc }}>{n.type}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: isMobile ? '20px 8px' : '60px 20px', color: T.text3 }}>
              <div style={{ fontSize: isMobile ? 28 : 48, marginBottom: 8 }}>📄</div>
              <p style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>No notes found</p>
              <p style={{ fontSize: isMobile ? 9 : 12 }}>Upload notes to get started</p>
            </div>
          )}

          {/* ══ Upload Modal ══ */}
          {showUpload && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={e => { if (e.target === e.currentTarget) closeUploadModal(); }}>
              <div style={{ 
                width: isMobile ? '100%' : undefined, 
                maxWidth: isMobile ? '100%' : 520, 
                maxHeight: isMobile ? '92vh' : '80vh',
                borderRadius: isMobile ? '20px 20px 0 0' : 20, 
                background: '#FFFFFF', 
                border: isMobile ? 'none' : `1px solid ${T.border}`, 
                boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slide-up .3s ease' 
              }}>
                {/* Handle bar for mobile */}
                {isMobile && <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: '8px auto 0' }} />}
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '12px 16px 10px' : '20px 24px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius: 8, background: T.mintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(Upload, isMobile ? 13 : 18, T.mint)}</div>
                    <div>
                      <h3 style={{ fontSize: isMobile ? 12 : 16, fontWeight: 600, color: T.text }}>Upload Notes</h3>
                      <p style={{ fontSize: isMobile ? 9 : 11, color: T.text3, marginTop: 1 }}>
                        {uploadStep === 'subject' ? 'Step 1 of 2 — Pick subject' : uploadStep === 'file' ? 'Step 2 of 2 — Upload file' : 'Processing...'}
                      </p>
                    </div>
                  </div>
                  <button onClick={closeUploadModal} style={{ width: isMobile ? 26 : 32, height: isMobile ? 26 : 32, borderRadius: 6, background: T.surface2, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(X, isMobile ? 12 : 16, T.text3)}</button>
                </div>

                {/* Content — scrollable */}
                <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px 12px' : '20px 24px', WebkitOverflowScrolling: 'touch' }}>
                  {/* Step 1: Subject Selection */}
                  {uploadStep === 'subject' && (
                    <div>
                      <p style={{ fontSize: isMobile ? 10 : 13, color: T.text2, marginBottom: isMobile ? 10 : 16, lineHeight: 1.4 }}>
                        Which subject? <span style={{ color: T.text3 }}>(helps organize your notes)</span>
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 4 : 8, marginBottom: isMobile ? 8 : 16 }}>
                        {subjectList.map(s => {
                          const active = selectedSubject === s.name;
                          return (
                            <button key={s.name} onClick={() => { setSelectedSubject(s.name); setCustomSubject(''); }}
                              style={{ padding: isMobile ? '6px 2px' : '12px 8px', borderRadius: isMobile ? 8 : 12, border: active ? `2px solid ${s.color}` : `1px solid ${T.border}`, background: active ? `${s.color}10` : T.surface, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 2 : 6, transition: 'all .15s' }}>
                              <span style={{ fontSize: isMobile ? 14 : 22 }}>{s.icon}</span>
                              <span style={{ fontSize: isMobile ? 7 : 10, fontWeight: active ? 700 : 500, color: active ? s.color : T.text2, textAlign: 'center', lineHeight: 1.1 }}>{isMobile ? s.name.split(' ')[0].slice(0,6) : s.name}</span>
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={() => setSelectedSubject('Other')}
                        style={{ width: '100%', padding: isMobile ? '6px 8px' : '10px 14px', borderRadius: 8, border: selectedSubject === 'Other' ? `2px solid ${T.mint}` : `1px solid ${T.border}`, background: selectedSubject === 'Other' ? T.mintSoft : T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: selectedSubject === 'Other' ? 6 : 0 }}>
                        <span style={{ fontSize: isMobile ? 10 : 18 }}>✏️</span>
                        <span style={{ fontSize: isMobile ? 9 : 12, fontWeight: selectedSubject === 'Other' ? 600 : 400, color: selectedSubject === 'Other' ? T.mint : T.text3 }}>Other</span>
                      </button>
                      {selectedSubject === 'Other' && (
                        <input value={customSubject} onChange={e => setCustomSubject(e.target.value)} placeholder="Subject name..."
                          autoFocus style={{ width: '100%', padding: isMobile ? '6px 8px' : '10px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, fontSize: isMobile ? 11 : 13, color: T.text, outline: 'none', marginTop: 6 }} />
                      )}
                    </div>
                  )}

                  {/* Step 2: File Upload */}
                  {uploadStep === 'file' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: isMobile ? 10 : 16, padding: isMobile ? '6px 8px' : '10px 14px', borderRadius: 8, background: T.bg2 }}>
                        <span style={{ fontSize: isMobile ? 12 : 16 }}>{subjectList.find(s => s.name === selectedSubject)?.icon || '📚'}</span>
                        <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 600, color: T.text }}>{selectedSubject === 'Other' ? customSubject : selectedSubject}</span>
                        <button onClick={() => setUploadStep('subject')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? 9 : 11, color: T.mint, fontWeight: 600 }}>Change</button>
                      </div>
                      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                        onClick={() => { const f = document.createElement('input'); f.type = 'file'; f.accept = '.pdf,.txt,.docx,.png,.jpg,.jpeg,.bmp,.webp'; f.onchange = e => { if (e.target.files[0]) handleFile(e.target.files[0]); }; f.click(); }}
                        style={{ padding: isMobile ? '20px 12px' : '44px 24px', borderRadius: isMobile ? 10 : 16, background: dragOver ? T.mintSoft : T.bg2, border: `2px dashed ${dragOver ? T.mint : T.borderLight}`, textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}>
                        <div style={{ width: isMobile ? 32 : 52, height: isMobile ? 32 : 52, borderRadius: 12, background: dragOver ? T.mintGlow : T.mintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>{Ic(Upload, isMobile ? 16 : 24, dragOver ? T.mint : T.text3)}</div>
                        <p style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600, color: dragOver ? T.mint : T.text, marginBottom: 2 }}>{dragOver ? 'Drop it here!' : 'Tap to upload'}</p>
                        <p style={{ fontSize: isMobile ? 9 : 12, color: T.text3 }}>PDF, TXT, DOCX</p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Uploading */}
                  {uploadStep === 'uploading' && (
                    <div style={{ textAlign: 'center', padding: isMobile ? '20px 8px' : '30px 20px' }}>
                      <div style={{ width: isMobile ? 36 : 48, height: isMobile ? 36 : 48, borderRadius: 12, background: T.mintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <div style={{ width: isMobile ? 18 : 24, height: isMobile ? 18 : 24, border: `3px solid ${T.mint}20`, borderTopColor: T.mint, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      </div>
                      <p style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600, color: T.text }}>Processing...</p>
                      <p style={{ fontSize: isMobile ? 9 : 12, color: T.text3, marginTop: 2 }}>Extracting text</p>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div style={{ padding: isMobile ? '8px 12px 12px' : '14px 24px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 6, flexShrink: 0 }}>
                  {uploadStep !== 'uploading' && (
                    <>
                      <GlowButton size="sm" variant="ghost" onClick={uploadStep === 'file' ? () => setUploadStep('subject') : closeUploadModal} style={{ flex: 1 }}>{uploadStep === 'file' ? '← Back' : 'Cancel'}</GlowButton>
                      {uploadStep === 'subject' && (
                        <GlowButton size="sm" icon={ArrowRight} onClick={() => { if (selectedSubject && (selectedSubject !== 'Other' || customSubject.trim())) setUploadStep('file'); }}
                          disabled={!selectedSubject || (selectedSubject === 'Other' && !customSubject.trim())}
                          style={{ flex: 2 }}>Next</GlowButton>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ Preview Modal ══ */}
          {previewNote && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={e => { if (e.target === e.currentTarget) setPreviewNote(null); }}>
              <div style={{ 
                width: isMobile ? '100%' : '90%', 
                maxWidth: isMobile ? '100%' : 640, 
                maxHeight: isMobile ? '85vh' : '80vh',
                borderRadius: isMobile ? '20px 20px 0 0' : 20, 
                background: '#FFFFFF', 
                border: isMobile ? 'none' : `1px solid ${T.border}`, 
                boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column',
                animation: 'slide-up .3s ease' 
              }}>
                {isMobile && <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: '8px auto 0' }} />}
                <div style={{ padding: isMobile ? '10px 14px' : '18px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                    {Ic(FileText, isMobile ? 12 : 18, T.mint)}
                    <h3 style={{ fontSize: isMobile ? 11 : 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewNote.name}</h3>
                  </div>
                  <button onClick={() => setPreviewNote(null)} style={{ width: 26, height: 26, borderRadius: 6, background: T.bg2, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic(X, 14)}</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 10 : 24, fontSize: isMobile ? 11 : 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: T.text, WebkitOverflowScrolling: 'touch' }}>
                  {previewNote.content || 'No content available.'}
                </div>
                <div style={{ padding: isMobile ? '8px 14px 14px' : '14px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 6, justifyContent: 'flex-end', flexShrink: 0 }}>
                  <GlowButton size="sm" variant="ghost" onClick={() => setPreviewNote(null)}>Close</GlowButton>
                  {previewNote.content && (
                    <GlowButton size="sm" onClick={() => { setPreviewNote(null); onOpenNote(previewNote); }}>Study</GlowButton>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function guessSubject(name) {
  const n = name.toLowerCase();
  if (/math|algebra|calcul|geometry|trig/.test(n)) return 'Mathematics';
  if (/physic|mechanic|thermo|optics/.test(n)) return 'Physics';
  if (/chem|organic|inorganic/.test(n)) return 'Chemistry';
  if (/bio|cell|gene|anatomy/.test(n)) return 'Biology';
  if (/cs|program|coding|algorithm|data struct|machine learn|ml|ai/.test(n)) return 'CS';
  if (/hist|war|civil|ancient|modern/.test(n)) return 'History';
  if (/engl|literat|grammar|writing/.test(n)) return 'English';
  return 'General';
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS PAGE
// ═══════════════════════════════════════════════════════════════
function AnalyticsPage({ stats, allNotes, tasks }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const level = Math.floor(stats.xp / 100) + 1;
  const levelProgress = stats.xp % 100;
  const avgScore = stats.quizScores.length > 0 ? Math.round(stats.quizScores.reduce((a,b) => a+b, 0) / stats.quizScores.length) : 0;
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;

  // XP level milestones
  const milestones = [0, 100, 500, 1000, 2500, 5000, 10000];
  const currentMilestone = [...milestones].reverse().find(m => stats.xp >= m) || 0;
  const nextMilestone = milestones.find(m => m > stats.xp) || stats.xp + 1000;
  const milestoneProgress = ((stats.xp - currentMilestone) / (nextMilestone - currentMilestone)) * 100;

  // Subject distribution from notes
  const subjectMap = {};
  allNotes.forEach(n => { const s = n.subject || 'General'; subjectMap[s] = (subjectMap[s] || 0) + 1; });
  const subjectEntries = Object.entries(subjectMap).sort((a,b) => b[1] - a[1]);
  const subjectColors = [T.mint, T.sky, T.violet, T.amber, T.rose, T.indigo, T.green, T.orange];

  return (
    <div style={{ animation: 'slide-up .4s ease', padding: isMobile ? 12 : 0 }}>
      <h1 style={{ fontSize: isMobile ? 17 : 22, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: isMobile ? 16 : 24, display: 'flex', alignItems: 'center', gap: 10 }}>{Ic(BarChart3, isMobile ? 18 : 24, T.mint)} Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 100 : 130}px, 1fr))`, gap: isMobile ? 8 : 12, marginBottom: 24 }}>
        {[
          [Trophy, 'Total XP', stats.xp.toLocaleString(), T.indigo],
          [Flame, 'Streak', `${stats.streak} days`, T.orange],
          [FileText, 'Notes', `${stats.notesUploaded}`, T.mint],
          [Target, 'Quizzes', `${stats.quizzesTaken}`, T.green],
          [Star, 'Avg Score', stats.quizScores.length > 0 ? `${avgScore}%` : '—', T.violet],
          [Zap, 'AI Queries', `${stats.aiQueries}`, T.amber],
        ].map(([Ic2, label, val, color]) => (
          <div key={label} style={{ padding: isMobile ? 10 : 16, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{Ic(Ic2, 16, color)}</div>
            <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, marginBottom: 2 }}>{val}</div>
            <div style={{ fontSize: 10, color: T.text3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div style={{ padding: isMobile ? 16 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>{Ic(Trophy, 16, T.amber)} Level {level} — {stats.xp} XP</h3>
          <span style={{ fontSize: 11, color: T.text3 }}>Next: {nextMilestone.toLocaleString()} XP</span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: T.bg2, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${T.mint}, ${T.emerald})`, width: `${Math.min(milestoneProgress, 100)}%`, transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 10, color: T.text3 }}>{levelProgress}/100 to Level {level + 1}</span>
          <span style={{ fontSize: 10, color: T.text3 }}>{Math.round(milestoneProgress)}% to next milestone</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 16, marginBottom: 16 }}>
        {/* Weekly XP Chart */}
        <div style={{ padding: isMobile ? 16 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, marginBottom: isMobile ? 12 : 16 }}>{Ic(Activity, 14, T.indigo)} Weekly XP</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({ day, xp: stats.weeklyXP[i] || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: T.text3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.text3 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, color: T.text }} />
              <Bar dataKey="xp" fill={T.mint} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div style={{ padding: isMobile ? 16 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, marginBottom: isMobile ? 12 : 16 }}>{Ic(Award, 14, T.green)} Notes by Subject</h3>
          {subjectEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: isMobile ? '24px 0' : '40px 0', color: T.text3, fontSize: 12 }}>
              <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 8 }}>📊</div>
              Upload notes to see subject breakdown
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectEntries.map(([name, count]) => ({ name: name.length > 10 ? name.slice(0, 10) + '…' : name, count }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                <XAxis type="number" tick={{ fontSize: 10, fill: T.text3 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: T.text2 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, color: T.text }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {subjectEntries.map((_, i) => <Cell key={i} fill={subjectColors[i % subjectColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Task Completion & Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 16 }}>
        <div style={{ padding: isMobile ? 16 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, marginBottom: isMobile ? 12 : 16 }}>{Ic(CheckCircle2, 14, T.emerald)} Task Completion</h3>
          <div style={{ textAlign: 'center', padding: isMobile ? '14px 0' : '20px 0' }}>
            <ProgressRing value={totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0} size={100} stroke={8} color={T.emerald} />
            <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, marginTop: 12 }}>{completedTasks}<span style={{ fontSize: isMobile ? 12 : 14, color: T.text3, fontWeight: 400 }}> / {totalTasks}</span></p>
            <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>Tasks completed</p>
          </div>
        </div>
        <div style={{ padding: isMobile ? 16 : 22, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, marginBottom: isMobile ? 12 : 16 }}>{Ic(Sparkles, 14, T.violet)} Study Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Notes uploaded', value: stats.notesUploaded, icon: FileText, color: T.mint },
              { label: 'AI queries made', value: stats.aiQueries, icon: MessageCircle, color: T.sky },
              { label: 'Quizzes completed', value: stats.quizzesTaken, icon: Target, color: T.violet },
              { label: 'Tasks completed', value: stats.tasksCompleted, icon: CheckCircle2, color: T.emerald },
              { label: 'Current streak', value: `${stats.streak} days`, icon: Flame, color: T.orange },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(s.icon, 13, s.color)}</div>
                <span style={{ flex: 1, fontSize: 12, color: T.text2 }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TASKS PAGE — Full CRUD with persistence
// ═══════════════════════════════════════════════════════════════
function TasksPage({ tasks, onToggle, onAdd, onDelete, earnXP, stats }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [editId, setEditId] = useState(null);

  const handleAdd = () => {
    const text = newTask.trim();
    if (!text) return;
    onAdd(text, newPriority);
    earnXP(5, `📝 Created task: ${text.slice(0, 30)}`);
    setNewTask('');
    setNewPriority('medium');
  };

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = tasks.filter(t => t.done).length;
  const priorityColors = { high: T.red, medium: T.amber, low: T.mint };

  return (
    <div style={{ animation: 'slide-up .4s ease', padding: isMobile ? 12 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 16 : 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 17 : 22, fontWeight: 800, letterSpacing: '-0.8px', display: 'flex', alignItems: 'center', gap: 10 }}>{Ic(ClipboardList, isMobile ? 18 : 24, T.mint)} Tasks & Reminders</h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>{doneCount} of {tasks.length} completed · {stats.tasksCompleted} all-time</p>
        </div>
      </div>

      {/* Add Task */}
      <div style={{ padding: isMobile ? 12 : 18, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new task..." style={{ flex: 1, minWidth: isMobile ? 120 : 200, padding: '10px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg2, fontSize: 13, color: T.text, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {['high', 'medium', 'low'].map(p => (
            <button key={p} onClick={() => setNewPriority(p)}
              style={{ padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, border: `1px solid ${newPriority === p ? priorityColors[p] : T.border}`, background: newPriority === p ? `${priorityColors[p]}12` : 'transparent', color: newPriority === p ? priorityColors[p] : T.text3, cursor: 'pointer', transition: 'all .15s' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={handleAdd}
          style={{ padding: '8px 18px', borderRadius: 10, background: `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 600, fontSize: 12, letterSpacing: '-0.2px', boxShadow: `0 2px 8px ${T.mintGlow}`, transition: 'all .15s' }}>
          {Ic(Plus, 14, '#fff')} Add
        </button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'active', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: filter === f ? T.mintSoft : T.surface, color: filter === f ? T.mint : T.text3, border: `1px solid ${filter === f ? T.mintGlow : T.border}`, cursor: 'pointer' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${tasks.length})` : f === 'active' ? `(${tasks.length - doneCount})` : `(${doneCount})`}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '24px 12px' : '40px 20px', color: T.text3, fontSize: 12 }}>
            <div style={{ fontSize: isMobile ? 24 : 32, marginBottom: 8 }}>📋</div>
            {tasks.length === 0 ? 'No tasks yet. Add your first task above!' : 'No tasks match this filter.'}
          </div>
        ) : (
          filtered.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, transition: 'all .2s', opacity: t.done ? 0.6 : 1 }}>
              <button onClick={() => onToggle(t.id)}
                style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${t.done ? T.emerald : T.border}`, background: t.done ? T.emerald : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                {t.done && Ic(CheckCircle2, 14, '#fff')}
              </button>
              <span style={{ flex: 1, fontSize: 13, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? T.text3 : T.text }}>{t.text}</span>
              <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: `${priorityColors[t.priority]}12`, color: priorityColors[t.priority] }}>{t.priority}</span>
              <button onClick={() => onDelete(t.id)} style={{ ...btnBase, width: 24, height: 24, borderRadius: 6, background: T.redSoft }}>{Ic(Trash2, 12, T.red)}</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS PAGE — Clean & Functional
// ═══════════════════════════════════════════════════════════════
function SettingsPage({ stats, settings, onUpdate, darkMode, onToggleDarkMode }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [pendingSettings, setPendingSettings] = useState(() => ({ ...settings }));
  const [dirty, setDirty] = useState(false);
  const level = Math.floor(stats.xp / 100) + 1;
  const levelProgress = stats.xp % 100;

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const update = (key, val) => { setPendingSettings(prev => ({ ...prev, [key]: val })); setDirty(true); };
  const saveChanges = () => { Object.entries(pendingSettings).forEach(([k, v]) => { if (settings[k] !== v) onUpdate(k, v); }); setDirty(false); flashSaved(); };
  const resetChanges = () => { setPendingSettings({ ...settings }); setDirty(false); };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'data', label: 'Data', icon: HardDrive },
  ];

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg2, fontSize: 13, color: T.text, outline: 'none', transition: 'border .2s, box-shadow .2s' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6, display: 'block' };

  const Toggle = ({ val, onChange }) => (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: val ? T.mint : T.surface3, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .25s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: val ? 23 : 3, transition: 'left .25s cubic-bezier(.4,0,.2,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </button>
  );

  const SRow = ({ icon, iconBg, label, desc, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '10px' : '12px 16px', borderRadius: 12, background: T.bg2, border: `1px solid ${T.border}`, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: iconBg || T.mintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
          {desc && <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );

  const Section = ({ title, desc, children }) => (
    <div style={{ padding: isMobile ? 16 : 24, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, marginBottom: 16 }}>
      {title && <div style={{ marginBottom: desc ? 4 : 16 }}><h2 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>{title}</h2>{desc && <p style={{ fontSize: isMobile ? 10 : 12, color: T.text3, marginTop: 2 }}>{desc}</p>}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: title ? 16 : 0 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ animation: 'slide-up .4s ease', padding: isMobile ? 8 : 0, maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 12 : 20 }}>
        <h1 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 2 }}>Settings</h1>
        <p style={{ fontSize: 12, color: T.text3 }}>Manage your profile and preferences</p>
      </div>

      {/* Mobile: horizontal scrollable tabs */}
      {isMobile && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 8, border: 'none', background: active ? T.mintSoft : 'transparent', color: active ? T.mint : T.text3, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap', fontSize: 11, fontWeight: active ? 600 : 400 }}>
                {Ic(tab.icon, 13, active ? T.mint : T.text3)}<span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: isMobile ? 0 : 20 }}>
        {/* Left Sidebar — desktop only */}
        {!isMobile && (
          <div>
            {/* Profile Card */}
            <div style={{ padding: 20, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, marginBottom: 12, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 auto 10px', boxShadow: `0 4px 16px ${T.mintGlow}`, overflow: 'hidden' }}>
                {pendingSettings.avatar ? <img src={pendingSettings.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (pendingSettings.name || 'S')[0].toUpperCase()}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{pendingSettings.name || 'Student'}</h3>
              <p style={{ fontSize: 10, color: T.text3, marginBottom: 10 }}>{pendingSettings.email || 'No email set'}</p>
              <div style={{ background: T.bg2, borderRadius: 8, padding: '6px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: T.mint }}>Level {level}</span>
                  <span style={{ fontSize: 9, color: T.text3 }}>{stats.xp} XP</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: T.border, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${T.mint}, ${T.emerald})`, width: `${levelProgress}%`, transition: 'width .5s' }} />
                </div>
              </div>
            </div>
            {/* Tab list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tabs.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 9, border: 'none', background: active ? T.mintSoft : 'transparent', color: active ? T.mint : T.text3, cursor: 'pointer', transition: 'all .15s', textAlign: 'left', width: '100%' }}>
                    {Ic(tab.icon, 15, active ? T.mint : T.text3)}<span style={{ fontSize: 12, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Content */}
        <div style={{ minWidth: 0 }}>

          {/* ── 1. PROFILE ── */}
          {activeTab === 'profile' && (
            <div style={{ animation: 'slide-up .3s ease' }}>
              {/* Avatar Upload */}
              <div style={{ padding: isMobile ? 16 : 24, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, marginBottom: 16 }}>
                <h2 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, marginBottom: 4 }}>Profile Photo</h2>
                <p style={{ fontSize: isMobile ? 10 : 12, color: T.text3, marginBottom: 16 }}>Upload a photo to personalize your account</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 20, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-upload').click()}>
                    <div style={{ width: isMobile ? 72 : 88, height: isMobile ? 72 : 88, borderRadius: '50%', background: `linear-gradient(135deg, ${T.mint}, ${T.emerald})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: isMobile ? 26 : 32, boxShadow: `0 6px 24px ${T.mintGlow}`, overflow: 'hidden', border: '3px solid #fff' }}>
                      {pendingSettings.avatar ? <img src={pendingSettings.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (pendingSettings.name || 'S')[0].toUpperCase()}
                    </div>
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: T.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      {Ic(Camera, 12, '#fff')}
                    </div>
                    <input id="avatar-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }} onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB'); return; }
                      const reader = new FileReader();
                      reader.onload = ev => { const img = new Image(); img.onload = () => { const canvas = document.createElement('canvas'); const SIZE = 200; canvas.width = SIZE; canvas.height = SIZE; const ctx = canvas.getContext('2d'); const scale = Math.max(SIZE / img.width, SIZE / img.height); const x = (SIZE - img.width * scale) / 2; const y = (SIZE - img.height * scale) / 2; ctx.drawImage(img, x, y, img.width * scale, img.height * scale); update('avatar', canvas.toDataURL('image/jpeg', 0.85)); }; img.src = ev.target.result; };
                      reader.readAsDataURL(file); e.target.value = '';
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: isMobile ? '100%' : 200 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Upload Photo</div>
                    <div style={{ fontSize: 10, color: T.text3, marginBottom: 12, lineHeight: 1.5 }}>JPG, PNG, or WebP. Max 2 MB. Square crop recommended.</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => document.getElementById('avatar-upload').click()} style={{ padding: '7px 16px', borderRadius: 8, background: T.mint, border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, boxShadow: `0 2px 8px ${T.mintGlow}` }}>{Ic(Upload, 12, '#fff')} Upload</button>
                      {pendingSettings.avatar && <button onClick={() => update('avatar', '')} style={{ padding: '7px 16px', borderRadius: 8, background: T.redSoft, border: `1px solid ${T.red}30`, color: T.red, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{Ic(Trash2, 12, T.red)} Remove</button>}
                    </div>
                  </div>
                </div>
              </div>

              <Section title="Profile Details" desc="Update your personal information">
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>Full Name</label><input type="text" value={pendingSettings.name || ''} placeholder="Enter your name" onChange={e => update('name', e.target.value)} style={{ ...inputStyle, borderColor: pendingSettings.name ? T.mint : T.border }} /></div>
                  <div><label style={labelStyle}>Email Address</label><input type="email" value={pendingSettings.email || ''} placeholder="you@university.edu" onChange={e => update('email', e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>University / School</label><input type="text" value={pendingSettings.university || ''} placeholder="e.g. MIT, Stanford" onChange={e => update('university', e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Major / Field</label><input type="text" value={pendingSettings.major || ''} placeholder="e.g. Computer Science" onChange={e => update('major', e.target.value)} style={inputStyle} /></div>
                </div>
              </Section>
            </div>
          )}

          {/* ── 2. PREFERENCES ── */}
          {activeTab === 'preferences' && (
            <div style={{ animation: 'slide-up .3s ease' }}>
              <Section title="Appearance" desc="Customize how the app looks">
                <SRow icon={Ic(darkMode ? Moon : Sun, 15, darkMode ? T.violet : T.amber)} iconBg={darkMode ? T.violetSoft : T.amberSoft} label="Dark Mode" desc="Switch between light and dark theme">
                  <Toggle val={darkMode} onChange={onToggleDarkMode} />
                </SRow>
              </Section>

              <Section title="Language" desc="Language for AI responses">
                <SRow icon={Ic(Globe, 15, T.violet)} iconBg={T.violetSoft} label="Preferred Language" desc="AI will respond in this language">
                  <select value={pendingSettings.language || 'English'} onChange={e => update('language', e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, fontSize: 12, color: T.text, cursor: 'pointer' }}>
                    {['English', 'Urdu', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese', 'Japanese', 'Hindi', 'Arabic', 'Korean'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </SRow>
              </Section>

              <Section title="Study Statistics" desc="Your learning progress at a glance">
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Sessions', value: stats.aiQueries + stats.notesUploaded, color: T.mint },
                    { label: 'Questions', value: stats.aiQueries, color: T.sky },
                    { label: 'Notes', value: stats.notesUploaded, color: T.violet },
                    { label: 'Tasks Done', value: stats.tasksCompleted, color: T.emerald },
                    { label: 'Quizzes', value: stats.quizzesTaken, color: T.amber },
                    { label: 'Streak', value: `${stats.streak}d`, color: T.orange },
                  ].map(s => (
                    <div key={s.label} style={{ padding: 12, borderRadius: 10, background: T.bg2, borderLeft: `3px solid ${s.color}` }}>
                      <div style={{ fontSize: 9, color: T.text3, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 17, fontWeight: 800 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* ── 3. DATA ── */}
          {activeTab === 'data' && (
            <div style={{ animation: 'slide-up .3s ease' }}>
              <Section title="Storage & Cache" desc="Manage app storage">
                <SRow icon={Ic(HardDrive, 15, T.sky)} iconBg={T.skySoft} label="Storage Used" desc="Approximate local storage usage">
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.sky }}>{Math.round(JSON.stringify(localStorage).length / 1024)} KB</span>
                </SRow>
                <SRow icon={Ic(RefreshCw, 15, T.mint)} iconBg={T.mintSoft} label="Clear Cache" desc="Free up browser cache space">
                  <button onClick={() => { if ('caches' in window) caches.keys().then(ks => ks.forEach(k => caches.delete(k))); flashSaved(); }} style={{ padding: '5px 12px', borderRadius: 8, background: T.mintSoft, border: `1px solid ${T.mint}30`, color: T.mint, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Clear</button>
                </SRow>
              </Section>

              <Section title="Export Data" desc="Download your study data">
                <SRow icon={Ic(Download, 15, T.violet)} iconBg={T.violetSoft} label="Download All Data" desc="Export all your data as JSON">
                  <button onClick={() => { const data = { settings, stats, notes: JSON.parse(localStorage.getItem('smartstudy_all_notes') || '[]'), tasks: JSON.parse(localStorage.getItem('smartstudy_tasks') || '[]'), exportDate: new Date().toISOString() }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'smartstudy-data.json'; a.click(); }} style={{ padding: '5px 12px', borderRadius: 8, background: T.violetSoft, border: `1px solid ${T.violet}30`, color: T.violet, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Download</button>
                </SRow>
              </Section>

              {/* Danger Zone */}
              <div style={{ padding: isMobile ? 14 : 20, borderRadius: 16, background: T.surface, border: `1px solid ${T.red}25` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: T.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(AlertTriangle, 16, T.red)}</div>
                  <div><h3 style={{ fontSize: 13, fontWeight: 600, color: T.red }}>Danger Zone</h3><p style={{ fontSize: 10, color: T.text3 }}>Irreversible actions</p></div>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: `${T.red}06`, border: `1px solid ${T.red}15` }}>
                  <p style={{ fontSize: 11, color: T.text2, lineHeight: 1.5 }}>This will permanently delete <strong>all your data</strong> including notes, tasks, XP, and streak. This cannot be undone.</p>
                </div>
                <button onClick={() => setConfirmModal({ title: 'Delete All Data', msg: 'This permanently deletes all notes, tasks, XP, streak, and settings. Are you sure?', action: () => { localStorage.clear(); window.location.reload(); } })} style={{ marginTop: 10, padding: '8px 16px', borderRadius: 8, background: T.redSoft, border: `1px solid ${T.red}30`, color: T.red, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>{Ic(Trash2, 13, T.red)} Delete All Data</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Save / Reset Bar */}
      <div style={{ position: 'sticky', bottom: isMobile ? 56 : 0, left: 0, right: 0, padding: isMobile ? '10px 12px' : '14px 24px', background: `linear-gradient(to top, ${T.surface} 80%, transparent)`, borderTop: dirty ? `1px solid ${T.mint}30` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, zIndex: 20, transition: 'all .25s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {dirty && <div style={{ width: 8, height: 8, borderRadius: 4, background: T.amber, animation: 'glow-pulse 1.5s ease infinite' }} />}
          <span style={{ fontSize: 12, color: dirty ? T.amber : T.text3, fontWeight: dirty ? 600 : 400 }}>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={resetChanges} disabled={!dirty} style={{ padding: '8px 18px', borderRadius: 10, background: dirty ? T.bg2 : T.surface3, border: `1px solid ${dirty ? T.border : 'transparent'}`, color: dirty ? T.text2 : T.text3, fontSize: 12, fontWeight: 600, cursor: dirty ? 'pointer' : 'default', opacity: dirty ? 1 : 0.5 }}>Reset</button>
          <button onClick={saveChanges} disabled={!dirty} style={{ padding: '8px 22px', borderRadius: 10, background: dirty ? T.mint : T.surface3, border: 'none', color: dirty ? '#fff' : T.text3, fontSize: 12, fontWeight: 700, cursor: dirty ? 'pointer' : 'default', boxShadow: dirty ? `0 4px 14px ${T.mintGlow}` : 'none', display: 'flex', alignItems: 'center', gap: 6 }}>{Ic(CheckCircle2, 14, dirty ? '#fff' : T.text3)} Save Changes</button>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: 16 }} onClick={() => setConfirmModal(null)}>
          <div style={{ width: '100%', maxWidth: 400, borderRadius: 18, background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'slide-up .2s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: T.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(AlertTriangle, 18, T.red)}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.red }}>{confirmModal.title}</h3>
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 20 }}>{confirmModal.msg}</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmModal(null)} style={{ padding: '8px 20px', borderRadius: 10, background: T.bg2, border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={confirmModal.action} style={{ padding: '8px 20px', borderRadius: 10, background: T.red, border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORT TO PDF UTILITY
// ═══════════════════════════════════════════════════════════════
function exportToPDF(title, content) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, 20, 25);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const lines = doc.splitTextToSize(content, 170);
  let y = 40;
  for (const line of lines) {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.text(line, 20, y);
    y += 6;
  }
  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

// ═══════════════════════════════════════════════════════════════
// ACHIEVEMENTS DATA
// ═══════════════════════════════════════════════════════════════
const ACHIEVEMENTS = [
  { id: 'first_upload', icon: '📄', title: 'First Upload', desc: 'Upload your first notes', check: (s) => s.notesUploaded >= 1 },
  { id: 'notes_5', icon: '📚', title: 'Bookworm', desc: 'Upload 5 notes', check: (s) => s.notesUploaded >= 5 },
  { id: 'notes_20', icon: '📖', title: 'Knowledge Seeker', desc: 'Upload 20 notes', check: (s) => s.notesUploaded >= 20 },
  { id: 'ai_10', icon: '🤖', title: 'AI Explorer', desc: 'Ask 10 AI questions', check: (s) => s.aiQueries >= 10 },
  { id: 'ai_50', icon: '🧠', title: 'AI Master', desc: 'Ask 50 AI questions', check: (s) => s.aiQueries >= 50 },
  { id: 'xp_100', icon: '⭐', title: 'Rising Star', desc: 'Earn 100 XP', check: (s) => s.xp >= 100 },
  { id: 'xp_500', icon: '🌟', title: 'Superstar', desc: 'Earn 500 XP', check: (s) => s.xp >= 500 },
  { id: 'xp_1000', icon: '👑', title: 'Champion', desc: 'Earn 1000 XP', check: (s) => s.xp >= 1000 },
  { id: 'streak_3', icon: '🔥', title: 'On Fire', desc: '3-day study streak', check: (s) => s.streak >= 3 },
  { id: 'streak_7', icon: '💪', title: 'Unstoppable', desc: '7-day study streak', check: (s) => s.streak >= 7 },
  { id: 'streak_30', icon: '🏆', title: 'Legend', desc: '30-day study streak', check: (s) => s.streak >= 30 },
  { id: 'tasks_5', icon: '✅', title: 'Getting Things Done', desc: 'Complete 5 tasks', check: (s) => s.tasksCompleted >= 5 },
  { id: 'tasks_20', icon: '🎯', title: 'Task Master', desc: 'Complete 20 tasks', check: (s) => s.tasksCompleted >= 20 },
  { id: 'quiz_1', icon: '🤔', title: 'Quiz Taker', desc: 'Complete your first quiz', check: (s) => s.quizzesTaken >= 1 },
  { id: 'quiz_10', icon: '🎓', title: 'Quiz Champion', desc: 'Complete 10 quizzes', check: (s) => s.quizzesTaken >= 10 },
];

// ═══════════════════════════════════════════════════════════════
// TEXT-TO-SPEECH UTILITY
// ═══════════════════════════════════════════════════════════════
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/[•|📊🎯📖🔑💡📝🧠⚠️❌✅⭐🌟👍📈📋🤔]/g, ''));
    u.rate = 0.9; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }
}
function stopSpeaking() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
function LoginPage({ onLogin, onGoRegister }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;

  const socialLogin = (email, name) => {
    // Clear old user data for fresh session
    ['smartstudy_user', 'smartstudy_settings', 'smartstudy_all_notes', 'smartstudy_stats_v2',
      'smartstudy_tasks', 'smartstudy_activities', 'smartstudy_voice_notes', 'smartstudy_planner_v2',
      'smartstudy_subjects', 'smartstudy_exams', 'smartstudy_ai_history', 'smartstudy_last_seen_notif'
    ].forEach(k => localStorage.removeItem(k));
    const u = { email, name, loggedInAt: Date.now() };
    localStorage.setItem('smartstudy_user', JSON.stringify(u));
    const freshSettings = { name, email, language: 'English', notifications: true, aiModel: 'Default', difficulty: 'Medium', dailyGoalHours: 4, pomodoroMinutes: 25, breakMinutes: 5, focusMode: false };
    localStorage.setItem('smartstudy_settings', JSON.stringify(freshSettings));
    onLogin(u);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
    setError('');
    setLoading(true);
    // If different user, clear old data
    try {
      const prev = JSON.parse(localStorage.getItem('smartstudy_user'));
      if (prev && prev.email !== email.trim()) {
        ['smartstudy_settings', 'smartstudy_all_notes', 'smartstudy_stats_v2',
          'smartstudy_tasks', 'smartstudy_activities', 'smartstudy_voice_notes', 'smartstudy_planner_v2',
          'smartstudy_subjects', 'smartstudy_exams', 'smartstudy_ai_history', 'smartstudy_last_seen_notif'
        ].forEach(k => localStorage.removeItem(k));
      }
    } catch {}
    const userData = { email: email.trim(), name: email.trim().split('@')[0], loggedInAt: Date.now() };
    localStorage.setItem('smartstudy_user', JSON.stringify(userData));
    const freshSettings = { name: userData.name, email: userData.email, language: 'English', notifications: true, aiModel: 'Default', difficulty: 'Medium', dailyGoalHours: 4, pomodoroMinutes: 25, breakMinutes: 5, focusMode: false };
    localStorage.setItem('smartstudy_settings', JSON.stringify(freshSettings));
    setTimeout(() => { setLoading(false); onLogin(userData); }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f8fffe' }}>
      {/* Left Panel — Animated Gradient */}
      {!isMobile && (
        <div style={{ flex: 1, background: 'linear-gradient(160deg, #0d9f5c 0%, #32C971 30%, #10B981 60%, #059669 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, position: 'relative', overflow: 'hidden' }}>
          {/* Floating orbs */}
          <div style={{ position: 'absolute', top: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: 'hero-float 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'hero-float 6s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', top: '40%', right: '8%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'hero-float 10s ease-in-out infinite 1s' }} />
          {/* Grid pattern overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 440 }}>
            <div style={{ width: 88, height: 88, borderRadius: 28, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 36px', border: '1.5px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              {Ic(Brain, 40, '#fff')}
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-2px', marginBottom: 16, lineHeight: 1.1 }}>Welcome<br />Back!</h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>Continue your learning journey with AI-powered study tools.</p>

            <div style={{ display: 'flex', gap: 24, marginTop: 48, justifyContent: 'center' }}>
              {[{ v: '10K+', l: 'Students', e: '🎓' }, { v: '50K+', l: 'Notes', e: '📄' }, { v: '4.9★', l: 'Rating', e: '⭐' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ fontSize: 14, marginBottom: 2 }}>{s.e}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: isMobile ? 24 : 60, position: 'relative', background: '#f8fffe' }}>
        {/* Back button — clean circular */}
        <button onClick={() => onGoRegister('landing')}
          style={{ position: 'absolute', top: 24, left: 24, width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s cubic-bezier(.4,0,.2,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#32C971'; e.currentTarget.style.borderColor = '#32C971'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(50,201,113,0.3)'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.querySelector('svg').style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.querySelector('svg').style.color = '#374151'; }}
          aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#374151', transition: 'color .3s' }}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 44 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #32C971, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(50,201,113,0.35)' }}>{Ic(Brain, 22, '#fff')}</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#0f172a', letterSpacing: '-0.5px' }}>Smart<span style={{ color: '#32C971' }}>Study</span> AI</span>
          </div>

          <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-1.2px', marginBottom: 8 }}>Sign in</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32, lineHeight: 1.5 }}>Welcome back! Enter your credentials to continue.</p>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 12, fontWeight: 500, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, animation: 'slide-up .2s ease' }}>
              {Ic(AlertTriangle, 14, '#EF4444')} {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Mail, 16, '#94a3b8')}</div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu"
                  style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#0f172a', outline: 'none', transition: 'border .2s, box-shadow .2s', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                  onFocus={e => { e.target.style.borderColor = '#32C971'; e.target.style.boxShadow = '0 0 0 4px rgba(50,201,113,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }} />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Password</label>
                <button type="button" style={{ fontSize: 11, color: '#32C971', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Lock, 16, '#94a3b8')}</div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ width: '100%', padding: '13px 42px 13px 42px', borderRadius: 14, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#0f172a', outline: 'none', transition: 'border .2s, box-shadow .2s', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                  onFocus={e => { e.target.style.borderColor = '#32C971'; e.target.style.boxShadow = '0 0 0 4px rgba(50,201,113,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                  {Ic(showPassword ? Eye : Eye, 16)}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <button type="button" onClick={() => setRemember(!remember)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${remember ? '#32C971' : '#D1D5DB'}`, background: remember ? '#32C971' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s', boxShadow: remember ? '0 2px 8px rgba(50,201,113,0.3)' : 'none' }}>
                  {remember && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                Remember me
              </button>
            </div>

            {/* Submit — Premium gradient button with shine effect */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '15px 0', borderRadius: 14, background: loading ? '#94a3b8' : 'linear-gradient(135deg, #32C971 0%, #10B981 50%, #059669 100%)', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: loading ? 'none' : '0 6px 28px rgba(50,201,113,0.35), inset 0 1px 0 rgba(255,255,255,0.2)', transition: 'all .35s cubic-bezier(.4,0,.2,1)', position: 'relative', overflow: 'hidden', letterSpacing: '0.2px' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(50,201,113,0.45), inset 0 1px 0 rgba(255,255,255,0.2)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(50,201,113,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'; }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} /> Signing in...</span> : <>Sign In {Ic(ArrowRight, 18, '#fff')}</>}
            </button>
          </form>

          {/* Register link */}
          <div style={{ textAlign: 'center', marginTop: 28, padding: 16, borderRadius: 14, background: 'rgba(50,201,113,0.04)', border: '1px solid rgba(50,201,113,0.08)' }}>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Don't have an account?{' '}
              <button onClick={() => onGoRegister('register')} style={{ color: '#32C971', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Create account →</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGISTER PAGE
// ═══════════════════════════════════════════════════════════════
function RegisterPage({ onLogin, onGoLogin }) {
  const ww = useWindowWidth();
  const isMobile = ww < 768;

  const socialLogin = (email, name) => {
    ['smartstudy_user', 'smartstudy_settings', 'smartstudy_all_notes', 'smartstudy_stats_v2',
      'smartstudy_tasks', 'smartstudy_activities', 'smartstudy_voice_notes', 'smartstudy_planner_v2',
      'smartstudy_subjects', 'smartstudy_exams', 'smartstudy_ai_history', 'smartstudy_last_seen_notif'
    ].forEach(k => localStorage.removeItem(k));
    const u = { email, name, loggedInAt: Date.now() };
    localStorage.setItem('smartstudy_user', JSON.stringify(u));
    const freshSettings = { name, email, language: 'English', notifications: true, aiModel: 'Default', difficulty: 'Medium', dailyGoalHours: 4, pomodoroMinutes: 25, breakMinutes: 5, focusMode: false };
    localStorage.setItem('smartstudy_settings', JSON.stringify(freshSettings));
    onLogin(u);
  };

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Please fill in all fields'); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (!agreeTerms) { setError('Please agree to the terms'); return; }
    setError('');
    setLoading(true);
    // Clear ALL previous user data for a fresh account
    ['smartstudy_user', 'smartstudy_settings', 'smartstudy_all_notes', 'smartstudy_stats_v2',
      'smartstudy_tasks', 'smartstudy_activities', 'smartstudy_voice_notes', 'smartstudy_planner_v2',
      'smartstudy_subjects', 'smartstudy_exams', 'smartstudy_ai_history', 'smartstudy_last_seen_notif'
    ].forEach(k => localStorage.removeItem(k));
    // Set fresh user and settings
    const userData = { email: form.email.trim(), name: form.name.trim(), loggedInAt: Date.now() };
    localStorage.setItem('smartstudy_user', JSON.stringify(userData));
    const freshSettings = { name: form.name.trim(), email: form.email.trim(), language: 'English', notifications: true, aiModel: 'Default', difficulty: 'Medium', dailyGoalHours: 4, pomodoroMinutes: 25, breakMinutes: 5, focusMode: false };
    localStorage.setItem('smartstudy_settings', JSON.stringify(freshSettings));
    setTimeout(() => { setLoading(false); onLogin(userData); }, 800);
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['#E5E7EB', '#EF4444', '#FBBF24', '#32C971'];
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f8fffe' }}>
      {/* Left Panel */}
      {!isMobile && (
        <div style={{ flex: 1, background: 'linear-gradient(160deg, #059669 0%, #10B981 30%, #32C971 60%, #34D399 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', animation: 'hero-float 7s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'hero-float 9s ease-in-out infinite 1.5s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
            <div style={{ width: 88, height: 88, borderRadius: 28, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 36px', border: '1.5px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: 40 }}>🚀</span>
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-2px', marginBottom: 16, lineHeight: 1.1 }}>Start Your<br />Journey!</h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>Join thousands of students learning smarter with AI-powered tools.</p>

            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', maxWidth: 300, margin: '40px auto 0' }}>
              {['AI-powered explanations', 'Smart flashcards & quizzes', 'Study planner & analytics', 'Notes OCR & PDF export'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: 500 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.12)' }}>{Ic(CheckCircle2, 13, '#fff')}</div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: isMobile ? 24 : 60, position: 'relative', background: '#f8fffe' }}>
        <button onClick={() => onGoLogin('landing')}
          style={{ position: 'absolute', top: 24, left: 24, width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s cubic-bezier(.4,0,.2,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#32C971'; e.currentTarget.style.borderColor = '#32C971'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(50,201,113,0.3)'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.querySelector('svg').style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.querySelector('svg').style.color = '#374151'; }}
          aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#374151', transition: 'color .3s' }}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #32C971, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(50,201,113,0.35)' }}>{Ic(Brain, 22, '#fff')}</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#0f172a', letterSpacing: '-0.5px' }}>Smart<span style={{ color: '#32C971' }}>Study</span> AI</span>
          </div>

          <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-1.2px', marginBottom: 8 }}>Create account</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>Step {step} of 2 — {step === 1 ? 'Your details' : 'Set your password'}</p>

          {/* Progress steps — premium */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: step >= s ? 'linear-gradient(135deg, #32C971, #10B981)' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= s ? '#fff' : '#94a3b8', fontSize: 11, fontWeight: 700, transition: 'all .3s', boxShadow: step >= s ? '0 2px 8px rgba(50,201,113,0.3)' : 'none', flexShrink: 0 }}>{s}</div>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: step > s ? 'linear-gradient(90deg, #32C971, #10B981)' : '#E5E7EB', transition: 'background .3s' }} />
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 12, fontWeight: 500, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, animation: 'slide-up .2s ease' }}>
              {Ic(AlertTriangle, 14, '#EF4444')} {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>{Ic(User, 16, '#94a3b8')}</div>
                  <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Enter your full name"
                    style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#0f172a', outline: 'none', transition: 'border .2s, box-shadow .2s', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onFocus={e => { e.target.style.borderColor = '#32C971'; e.target.style.boxShadow = '0 0 0 4px rgba(50,201,113,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }} />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Mail, 16, '#94a3b8')}</div>
                  <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="you@university.edu"
                    style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#0f172a', outline: 'none', transition: 'border .2s, box-shadow .2s', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onFocus={e => { e.target.style.borderColor = '#32C971'; e.target.style.boxShadow = '0 0 0 4px rgba(50,201,113,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }} />
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block' }}>University / School <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>{Ic(GraduationCap, 16, '#94a3b8')}</div>
                  <input type="text" value={form.university || ''} onChange={e => updateForm('university', e.target.value)} placeholder="e.g. MIT, Stanford"
                    style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#0f172a', outline: 'none', transition: 'border .2s, box-shadow .2s', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onFocus={e => { e.target.style.borderColor = '#32C971'; e.target.style.boxShadow = '0 0 0 4px rgba(50,201,113,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }} />
                </div>
              </div>

              <button type="submit"
                style={{ width: '100%', padding: '15px 0', borderRadius: 14, background: 'linear-gradient(135deg, #32C971 0%, #10B981 50%, #059669 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 28px rgba(50,201,113,0.35), inset 0 1px 0 rgba(255,255,255,0.2)', transition: 'all .35s cubic-bezier(.4,0,.2,1)', letterSpacing: '0.2px' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(50,201,113,0.45), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(50,201,113,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'; }}>
                Continue {Ic(ArrowRight, 18, '#fff')}
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Lock, 16, '#94a3b8')}</div>
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => updateForm('password', e.target.value)} placeholder="Min 6 characters"
                    style={{ width: '100%', padding: '13px 42px 13px 42px', borderRadius: 14, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#0f172a', outline: 'none', transition: 'border .2s, box-shadow .2s', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onFocus={e => { e.target.style.borderColor = '#32C971'; e.target.style.boxShadow = '0 0 0 4px rgba(50,201,113,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                    {Ic(showPassword ? Eye : Eye, 16)}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < strength ? strengthColors[strength] : '#E5E7EB', transition: 'background .3s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: strengthColors[strength], fontWeight: 700 }}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Lock, 16, '#94a3b8')}</div>
                  <input type="password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} placeholder="Repeat your password"
                    style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#0f172a', outline: 'none', transition: 'border .2s, box-shadow .2s', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onFocus={e => { e.target.style.borderColor = '#32C971'; e.target.style.boxShadow = '0 0 0 4px rgba(50,201,113,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }} />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <div style={{ fontSize: 10, color: '#EF4444', marginTop: 4, fontWeight: 600 }}>✗ Passwords don't match</div>
                )}
              </div>

              {/* Terms */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 28 }}>
                <button type="button" onClick={() => setAgreeTerms(!agreeTerms)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${agreeTerms ? '#32C971' : '#D1D5DB'}`, background: agreeTerms ? '#32C971' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1, transition: 'all .25s', boxShadow: agreeTerms ? '0 2px 8px rgba(50,201,113,0.3)' : 'none' }}>
                  {agreeTerms && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </button>
                <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>I agree to the <span style={{ color: '#32C971', fontWeight: 700, cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: '#32C971', fontWeight: 700, cursor: 'pointer' }}>Privacy Policy</span></span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(1)}
                  style={{ padding: '14px 24px', borderRadius: 14, background: '#fff', color: '#64748b', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all .25s', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#32C971'; e.currentTarget.style.color = '#32C971'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#64748b'; }}>
                  Back
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: '14px 0', borderRadius: 14, background: loading ? '#94a3b8' : 'linear-gradient(135deg, #32C971 0%, #10B981 50%, #059669 100%)', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: loading ? 'none' : '0 6px 28px rgba(50,201,113,0.35), inset 0 1px 0 rgba(255,255,255,0.2)', transition: 'all .35s cubic-bezier(.4,0,.2,1)', letterSpacing: '0.2px' }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(50,201,113,0.45), inset 0 1px 0 rgba(255,255,255,0.2)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(50,201,113,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'; }}>
                  {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} /> Creating...</span> : <>Create Account 🚀</>}
                </button>
              </div>
            </form>
          )}

          {/* Login link */}
          <div style={{ textAlign: 'center', marginTop: 28, padding: 16, borderRadius: 14, background: 'rgba(50,201,113,0.04)', border: '1px solid rgba(50,201,113,0.08)' }}>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Already have an account?{' '}
              <button onClick={() => onGoLogin('login')} style={{ color: '#32C971', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Sign in →</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState('landing');
  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(localStorage.getItem('smartstudy_user')); } catch { return null; } });
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lastSeenNotif, setLastSeenNotif] = useState(() => { try { return parseInt(localStorage.getItem('smartstudy_last_seen_notif')) || 0; } catch { return 0; } });
  const [notes, setNotes] = useState(null);
  const [allNotes, setAllNotes] = useState(() => loadAllNotes());
  const [stats, setStats] = useState(() => loadStats());
  const [tasks, setTasks] = useState(() => loadTasks());
  const [activities, setActivities] = useState(() => loadActivities());
  const [userSettings, setUserSettings] = useState(() => loadSettings());
  const [darkMode, setDarkMode] = useState(() => { try { return JSON.parse(localStorage.getItem('smartstudy_dark')) === true; } catch { return false; } });
  const [cmdPalette, setCmdPalette] = useState(false);
  const notifRef = useRef();
  const ww = useWindowWidth();
  const isMobile = ww < 768;
  const isTablet = ww >= 768 && ww < 1024;
  const theme = darkMode ? DARK : T;

  // Persist dark mode
  useEffect(() => { localStorage.setItem('smartstudy_dark', JSON.stringify(darkMode)); }, [darkMode]);

  // Persist on change
  useEffect(() => { saveAllNotes(allNotes); }, [allNotes]);
  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveSettings(userSettings); }, [userSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdPalette(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); setPage('notes'); }
      if (e.key === 'Escape') { setCmdPalette(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setUserSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper: add XP with reason
  const earnXP = useCallback((amount, reason) => {
    addXP(amount, reason, stats, setStats, setActivities);
  }, [stats]);

  const addNote = useCallback((note) => {
    setAllNotes(prev => [note, ...prev]);
    setStats(prev => { const u = { ...prev, notesUploaded: prev.notesUploaded + 1 }; saveStats(u); return u; });
  }, []);
  const deleteNote = useCallback((id) => { setAllNotes(prev => prev.filter(n => n.id !== id)); }, []);
  const openNoteForStudy = useCallback((note) => {
    setNotes({ name: note.name, content: note.content, wc: note.words });
    setPage('study-tools');
  }, []);
  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nowDone = !t.done;
        if (nowDone) {
          setStats(prev2 => { const u = { ...prev2, tasksCompleted: prev2.tasksCompleted + 1 }; saveStats(u); return u; });
          addXP(10, `✅ Completed task: ${t.text}`, stats, setStats, setActivities);
        }
        return { ...t, done: nowDone };
      }
      return t;
    }));
  }, [stats]);
  const addTask = useCallback((text, priority) => {
    const t = { id: Date.now().toString(36), text, priority, done: false, created: new Date().toISOString() };
    setTasks(prev => [t, ...prev]);
    setStats(prev => { const u = { ...prev, tasksCreated: prev.tasksCreated + 1 }; saveStats(u); return u; });
  }, []);
  const deleteTask = useCallback((id) => { setTasks(prev => prev.filter(t => t.id !== id)); }, []);

  // Track AI queries
  const trackAIQuery = useCallback(() => {
    setStats(prev => { const u = { ...prev, aiQueries: prev.aiQueries + 1 }; saveStats(u); return u; });
  }, []);

  useEffect(() => { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); return () => s.remove(); }, []);
  useEffect(() => { const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) { setNotifOpen(false); setProfileOpen(false); } }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  const enter = () => setPage('dashboard');
  const handleLogin = (userData) => { setCurrentUser(userData); if (userData.name) { setUserSettings(prev => ({ ...prev, name: userData.name })); } setPage('dashboard'); };

  if (page === 'landing') return <Landing onEnter={() => setPage('login')} />;
  if (page === 'login') return <LoginPage onLogin={handleLogin} onGoRegister={setPage} />;
  if (page === 'register') return <RegisterPage onLogin={handleLogin} onGoLogin={setPage} />;

  const currentPage = page;
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage setPage={setPage} onUploadNotes={setNotes} allNotes={allNotes} onAddNote={addNote} stats={stats} earnXP={earnXP} userSettings={userSettings} />;
      case 'study-tools': return <StudyToolsPage notes={notes} onClearNotes={() => setNotes(null)} onUploadNotes={n => setNotes(n)} onAddNote={addNote} stats={stats} earnXP={earnXP} trackAIQuery={trackAIQuery} language={userSettings.language} />;
      case 'ai-chat': return <AIChatPage stats={stats} earnXP={earnXP} trackAIQuery={trackAIQuery} language={userSettings.language} />;
      case 'planner': return <PlannerPage language={userSettings.language} />;
      case 'notes': return <NotesPage allNotes={allNotes} onDeleteNote={deleteNote} onOpenNote={openNoteForStudy} setPage={setPage} onUploadNotes={setNotes} onAddNote={addNote} earnXP={earnXP} language={userSettings.language} />;
      case 'analytics': return <AnalyticsPage stats={stats} allNotes={allNotes} tasks={tasks} />;
      case 'tasks': return <TasksPage tasks={tasks} onToggle={toggleTask} onAdd={addTask} onDelete={deleteTask} earnXP={earnXP} stats={stats} />;
      case 'settings': return <SettingsPage stats={stats} settings={userSettings} onUpdate={updateSetting} darkMode={darkMode} onToggleDarkMode={() => { const nv = !darkMode; setDarkMode(nv); localStorage.setItem('smartstudy_dark', JSON.stringify(nv)); }} />;
      default: return <DashboardPage setPage={setPage} onUploadNotes={setNotes} allNotes={allNotes} onAddNote={addNote} stats={stats} earnXP={earnXP} userSettings={userSettings} />;
    }
  };

  const notifCount = activities.filter(a => {
    const t = new Date(a.time).getTime();
    return t > lastSeenNotif && (Date.now() - t) < 86400000;
  }).length;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, paddingBottom: isMobile ? 60 : 0, overflowX: 'hidden', maxWidth: '100vw' }}>
      {/* Sidebar — desktop only */}
      {!isMobile && (
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: (collapsed || isTablet) ? 72 : 260, background: theme.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width .25s cubic-bezier(.4,0,.2,1)', zIndex: 50 }}>
        <div style={{ height: 68, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic(Brain, 18, '#fff')}</div>
          {!(collapsed || isTablet) && <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.5px', whiteSpace: 'nowrap', color: '#fff' }}>SmartStudy<span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}> AI</span></span>}
        </div>
        <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {SIDEBAR_ITEMS.map(item => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{ width: '100%', padding: (collapsed || isTablet) ? '12px 0' : '11px 14px', borderRadius: 12, fontSize: 13.5, fontWeight: active ? 600 : 400, background: active ? 'rgba(255,255,255,0.22)' : 'transparent', color: '#fff', border: active ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, justifyContent: (collapsed || isTablet) ? 'center' : 'flex-start', transition: 'all .15s' }}>
                {Ic(item.icon, 20, '#fff')}
                {!(collapsed || isTablet) && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
          {!isTablet && <button onClick={() => { setCollapsed(!collapsed); }}
            style={{ width: '100%', padding: collapsed ? '12px 0' : '11px 14px', borderRadius: 12, fontSize: 13, background: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            {Ic(ChevronLeft, 18, 'rgba(255,255,255,0.7)')} {!collapsed && 'Collapse'}
          </button>}
          <button onClick={() => setPage('landing')}
            style={{ width: '100%', padding: (collapsed || isTablet) ? '12px 0' : '11px 14px', borderRadius: 12, fontSize: 13, background: 'transparent', color: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, justifyContent: (collapsed || isTablet) ? 'center' : 'flex-start' }}>
            {Ic(LogOut, 18, 'rgba(255,255,255,0.85)')} {!(collapsed || isTablet) && 'Logout'}
          </button>
        </div>
      </aside>
      )}

      {/* Main content */}
      <div style={{ marginLeft: isMobile ? 0 : ((collapsed || isTablet) ? 72 : 260), minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: isMobile ? '100vw' : undefined, overflowX: 'hidden' }}>
        {/* Top bar */}
        <header style={{ position: 'sticky', top: 0, height: isMobile ? 56 : 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 12px' : '0 24px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, background: theme.surface, boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.04)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            {isMobile && <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${theme.mint}, ${theme.emerald})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic(Brain, 14, '#fff')}</div>}
            <h2 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, letterSpacing: '-0.3px', color: theme.text }}>{isMobile ? (SIDEBAR_ITEMS.find(i => i.id === page)?.label || '') : (SIDEBAR_ITEMS.find(i => i.id === page)?.label || 'Dashboard')}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }} ref={notifRef}>
            <button onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Light mode' : 'Dark mode'}
              style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 10, background: theme.surface2, border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Ic(darkMode ? Sun : Moon, isMobile ? 14 : 16, theme.text2)}
            </button>
            {!isMobile && <div style={{ position: 'relative' }}>
              <input placeholder="Search... (Ctrl+K)" onClick={() => setCmdPalette(true)} readOnly style={{ width: isTablet ? 140 : 180, padding: '7px 12px 7px 32px', borderRadius: 8, background: theme.bg2, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 12, outline: 'none', cursor: 'pointer' }} />
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>{Ic(Search, 13, theme.text3)}</div>
            </div>}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); if (!notifOpen) { const now = Date.now(); setLastSeenNotif(now); localStorage.setItem('smartstudy_last_seen_notif', String(now)); } }}
                style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 10, background: theme.surface2, border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {Ic(Bell, isMobile ? 14 : 16, theme.text2)}
                {notifCount > 0 && <div style={{ position: 'absolute', top: 4, right: 4, minWidth: 14, height: 14, borderRadius: 7, background: theme.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', padding: '0 3px' }}>{notifCount}</div>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 44, right: 0, width: isMobile ? 280 : 320, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.06)', zIndex: 100, animation: 'slide-up .2s ease' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Activity</span>
                    <span style={{ fontSize: 10, color: theme.text3 }}>{activities.length}</span>
                  </div>
                  {activities.length === 0 ? (
                    <div style={{ padding: 28, textAlign: 'center', color: theme.text3, fontSize: 12 }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                      No activity yet.
                    </div>
                  ) : (
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                      {activities.slice(0, 6).map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < Math.min(activities.length, 6) - 1 ? `1px solid ${theme.border}` : 'none' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${a.color || theme.mint}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {a.xp ? <span style={{ fontSize: 10, fontWeight: 700, color: a.color || theme.mint }}>+{a.xp}</span> : Ic(Bell, 12, a.color || theme.mint)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, color: theme.text, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.text}</div>
                            <div style={{ fontSize: 9, color: theme.text3, marginTop: 2 }}>{timeAgo(a.time)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!isMobile && <div style={{ position: 'relative' }}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${theme.mint}, ${theme.emerald})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', overflow: 'hidden', padding: 0 }}>
                {userSettings.avatar ? <img src={userSettings.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userSettings.name ? userSettings.name[0].toUpperCase() : 'S')}
              </button>
              {profileOpen && (
                <div style={{ position: 'absolute', top: 44, right: 0, width: 200, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.06)', zIndex: 100, animation: 'slide-up .2s ease' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{userSettings.name || 'Student'}</p>
                    <p style={{ fontSize: 11, color: theme.text3 }}>{userSettings.email || 'Add email in settings'}</p>
                  </div>
                  {[
                    [User, 'Profile', () => setPage('settings')],
                    [Settings, 'Settings', () => setPage('settings')],
                    [LogOut, 'Logout', () => { localStorage.removeItem('smartstudy_user'); setCurrentUser(null); setPage('landing'); }],
                  ].map(([Ic2, label, fn]) => (
                    <button key={label} onClick={() => { fn(); setProfileOpen(false); }}
                      style={{ width: '100%', padding: '10px 16px', fontSize: 12, background: 'transparent', color: label === 'Logout' ? theme.red : theme.text2, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                      {Ic(Ic2, 14, label === 'Logout' ? theme.red : theme.text3)} {label}
                    </button>
                  ))}
                </div>
              )}
            </div>}
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: isMobile ? '8px 6px' : 24, paddingBottom: isMobile ? 72 : 24, background: theme.bg, minHeight: 'calc(100vh - 120px)', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
          {renderPage()}
        </main>
      </div>

      {/* Bottom Tab Bar — mobile only */}
      {isMobile && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, background: theme.surface, borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 200, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', padding: '0 2px', gap: 0 }}>
          {SIDEBAR_ITEMS.map(item => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', borderRadius: 8, color: active ? theme.mint : theme.text3, transition: 'all .15s', flex: '1 1 0', minWidth: 0 }}>
                {Ic(item.icon, 18, active ? theme.mint : theme.text3)}
                <span style={{ fontSize: 8, fontWeight: active ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Command Palette */}
      {cmdPalette && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: isMobile ? '10vh' : '15vh', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setCmdPalette(false)}>
          <div style={{ width: '100%', maxWidth: 520, margin: isMobile ? '0 12px' : 0, borderRadius: 18, background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'slide-up .15s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              {Ic(Search, 18, theme.text3)}
              <input autoFocus placeholder="Search pages, tools..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: theme.text, fontSize: 15 }} onKeyDown={e => { if (e.key === 'Escape') setCmdPalette(false); }} />
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: theme.bg2, color: theme.text3, fontWeight: 600 }}>ESC</span>
            </div>
            <div style={{ padding: 8, maxHeight: 320, overflowY: 'auto' }}>
              {SIDEBAR_ITEMS.map(item => (
                <button key={item.id} onClick={() => { setPage(item.id); setCmdPalette(false); }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: page === item.id ? `${theme.mint}10` : 'transparent', color: page === item.id ? theme.mint : theme.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: page === item.id ? 600 : 400, textAlign: 'left', marginBottom: 2 }}>
                  {Ic(item.icon, 15)} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}