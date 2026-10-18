# AccessEd (EduLearn) — Multi-Modal Inclusive Learning Platform

An assistive, accessible educational web platform engineered for learners with diverse cognitive, visual, auditory, and motor preferences. AccessEd pairs real-time Edge Neural Text-to-Speech (English & Kannada) with dual-engine AI tutoring and Supabase live data persistence.

---

## 👥 Project Team & Contributions

| Member | Focus Area | Key Modules & Contributions |
| :--- | :--- | :--- |
| **Member 1** | **Backend Architecture & Database** | FastAPI REST Engine, Supabase PostgreSQL Schema, JWT Authentication, Repositories, Lesson & Quiz Data Pipelines |
| **Member 2** | **Frontend UI/UX & Design System** | React 19 + Vite Setup, Tailwind Glassmorphism Theme System, Student Dashboard, Course Syllabus & Lesson Reader Layouts |
| **Member 3** | **Assistive AI & Speech Engineering** | Edge Neural TTS Synthesizer (`en-IN-PrabhatNeural`, `kn-IN-SapnaNeural`), Contextual AI Tutor, Structured Content Engine, Auditory Orientation System |

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Tailwind CSS, Lucide Icons, Oxlint
- **Backend**: Python 3.12+, FastAPI, Uvicorn (ASGI Lifespan), Pydantic v2
- **Database & Cloud**: Supabase PostgreSQL with RLS policies, connection pooling
- **AI & Speech**:
  - Microsoft Edge Neural TTS with server audio caching
  - AI Orchestrator (Groq LPU + OpenRouter Dual-Engine Load Balancing & Mutual Failover)
- **Accessibility**: WCAG 2.1 AAA High-Contrast, Screen-Reader Live Regions, Single-Channel Auditory Orientation

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ & npm
- Git

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows (or source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
cp .env.example .env    # Configure Supabase & AI keys
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` to explore the platform.

---

## 📄 License
Academic Capstone Project — All Rights Reserved.
