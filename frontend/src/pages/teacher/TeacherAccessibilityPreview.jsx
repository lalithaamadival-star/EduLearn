import React, { useState } from 'react';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { AudioPlayer } from '../../components/ui/AudioPlayer';
import {
  Eye,
  Sliders,
  Volume2,
  FileText,
  Sparkles,
  Maximize2,
  CheckCircle2,
  SunMoon,
  Layers
} from 'lucide-react';

export function TeacherAccessibilityPreview() {
  const [activeMode, setActiveMode] = useState('normal');

  const modes = [
    { id: 'normal', label: 'Standard Dark', desc: 'Default layout' },
    { id: 'lightmode', label: 'Light Mode', desc: 'Daytime clean contrast' },
    { id: 'screenreader', label: 'Screen Reader Tree', desc: 'ARIA landmarks & labels' },
    { id: 'largetext', label: 'Large Text (150%)', desc: 'Scaled typography' },
    { id: 'highcontrast', label: 'High Contrast (WCAG AAA)', desc: '7:1 luminance ratio' },
    { id: 'focusmode', label: 'Distraction-Free Focus', desc: 'Periphery dimmed' },
    { id: 'audio', label: 'Audio & Transcripts', desc: 'Neural TTS readout' },
    { id: 'simplified', label: 'Cognitive Simplified', desc: 'Plain language view' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          Curriculum Quality Assurance
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Teacher Accessibility Previewer
        </h1>
        <p className="text-xs text-slate-400">
          Test-drive how your curriculum renders across 7 distinct sensory and cognitive configurations before publishing.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {modes.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMode(m.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              activeMode === m.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Simulated Device / Viewport Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Simulating Mode: <strong className="text-white uppercase">{activeMode}</strong></span>
          </div>
          <span className="text-emerald-400 font-semibold">WCAG 2.2 Compliant</span>
        </div>

        {/* Dynamic Simulation Content */}
        <div className="min-h-[300px]">
          {activeMode === 'normal' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Variables, Data Types and Memory References</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                In Python, variables are symbolic names that act as references (pointers) to objects residing in memory. Unlike statically typed languages where a variable is an allocated box of fixed byte width, a Python variable is simply a pointer tag bound to a heap-allocated object.
              </p>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400">
                <code>x = 42<br />y = x<br /># y points to the exact same memory id as x</code>
              </div>
            </div>
          )}

          {activeMode === 'lightmode' && (
            <div className="space-y-4 p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 shadow-sm">
              <span className="text-2xs font-mono uppercase text-indigo-600 font-bold">Light Mode Simulation (Clean Daytime Contrast)</span>
              <h2 className="text-2xl font-bold text-slate-950">Variables, Data Types and Memory References</h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                In Python, variables are symbolic names that act as references (pointers) to objects residing in memory. Unlike statically typed languages where a variable is an allocated box of fixed byte width, a Python variable is simply a pointer tag bound to a heap-allocated object.
              </p>
              <div className="p-4 bg-white border border-slate-300 rounded-xl font-mono text-xs text-emerald-700 shadow-xs">
                <code>x = 42<br />y = x<br /># y points to the exact same memory id as x</code>
              </div>
            </div>
          )}

          {activeMode === 'screenreader' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-sky-400 font-bold uppercase tracking-wider">Screen Reader Semantic Tree</div>
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-slate-300">
                <div>[ROLE: main, ACCESSIBLE NAME: "Variables and Memory Lesson"]</div>
                <div className="pl-4">[HEADING 1]: "Variables, Data Types and Memory References"</div>
                <div className="pl-4">[PARAGRAPH]: "In Python, variables are symbolic names that act as references..."</div>
                <div className="pl-4">[CODE REGION, ARIA-LABEL: "Python Variable Assignment Code"]</div>
                <div className="pl-4">[STATUS REGION, ARIA-LIVE: "polite"]: "End of section."</div>
              </div>
            </div>
          )}

          {activeMode === 'largetext' && (
            <div className="space-y-6 text-lg sm:text-xl leading-relaxed text-slate-100">
              <h2 className="text-3xl font-extrabold text-white">Variables, Data Types and Memory References</h2>
              <p>
                In Python, variables are symbolic names that act as references (pointers) to objects residing in memory.
              </p>
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-emerald-400">
                <code>x = 42; y = x</code>
              </div>
            </div>
          )}

          {activeMode === 'highcontrast' && (
            <div className="p-6 bg-black border-4 border-yellow-300 rounded-xl text-white space-y-4 font-mono">
              <div className="text-xs text-yellow-300 font-bold uppercase">WCAG AAA Contrast Active</div>
              <h2 className="text-2xl font-bold text-yellow-300">Variables, Data Types and Memory References</h2>
              <p className="text-sm text-white leading-relaxed">
                Variables are symbolic names acting as pointers to heap-allocated objects. Zero soft gradients or subtle borders.
              </p>
              <div className="p-3 border-2 border-yellow-300 text-yellow-300 text-xs">
                x = 42; y = x // Verified High Contrast Token
              </div>
            </div>
          )}

          {activeMode === 'focusmode' && (
            <div className="max-w-xl mx-auto p-6 bg-slate-950 border border-slate-700 rounded-xl space-y-4 text-center">
              <span className="text-2xs font-mono uppercase text-sky-400 font-bold">Focus Mode Active</span>
              <h2 className="text-xl font-bold text-white">Memory Aliasing Core Axiom</h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                "Understanding the difference between variable binding and object mutation prevents subtle aliasing bugs."
              </p>
            </div>
          )}

          {activeMode === 'audio' && (
            <div className="space-y-4">
              <AudioPlayer
                title="Lesson Narration (Neural Voice)"
                voiceName="Neural Speech / Human Narration"
                transcript="Welcome to Variables, Data Types, and Memory References. In this lesson, we explore how Python handles object references in memory."
              />
            </div>
          )}

          {activeMode === 'simplified' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Variables and Memory (Plain English)</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• A variable is like a sticky name tag on a box.</li>
                <li>• When you write <code>x = 42</code>, Python puts the tag "x" on the number 42.</li>
                <li>• If two tags are on the same list, changing one changes both!</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
