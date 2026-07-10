# 🎓 SmartStudy AI

Your personal AI-powered study companion. Upload your notes and get instant explanations, quizzes, flashcards, summaries, and personalized study plans — all in one platform.

**🌐 Live Demo:** https://ai-study-assistant-t9ku2h.drytis.dev/

---

## ✨ Features

- **AI Tutor** — Ask questions about your notes and get instant, streaming responses
- **Smart Quizzes** — AI generates quizzes from your uploaded material
- **Flashcards** — Auto-created flashcards with spaced repetition
- **Summaries** — Turn long notes into concise key points
- **Mind Maps** — Visualize concepts and connections
- **Study Planner** — AI-built personalized study schedule
- **Notes Management** — Upload, organize, and export your study material
- **Analytics** — Track your progress, XP, streaks, and achievements
- **Dark Mode** — Full dark theme support
- **Mobile Responsive** — Works seamlessly on all devices
- **PWA Ready** — Installable as a native app

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 19 |
| Build Tool | Vite 6 |
| AI | OpenAI-compatible streaming API |
| Storage | LocalStorage (client-side persistence) |
| Styling | Inline CSS with design system |
| PWA | Service Worker + Web Manifest |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
git clone https://github.com/NafeesAhmedBhatti/SmartStudy-AI.git
cd SmartStudy-AI
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
SmartStudy-AI/
├── src/
│   ├── App.jsx          # Main application (all components & pages)
│   ├── main.jsx         # Entry point
│   └── vite-env.d.ts    # TypeScript declarations
├── public/
│   ├── icon-192.svg     # PWA icon
│   ├── icon-512.svg     # PWA icon
│   ├── manifest.json    # PWA manifest
│   └── sw.js            # Service worker
├── index.html           # HTML template
├── server.js            # Express server for production
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies & scripts
```

---

## 📖 How It Works

1. **Sign up** with any email — no verification needed, data stays in your browser
2. **Upload notes** — Paste text or upload files (PDF, TXT)
3. **Ask AI** — Get explanations, ask follow-up questions
4. **Study** — Take quizzes, review flashcards, generate summaries
5. **Track progress** — Earn XP, build streaks, unlock achievements

---

## 📜 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Nafees Ahmed Bhatti**

[![GitHub](https://img.shields.io/badge/GitHub-NafeesAhmedBhatti-181717?style=flat-square&logo=github)](https://github.com/NafeesAhmedBhatti)
