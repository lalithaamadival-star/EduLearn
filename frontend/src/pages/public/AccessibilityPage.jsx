import React, { useState } from 'react';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { AudioPlayer } from '../../components/ui/AudioPlayer';
import {
  Keyboard,
  Volume2,
  Mic,
  Eye,
  Sliders,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  SunMoon
} from 'lucide-react';

export function AccessibilityPage() {
  const [activeTransformMode, setActiveTransformMode] = useState('text');

  const modes = [
    { id: 'text', label: '1. Semantic Text', symbol: 'learning' },
    { id: 'simplified', label: '2. Cognitive Simplified', symbol: 'simplify' },
    { id: 'audio', label: '3. Audio + Synced Transcript', symbol: 'audio' },
    { id: 'contrast', label: '4. High Contrast AAA', symbol: 'accessibility' },
    { id: 'focus', label: '5. Distraction-Free Focus', symbol: 'focus' },
    { id: 'screenreader', label: '6. Screen Reader Tree', symbol: 'orientation' },
    { id: 'translated', label: '7. Translated (Kannada / Hindi)', symbol: 'multimodal' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 font-semibold">
          <SymbolIcon name="accessibility" className="w-3.5 h-3.5 text-indigo-400" />
          <span>Universal Design Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Accessibility as Foundation, Not Feature
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          We reject the premise that accessibility is an isolated "blind mode" or decorative widget. In AccessEd, all educational material is fundamentally polymorphic: one canonical curriculum transforming into equivalent visual, auditory, and cognitive expressions.
        </p>
      </div>

      {/* Flagship Interactive Transformation: 1 Lesson into 7 Modes */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">One Lesson • Seven Equivalent Modes</h2>
            <p className="text-xs text-slate-400">Select any modality below to see how the exact same lesson adapts.</p>
          </div>
          <div className="text-2xs font-mono px-2.5 py-1 rounded bg-indigo-950 border border-indigo-800 text-indigo-400">
            Topic: Python Memory Aliasing
          </div>
        </div>

        {/* Modality Selector Bar */}
        <div className="flex flex-wrap gap-2">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveTransformMode(mode.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeTransformMode === mode.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <SymbolIcon name={mode.symbol} className="w-3.5 h-3.5" />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Presentation */}
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 min-h-[280px] flex flex-col justify-center">
          {activeTransformMode === 'text' && (
            <div className="space-y-4">
              <span className="text-2xs font-mono uppercase text-indigo-400 font-bold">Standard Semantic Text</span>
              <h3 className="text-xl font-bold text-slate-100">Variables, Data Types and Memory References</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                In Python, variables are symbolic names that act as references (pointers) to objects residing in memory. When you evaluate <code>x = 42</code>, Python allocates an integer object on the heap and binds the identifier <code>x</code> to that address.
              </p>
              <div className="p-3 bg-slate-900 rounded font-mono text-xs text-emerald-400 border border-slate-800">
                <code>y = x # y points to the exact same memory id as x</code>
              </div>
            </div>
          )}

          {activeTransformMode === 'simplified' && (
            <div className="space-y-4">
              <span className="text-2xs font-mono uppercase text-amber-400 font-bold">Cognitive Plain Language Transformation</span>
              <h3 className="text-xl font-bold text-slate-100">Variables and Memory (Simplified)</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>• A variable in Python is like a <strong>sticky name tag</strong> you put on a box.</p>
                <p>• When you write <code>x = 42</code>, Python creates the number 42 and sticks the name "x" on it.</p>
                <p>• <strong>Immutable items (Numbers, Text):</strong> You cannot change what is inside the box once made.</p>
                <p>• <strong>Mutable items (Lists):</strong> You can add or remove items inside without changing the box!</p>
              </div>
            </div>
          )}

          {activeTransformMode === 'audio' && (
            <div className="space-y-4">
              <span className="text-2xs font-mono uppercase text-indigo-400 font-bold">Auditory Narration & Synced Transcript</span>
              <AudioPlayer
                title="Variables & Memory Lesson Narration"
                voiceName="Neural Multilingual TTS"
                transcript="Welcome to Variables, Data Types, and Memory References. In this lesson, we explore how Python handles object references in memory. Python variables do not store values directly; they are symbolic references pointing to objects in the heap."
              />
            </div>
          )}

          {activeTransformMode === 'contrast' && (
            <div className="p-6 bg-black border-2 border-white rounded-lg text-white space-y-4 font-mono">
              <span className="text-2xs text-yellow-300 font-bold uppercase">WCAG AAA 7:1+ Extreme Contrast</span>
              <h3 className="text-xl font-bold text-yellow-300">Variables, Data Types and Memory References</h3>
              <p className="text-sm text-white">
                Variables are symbolic names acting as pointers to heap-allocated objects. All background luminance ratios strictly adhere to WCAG AAA standards.
              </p>
              <div className="p-2 border border-yellow-300 text-yellow-300 text-xs">
                x = 42; y = x // Shared pointer reference
              </div>
            </div>
          )}

          {activeTransformMode === 'focus' && (
            <div className="max-w-xl mx-auto p-6 bg-slate-900 border border-slate-700 rounded-xl space-y-4 text-center">
              <span className="text-2xs font-mono uppercase text-sky-400 font-bold">Distraction-Free Focus Mode</span>
              <h3 className="text-xl font-bold text-slate-100">Core Takeaway</h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                "Always distinguish between variable binding and object mutation. Understanding references prevents subtle aliasing bugs in complex algorithms."
              </p>
              <div className="text-2xs text-slate-400">All peripheral panels, headers, and navigation bars have been dimmed.</div>
            </div>
          )}

          {activeTransformMode === 'screenreader' && (
            <div className="font-mono text-xs text-slate-300 space-y-2">
              <span className="text-2xs font-mono uppercase text-sky-400 font-bold">Native Screen Reader Semantic Tree</span>
              <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
                <div>[landmark: main, label: "Variables and Memory Lesson"]</div>
                <div className="pl-4">[heading level 1]: "Variables, Data Types and Memory References"</div>
                <div className="pl-4">[region: "Assignment Mechanism"]</div>
                <div className="pl-8">[paragraph]: "In Python, variables are symbolic names that act as references..."</div>
                <div className="pl-8">[code block, language: python, label: "Memory Assignment Demo"]</div>
              </div>
            </div>
          )}

          {activeTransformMode === 'translated' && (
            <div className="space-y-4">
              <span className="text-2xs font-mono uppercase text-emerald-400 font-bold">Multilingual Curriculum (ಕನ್ನಡ / हिन्दी)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-indigo-300">ಕನ್ನಡ (Kannada)</div>
                  <p className="text-slate-200 leading-relaxed">
                    ಪೈಥಾನ್‌ನಲ್ಲಿ, ವೇರಿಯೇಬಲ್‌ಗಳು ಮೆಮೊರಿಯಲ್ಲಿರುವ ವಸ್ತುಗಳನ್ನು ಸೂಚಿಸುವ ಸಾಂಕೇತಿಕ ಹೆಸರುಗಳಾಗಿವೆ. <code>x = 42</code> ಎಂದು ಬರೆದಾಗ, ಪೈಥಾನ್ ಹೊಸ ಇಂಟಿಜರ್ ಆಬ್ಜೆಕ್ಟ್ ಅನ್ನು ಹೀಪ್ ಮೆಮೊರಿಯಲ್ಲಿ ನಿಯೋಜಿಸುತ್ತದೆ.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-indigo-300">हिन्दी (Hindi)</div>
                  <p className="text-slate-200 leading-relaxed">
                    पायथन में, चर (Variables) प्रतीकात्मक नाम होते हैं जो मेमोरी में मौजूद ऑब्जेक्ट्स के संदर्भ (pointers) के रूप में कार्य करते हैं। <code>x = 42</code> लिखने पर हीप मेमोरी में पूर्णांक बनता है।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Capabilities Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-indigo-400 font-bold text-xs uppercase font-mono">1. Keyboard Operability</div>
          <p className="text-xs text-slate-400">Zero keyboard traps. Strict tab sequence order, visible focus rings, and Alt+O orientation trigger.</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-indigo-400 font-bold text-xs uppercase font-mono">2. Auditory Orientation</div>
          <p className="text-xs text-slate-400">Answers Where am I? What can I do? What just happened? using ARIA live regions.</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-indigo-400 font-bold text-xs uppercase font-mono">3. Dual TTS Architecture</div>
          <p className="text-xs text-slate-400">High-fidelity neural voice with instant automatic fallback to Browser SpeechSynthesis.</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-indigo-400 font-bold text-xs uppercase font-mono">4. Speech-to-Text</div>
          <p className="text-xs text-slate-400">Browser Web Speech API voice input paired with continuous text and keyboard edit alternatives.</p>
        </div>
      </div>
    </div>
  );
}
