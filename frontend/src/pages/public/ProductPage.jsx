import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import {
  Sparkles,
  Layers,
  Volume2,
  FileText,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  TrendingUp,
  Cpu,
  ArrowRight
} from 'lucide-react';

export function ProductPage() {
  const features = [
    {
      title: "Contextual AI Tutor",
      symbol: "ai",
      desc: "Unlike generic chat clones, the AccessEd AI Tutor is aware of the student's active course, current lesson snippet, recent quiz performance, and active accessibility mode.",
      points: ["Adaptive cognitive simplification", "Dynamic code explanations", "Mistake diagnosis and anchor metaphors"]
    },
    {
      title: "Auditory Orientation System",
      symbol: "orientation",
      desc: "Spatial awareness engineered for screen-reader and low-vision learners. Proactively answers Where am I? What can I do? What just happened? Where am I going?",
      points: ["ARIA live polite and assertive regions", "Alt+O universal keyboard trigger", "Non-intrusive semantic landmarks"]
    },
    {
      title: "Multimodal Lesson Reader",
      symbol: "multimodal",
      desc: "Our flagship reading experience that transforms any lesson into standard text, cognitive simplification, high contrast AAA, audio with synced transcript, or screen-reader tree.",
      points: ["Real-time audio waveform player", "Adjustable speech speed (0.85x to 1.5x)", "Focus mode with background dimming"]
    },
    {
      title: "Gemini Document OCR Intelligence",
      symbol: "document",
      desc: "Enables educators to ingest lecture PDFs, PPTX slides, and images into clean, structured, accessible markdown curricula with automatic quiz question proposals.",
      points: ["Human-in-the-loop review workflow", "Never silently auto-publishes", "Extracts tables, code, and definitions"]
    },
    {
      title: "Accessible Mastery Quizzes",
      symbol: "check",
      desc: "Keyboard-navigable assessments designed without color-only cues, providing immediate screen-reader score announcements and one-click AI mistake explanations.",
      points: ["Screen reader score readout: '8 out of 10'", "No color-only feedback indicators", "Automated targeted revision generation"]
    },
    {
      title: "Teacher Operational Co-pilot",
      symbol: "learning",
      desc: "Dense, structured interface for educators to manage classes, monitor student mastery distributions, review OCR jobs, and test-drive lessons in the Accessibility Previewer.",
      points: ["Side-by-side 7-mode accessibility preview", "Automated draft outlines & quizzes", "Student cohort mastery analytics"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 font-semibold">
          <SymbolIcon name="learning" className="w-3.5 h-3.5 text-indigo-400" />
          <span>Product Overview</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          The Inclusive Learning & Accessibility Ecosystem
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          AccessEd bridges the gap between educational content and diverse human perception through multimodal equivalence, pedagogical AI, and robust technical infrastructure.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <SymbolIcon name={feat.symbol} className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">{feat.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
            <ul className="pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
              {feat.points.map((pt, pIdx) => (
                <li key={pIdx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Technical Architecture Overview */}
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h2 className="text-2xl font-bold text-white">Engineering Reliability & Security</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="space-y-2">
            <div className="font-bold text-indigo-400 uppercase font-mono">Failover AI Pipeline</div>
            <p className="text-slate-400">Primary Groq LLaMA with automatic seamless fallback to OpenRouter Nemotron.</p>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-emerald-400 uppercase font-mono">Row Level Security</div>
            <p className="text-slate-400">PostgreSQL policies ensure strict data boundaries across student cohorts and teachers.</p>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-amber-400 uppercase font-mono">Audio Cache & TTS</div>
            <p className="text-slate-400">High-fidelity neural speech with local SHA-256 audio deduplication and browser speech fallback.</p>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-sky-400 uppercase font-mono">I18n Multilingual</div>
            <p className="text-slate-400">Localization architecture ready for English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
