import React from 'react';
import { SymbolIcon } from '../../components/ui/SymbolIcon';

export function AccessibilityStatement() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 text-slate-300 text-sm">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 font-semibold">
          <SymbolIcon name="accessibility" className="w-3.5 h-3.5 text-indigo-400" />
          <span>Compliance & Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          AccessEd Accessibility Conformance Statement
        </h1>
        <p className="text-slate-400 text-xs font-mono">
          Standard: W3C Web Content Accessibility Guidelines (WCAG) 2.2 Level AAA Target • Effective: 2026
        </p>
      </div>

      <div className="space-y-6 leading-relaxed border-t border-slate-800 pt-8">
        <h2 className="text-xl font-bold text-white">Commitment to Inclusive Access</h2>
        <p>
          AccessEd is built upon the principle that accessibility is the primary architectural driver of educational technology. We continuously design, engineer, and audit our platform against WCAG 2.2 Level AA and AAA success criteria.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">Technical Implementations</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Semantic Landmarks:</strong> Every page is structured with valid HTML5 semantic tags (<code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;aside&gt;</code>, <code>&lt;footer&gt;</code>) allowing rapid navigation by screen-reader rotor.</li>
          <li><strong>Auditory Orientation System (AOS):</strong> Dedicated live regions (<code>role="status"</code> and <code>role="alert"</code>) communicate location, state changes, and action results without visual reliance.</li>
          <li><strong>Keyboard Traps Prevention:</strong> All dialogs, drawers, and interactive modules trap focus strictly while open and restore active element focus upon dismissal.</li>
          <li><strong>Color Independence:</strong> No error, state, or quiz score is conveyed using color alone; distinct geometric symbols, textual badges, and audio cues accompany all state updates.</li>
        </ul>

        <h2 className="text-xl font-bold text-white pt-4">Key Keyboard Shortcuts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-lg">
            <thead className="bg-slate-900 text-slate-200">
              <tr>
                <th className="p-3 border-b border-slate-800">Shortcut</th>
                <th className="p-3 border-b border-slate-800">Action</th>
                <th className="p-3 border-b border-slate-800">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="p-3 font-mono text-indigo-300">Alt + O</td>
                <td className="p-3">Trigger comprehensive Auditory Orientation readout</td>
                <td className="p-3 text-slate-400">Global</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-indigo-300">Tab / Shift + Tab</td>
                <td className="p-3">Navigate forward / backward through focusable elements</td>
                <td className="p-3 text-slate-400">Global</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-indigo-300">Escape</td>
                <td className="p-3">Dismiss modal dialog or close active side panel</td>
                <td className="p-3 text-slate-400">Active Modal / Drawer</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-indigo-300">Space / Enter</td>
                <td className="p-3">Activate buttons, toggle audio playback, submit forms</td>
                <td className="p-3 text-slate-400">Focused Element</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
