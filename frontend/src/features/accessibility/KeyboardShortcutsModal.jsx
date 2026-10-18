import React from 'react';
import { Keyboard, X, Volume2, Sun, HelpCircle, Navigation, Play, MessageSquare, ArrowRight } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcutGroups = [
    {
      category: "Global Accessibility Keys",
      shortcuts: [
        { key: "Alt + O", desc: "Auditory Spatial Orientation — Announces your current page, section, and available actions aloud" },
        { key: "Alt + T", desc: "Toggle Theme — Switches between Dark Mode and Light Mode with voice confirmation" },
        { key: "Alt + V", desc: "Toggle Speech Audio — Turns verbal navigation cues On or Off" },
        { key: "Alt + H or ?", desc: "Open Shortcuts Help — Displays this accessible keyboard reference guide" },
        { key: "Escape", desc: "Close / Dismiss — Closes any open dialog, modal, drawer, or cancels current speech" }
      ]
    },
    {
      category: "Screen-Reader & Keyboard Navigation",
      shortcuts: [
        { key: "Tab", desc: "Move Forward — Jumps focus to the next interactive button, link, or input" },
        { key: "Shift + Tab", desc: "Move Backward — Jumps focus to the previous interactive element" },
        { key: "Enter or Space", desc: "Activate — Triggers the focused button, submits a form, or opens a lesson" },
        { key: "Arrow Keys (↑ / ↓)", desc: "Navigate Options — Selects multiple-choice options in Mastery Quizzes" },
        { key: "H (Screen Reader)", desc: "Next Heading — Jumps sequentially across H1, H2, and H3 lesson sections" },
        { key: "D (Screen Reader)", desc: "Next Landmark — Jumps between Navigation, Main Workspace, and Content" }
      ]
    },
    {
      category: "Lesson Reader & Media Controls",
      shortcuts: [
        { key: "Alt + P", desc: "Play / Pause Audio — Starts or pauses the Neural Voice lesson narrator" },
        { key: "Alt + S", desc: "Simplify Lesson — Toggles plain language mode with lower cognitive load" },
        { key: "Alt + A", desc: "Focus AI Tutor — Jumps cursor directly into the AI tutor question box" }
      ]
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AccessEd Accessible Keyboard Shortcuts Guide" maxWidth="max-w-3xl">
      <div className="space-y-6 text-slate-200">
        <p className="text-sm text-slate-300">
          AccessEd is 100% operable without a mouse. Every feature has been mapped to intuitive, standard keyboard commands:
        </p>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono border-b border-slate-800 pb-1">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.shortcuts.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl flex flex-col justify-between gap-1.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-950/80 border border-indigo-700/50 rounded-md text-indigo-300 shadow-sm">
                        {s.key}
                      </kbd>
                    </div>
                    <span className="text-xs text-slate-300 leading-snug">
                      {s.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
          <span>Press <strong>Escape</strong> to return to your workspace.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Got it (Close)
          </button>
        </div>
      </div>
    </Modal>
  );
}
