# 🎓 AI Study Assistant (SmartStudy AI)

An AI-powered study assistant web application that helps students learn smarter with AI chat, study planning, notes management, flashcards, mind maps, analytics tracking, and more. Built with React, Vite, and Node.js featuring a modern UI with dark/light theme support and full mobile responsiveness.

---

## 🚀 Live Demo

[View Live Demo](https://ai-study-assistant-t9ku2h.drytis.dev/)

---

## 📸 Screenshots

| Landing Page | Dashboard |
|:---:|:---:|
| ![Landing Page](01-landing-page.png) | ![Dashboard](01-dashboard.png) |

| AI Chat | Study Tools |
|:---:|:---:|
| ![AI Chat](02-ai-chat.png) | ![Study Tools](03-study-tools.png) |

| Study Planner | Analytics |
|:---:|:---:|
| ![Study Planner](04-study-planner.png) | ![Analytics](06-analytics.png) |

---

## ✨ Features

### 🤖 AI Chat
- Intelligent AI-powered study assistant chat
- Context-aware responses for academic topics
- Chat history and conversation management
- Export chat conversations

### 📚 Study Tools
- **Flashcards** — Create and review flashcard decks
- **Mind Maps** — Visualize concepts with interactive mind maps
- **Quizzes** — Test your knowledge with auto-generated quizzes
- **Summarizer** — Summarize long texts into key points

### 📅 Study Planner
- Plan and schedule study sessions
- Calendar view with subject organization
- Set reminders and track progress
- Weekly and daily planning views

### 📝 Notes Management
- Create, edit, and organize notes by subject
- Upload PDF and DOCX files
- Voice notes with recording support
- OCR text extraction from images (Tesseract.js)
- Export notes as PDF

### 📊 Analytics Dashboard
- Track study time, XP, and streaks
- Visual charts for study activity (Area, Bar, Pie charts)
- Task completion rates and progress tracking
- Achievement badges and rewards

### ✅ Task Manager
- Create, organize, and track tasks
- Priority levels and due dates
- Filter by status (pending/completed)
- Earn XP for completing tasks

### ⚙️ Settings
- **Account** — Profile management
- **AI & Study** — AI preferences and study customization
- **Study** — Study session configuration
- **Alerts** — Notification preferences
- **Privacy** — Data privacy controls
- **Performance** — App performance settings
- **Developer** — Developer tools and debugging
- **Access** — Accessibility options
- Dark/Light theme toggle

### 🎨 UI/UX
- Modern pastel mint green theme
- Full dark mode support
- Responsive design (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Command palette (Ctrl+K)
- Collapsible sidebar navigation

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Frontend UI framework |
| **Vite 6** | Build tool and dev server |
| **Node.js** | Backend API server |
| **Framer Motion** | Animations and transitions |
| **Recharts** | Data visualization charts |
| **KaTeX** | Mathematical equation rendering |
| **Lucide React** | Icon library |
| **jsPDF** | PDF generation and export |
| **Mammoth.js** | DOCX file parsing |
| **Tesseract.js** | OCR text extraction from images |
| **react-pdf** | PDF viewing and rendering |
| **youtube-transcript** | YouTube video transcript fetching |

---

## 📁 Project Structure

```
ai-study-assistant/
├── public/                  # Static assets
│   ├── icon-192.svg         # PWA icon (192px)
│   ├── icon-512.svg         # PWA icon (512px)
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker
│   └── SmartStudy_AI_PreWork_Assignment.pdf
├── src/
│   ├── App.jsx              # Main application (all components & pages)
│   ├── main.jsx             # React entry point
│   └── vite-env.d.ts        # TypeScript declarations
├── server.js                # Node.js backend API server
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies and scripts
└── .gitignore               # Git ignore rules
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NafeesAhmedBhatti/AI-Study-Assistant.git
   cd AI-Study-Assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

### Start Backend Server

```bash
node server.js
```

This starts the API server on port 3000, which handles YouTube transcript fetching and other backend features.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm start` | Start production server on port 3000 |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/youtube-transcript?videoId=ID` | Fetch YouTube video transcript |

---

## 📱 Responsive Design

The app is fully responsive and optimized for:

- 📱 **Mobile** (375px+)
- 📱 **Tablet** (768px+)
- 💻 **Desktop** (1024px+)

---

## 🎯 Key Highlights

- **5,000+ lines** of React component code
- **9 main pages** with full functionality
- **XP & Achievement system** for gamified learning
- **localStorage persistence** — no database required
- **PWA-ready** with service worker and manifest
- **YouTube integration** — fetch video transcripts for study material

---

## 👨‍💻 Author

**Nafees Ahmed Bhatti**

- GitHub: [@NafeesAhmedBhatti](https://github.com/NafeesAhmedBhatti)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

⭐ **If you like this project, please give it a star on GitHub!**