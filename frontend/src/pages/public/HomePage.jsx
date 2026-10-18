import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { AudioPlayer } from '../../components/ui/AudioPlayer';
import {
  Volume2,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  BookOpen,
  CheckCircle2,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Globe
} from 'lucide-react';

export function HomePage() {
  const [activeLessonMode, setActiveLessonMode] = useState('normal');
  const [audioVoiceLang, setAudioVoiceLang] = useState('en');

  const audioLessons = {
    en: {
      langName: "English (India)",
      voiceId: "en-IN-PrabhatNeural",
      title: "Variables & Memory Architecture Audio Lesson",
      voiceLabel: "Microsoft Neural (Prabhat - Indian English Voice)",
      transcript: "Welcome to Variables, Data Types, and Memory References. In this lesson, we explore how Python handles object references in memory. Python variables do not store values directly; they are symbolic references pointing to objects in the heap."
    },
    kn: {
      langName: "ಕನ್ನಡ (Kannada)",
      voiceId: "kn-IN-SapnaNeural",
      title: "ವೇರಿಯೇಬಲ್‌ಗಳು ಮತ್ತು ಮೆಮೊರಿ ವಾಸ್ತುಶಿಲ್ಪ ಪಾಠ (Kannada Audio Lesson)",
      voiceLabel: "Microsoft Neural (Sapna - Kannada Native Human Voice)",
      transcript: "ವೇರಿಯೇಬಲ್‌ಗಳು, ಡೇಟಾ ಪ್ರಕಾರಗಳು ಮತ್ತು ಮೆಮೊರಿ ಉಲ್ಲೇಖಗಳಿಗೆ ಸುಸ್ವಾಗತ. ಈ ಪಾಠದಲ್ಲಿ, ಪೈಥಾನ್ ಹೀಪ್ ಮೆಮೊರಿಯಲ್ಲಿ ವಸ್ತುಗಳನ್ನು ಹೇಗೆ ನಿರ್ವಹಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ನಾವು ಕಲಿಯುತ್ತೇವೆ. ಪೈಥಾನ್ ವೇರಿಯೇಬಲ್‌ಗಳು ಮೌಲ್ಯಗಳನ್ನು ನೇರವಾಗಿ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ; ಅವು ಹೀಪ್‌ನಲ್ಲಿರುವ ವಸ್ತುಗಳನ್ನು ಸೂಚಿಸುವ ಸಂಕೇತಗಳಾಗಿವೆ."
    }
  };

  const lessonModes = [
    { id: 'normal', label: 'Standard Text', desc: 'Semantic hierarchy & code' },
    { id: 'simplified', label: 'Simplified Text', desc: 'Plain cognitive clarity' },
    { id: 'audio', label: 'Audio & Waveform', desc: 'Neural TTS + synced transcript' },
    { id: 'contrast', label: 'High Contrast (AAA)', desc: '7:1 contrast ratio' },
    { id: 'screenreader', label: 'Screen Reader Tree', desc: 'ARIA semantics & landmarks' }
  ];

  return (
    <div className="space-y-24 py-8">
      {/* 1. Hero Section */}
      <section aria-label="Hero Introduction" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
            <SymbolIcon name="accessibility" className="w-3.5 h-3.5 text-indigo-400" />
            <span>2026 Multimodal Accessibility Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Learning should adapt to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">the learner</span>.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AccessEd is an accessibility-first educational ecosystem that enables students and educators to consume, teach, and interact with coursework through multiple equivalent modes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/student/courses">
              <Button size="lg" variant="primary" icon={ArrowRight}>
                Explore the Platform
              </Button>
            </Link>
            <Link to="/get-started">
              <Button size="lg" variant="outline">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Product Interface Showcase (Flagship Lesson Reader Mockup) */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
          {/* Mock Window Topbar */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-slate-300">AccessEd Lesson Reader // Python Memory References</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono text-3xs">
                WCAG 2.2 AAA
              </span>
            </div>
          </div>

          {/* 3-Panel Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-4 gap-4">
            {/* Left Nav Column */}
            <div className="md:col-span-3 space-y-3 text-xs text-slate-400">
              <div className="font-bold text-slate-200 uppercase tracking-wider text-3xs">Module 1 Syllabus</div>
              <div className="p-2 rounded bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 font-semibold">
                1.1 Variables & Memory
              </div>
              <div className="p-2 rounded hover:bg-slate-800/40 text-slate-400">
                1.2 Control Flow & Truthiness
              </div>
              <div className="p-2 rounded hover:bg-slate-800/40 text-slate-400">
                1.3 Call Stack & Recursion
              </div>
            </div>

            {/* Center Content Column */}
            <div className="md:col-span-6 space-y-3 px-2">
              <div className="flex items-center justify-between">
                <span className="text-2xs uppercase tracking-wider text-indigo-400 font-semibold font-mono">
                  Lesson 1.1 • Computer Science
                </span>
                <span className="text-2xs text-slate-400">15 min read</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Variables, Data Types and Memory References
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                In Python, variables are symbolic names that act as references to objects residing in heap memory. Distinguishing between reference binding and object mutation is foundational.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
                <code>x = 42<br />y = x<br /># y points to the exact same memory id as x</code>
              </div>
            </div>

            {/* Right Tools Column */}
            <div className="md:col-span-3 space-y-2">
              <div className="text-3xs uppercase tracking-wider text-slate-400 font-bold">Assistive Layer</div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <SymbolIcon name="ai" className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Contextual AI Tutor</span>
                </div>
                <p className="text-2xs text-slate-400">
                  "Need a real-world metaphor? Think of a variable as a sticky note placed on a box."
                </p>
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-800 text-2xs text-slate-300 flex items-center justify-between">
                <span>Auditory Speech</span>
                <span className="text-emerald-400 font-semibold">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Philosophy: One Lesson / Multiple Modes Interactive Demo */}
      <section aria-label="One Lesson Multiple Modes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <SymbolIcon name="multimodal" className="w-3.5 h-3.5 text-indigo-400" />
            <span>Non-Negotiable Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            One Lesson. Multiple Equivalent Experiences.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Accessibility is not a secondary "blind mode" switch. The same piece of knowledge adapts dynamically to visual, auditory, and cognitive preferences without dumbing down the curriculum.
          </p>
        </div>

        {/* Interactive Mode Switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {lessonModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveLessonMode(mode.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                activeLessonMode === mode.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Dynamic Mode Presentation Container */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
          {activeLessonMode === 'normal' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Mode: Standard Semantic Article</div>
              <h3 className="text-2xl font-bold text-slate-100">Variables, Data Types and Memory References</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                In Python, variables are symbolic names that act as references (pointers) to objects residing in memory. Unlike statically typed languages where a variable is an allocated box of fixed byte width, a Python variable is simply a pointer tag bound to a heap-allocated object.
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300">
                <code>x = [1, 2, 3]<br />y = x<br />y.append(4)<br />print(x) # Output: [1, 2, 3, 4] (Mutable Aliasing)</code>
              </div>
            </div>
          )}

          {activeLessonMode === 'simplified' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">Mode: Cognitive Simplification (Plain Language)</div>
              <h3 className="text-2xl font-bold text-slate-100">Variables and Memory (Plain English)</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Think of a variable as a name tag stuck onto a box, not the box itself.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Numbers and text can never be altered once created (they are frozen).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Lists can change! If two tags share the same list, changing one changes both.</span>
                </li>
              </ul>
            </div>
          )}

          {activeLessonMode === 'audio' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Mode: Audio & Synchronized Transcript
                </div>

                {/* Kannada / English Voice Selector */}
                <div className="flex items-center gap-2" role="group" aria-label="Select audio lesson language">
                  <span className="text-xs text-slate-400 font-medium mr-1">Voice Language:</span>
                  <button
                    type="button"
                    onClick={() => setAudioVoiceLang('en')}
                    aria-pressed={audioVoiceLang === 'en'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      audioVoiceLang === 'en'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/30 ring-2 ring-indigo-400/40'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    <span className="text-[10px] font-mono opacity-80">(Prabhat)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudioVoiceLang('kn')}
                    aria-pressed={audioVoiceLang === 'kn'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      audioVoiceLang === 'kn'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/30 ring-2 ring-emerald-400/40'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80'
                    }`}
                  >
                    <span>🇮🇳 ಕನ್ನಡ (Kannada)</span>
                    <span className="text-[10px] font-mono opacity-80">(Sapna)</span>
                  </button>
                </div>
              </div>

              {/* Active Voice Info Bar */}
              <div className="flex flex-wrap items-center justify-between text-xs font-mono px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Voice Profile:</span>
                  <span className="text-indigo-300 font-semibold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                    {audioVoiceLang === 'kn' ? 'Sapna (Native Kannada Neural)' : 'Prabhat (Indian English Neural)'}
                  </span>
                </div>
                <div className="text-emerald-400 flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>100% Free Human Neural Voices • Zero API Costs</span>
                </div>
              </div>

              {/* Dynamic Audio Player */}
              <AudioPlayer
                key={audioVoiceLang}
                title={audioLessons[audioVoiceLang].title}
                voiceName={audioLessons[audioVoiceLang].voiceLabel}
                transcript={audioLessons[audioVoiceLang].transcript}
                language={audioVoiceLang}
                voiceId={audioLessons[audioVoiceLang].voiceId}
              />

              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
                <span className="text-indigo-400">💡</span>
                <span>
                  Click <strong>Listen</strong> above to hear natural, human-sounding {audioLessons[audioVoiceLang].langName} speech powered by high-fidelity neural models with zero robotic tone.
                </span>
              </div>
            </div>
          )}

          {activeLessonMode === 'contrast' && (
            <div className="p-6 bg-black border-2 border-white rounded-xl text-white space-y-4 font-mono">
              <div className="text-xs text-yellow-300 uppercase tracking-wider font-bold">WCAG AAA 7:1+ High Contrast Mode</div>
              <h3 className="text-2xl font-bold text-yellow-300">Variables & Memory References</h3>
              <p className="text-sm leading-relaxed text-white">
                Variables are symbolic names acting as pointers to heap-allocated objects. All borders, text tokens, and interactive boundaries meet maximum luminance contrast.
              </p>
              <div className="p-3 border border-yellow-300 text-yellow-300">
                b = a // Mutates shared reference
              </div>
            </div>
          )}

          {activeLessonMode === 'screenreader' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-sky-400 font-bold uppercase tracking-wider">Accessible Accessibility Tree Representation</div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-slate-300">
                <div>&lt;main role="main" aria-label="Variables & Memory Lesson"&gt;</div>
                <div className="pl-4">&lt;h1&gt;Variables, Data Types and Memory References&lt;/h1&gt;</div>
                <div className="pl-4">&lt;section aria-labelledby="sec-assignment"&gt;</div>
                <div className="pl-8">&lt;h2 id="sec-assignment"&gt;1. The Assignment Mechanism&lt;/h2&gt;</div>
                <div className="pl-8">&lt;pre role="region" aria-label="Python Code Example"&gt;...&lt;/pre&gt;</div>
                <div className="pl-4">&lt;/section&gt;</div>
                <div>&lt;/main&gt;</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Auditory Orientation Feature Highlight */}
      <section aria-label="Auditory Orientation System" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 font-semibold">
              <SymbolIcon name="orientation" className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dedicated Core Capability</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Auditory Orientation System (AOS)
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              For a blind student, standard screen readers often dump a confusing stream of uncontextualized markup. AccessEd's Auditory Orientation System explicitly answers four vital spatial questions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-indigo-400 text-xs font-mono mb-1">WHERE AM I?</div>
                <div className="text-xs text-slate-300">Identifies page, lesson, and section level.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-indigo-400 text-xs font-mono mb-1">WHAT CAN I DO?</div>
                <div className="text-xs text-slate-300">Audits immediate available keyboard and voice actions.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-indigo-400 text-xs font-mono mb-1">WHAT JUST HAPPENED?</div>
                <div className="text-xs text-slate-300">Announces action outcomes (e.g. "Quiz score: 3 of 3").</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-indigo-400 text-xs font-mono mb-1">WHERE AM I GOING?</div>
                <div className="text-xs text-slate-300">Guides transitions during multi-step tasks.</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200">Live Auditory Simulation</span>
              <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-2xs rounded">
                Press Alt+O anytime
              </kbd>
            </div>
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-2">
                <span className="text-indigo-400 font-bold shrink-0">AOS:</span>
                <span>"AccessEd Home page. Main Navigation section. Available actions: Explore coursework, sign in as student or teacher."</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-2">
                <span className="text-indigo-400 font-bold shrink-0">AOS:</span>
                <span>"Quiz submitted. Your score is 3 out of 3. Full mastery achieved."</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Resilient AI & Fallback Architecture */}
      <section aria-label="AI Architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Contextual Intelligence with Zero-Failure Fallbacks
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            The AI Tutor is grounded in the active curriculum. If primary infrastructure faces downtime or quota constraints, the system seamlessly reroutes without displaying technical error codes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <SymbolIcon name="ai" className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Primary: Groq LLaMA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ultra-fast inference generating pedagogical explanations, analogies, and dynamic code walkthroughs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
              <SymbolIcon name="processing" className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Secondary: OpenRouter Nemotron</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic failover engine ensuring zero downtime for students preparing for exams or taking quizzes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <SymbolIcon name="document" className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Document OCR: Google Gemini</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts headings, formulas, and concepts from teacher PDFs into reviewed, accessible lesson modules.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section aria-label="Get Started CTA" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-800/50 space-y-6 hero-focus-card">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Experience the Future of Inclusive Learning
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Test the student experience, inspect teacher curriculum tools, or explore the flagship Lesson Reader now.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/student">
              <Button size="lg" variant="primary">
                Launch Student Experience
              </Button>
            </Link>
            <Link to="/teacher">
              <Button size="lg" variant="secondary">
                Launch Teacher Console
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
