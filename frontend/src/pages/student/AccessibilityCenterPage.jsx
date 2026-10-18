import React from 'react';
import { useAccessibility } from '../../features/accessibility/AccessibilityContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Switch } from '../../components/ui/Switch';
import { Button } from '../../components/ui/Button';
import { supportedLanguages } from '../../lib/i18n';
import { Sliders, Volume2, Eye, Zap, RotateCcw, CheckCircle2, Sun, Moon } from 'lucide-react';

export function AccessibilityCenterPage() {
  const { preferences, updatePreference, resetPreferences } = useAccessibility();
  const { announce, triggerFullOrientation } = useAuditoryOrientation();

  const handleToggle = (key, value, label) => {
    updatePreference(key, value);
    announce(`${label} set to ${value ? 'enabled' : 'disabled'}.`, 'polite');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
            Universal Interface Architecture
          </span>
          <h1 className="text-3xl font-extrabold text-white">Accessibility Center</h1>
          <p className="text-xs text-slate-400">
            Tailor the entire AccessEd ecosystem to your sensory, auditory, and cognitive preferences.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={resetPreferences} icon={RotateCcw}>
          Reset Defaults
        </Button>
      </div>

      <div className="space-y-8">
        {/* 1. Auditory Orientation & Spatial Semantics */}
        <section aria-labelledby="auditory-settings-heading" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <h2 id="auditory-settings-heading" className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Auditory Orientation & Spatial Speech
            </h2>
          </div>

          <Switch
            label="Auditory Orientation System (AOS)"
            description="Proactively announces 'Where am I?', 'What can I do?', and action results via speech synthesis and ARIA live regions."
            checked={preferences.auditory_orientation}
            onChange={(val) => handleToggle('auditory_orientation', val, 'Auditory Orientation')}
          />

          <Switch
            label="Automatic AI Response Readout"
            description="Automatically speaks AI Tutor responses aloud when generated."
            checked={preferences.read_ai_responses_aloud}
            onChange={(val) => handleToggle('read_ai_responses_aloud', val, 'AI response read-aloud')}
          />

          <Switch
            label="Navigation Landmark Announcements"
            description="Announces page identity and landmark transitions upon route changes."
            checked={preferences.navigation_announcements}
            onChange={(val) => handleToggle('navigation_announcements', val, 'Navigation announcements')}
          />

          {/* Verbosity Level */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Announcement Verbosity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['CONCISE', 'STANDARD', 'DETAILED'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    updatePreference('verbosity', level);
                    announce(`Verbosity set to ${level.toLowerCase()}.`, 'polite');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    preferences.verbosity === level
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Speech Rate Slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-200">Speech Rate</span>
              <span className="text-indigo-400 font-mono">{preferences.speech_rate}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.75"
              step="0.1"
              value={preferences.speech_rate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updatePreference('speech_rate', val);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </section>

        {/* 2. Visual & Display Preferences */}
        <section aria-labelledby="visual-settings-heading" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Eye className="w-5 h-5 text-indigo-400" />
            <h2 id="visual-settings-heading" className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Visual, Contrast & Focus Presentation
            </h2>
          </div>

          {/* Color Theme Selector */}
          <div className="pt-1 pb-3 border-b border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Color Theme Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  updatePreference('theme', 'dark');
                  updatePreference('high_contrast', false);
                  announce("Dark theme enabled.", "polite");
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  preferences.theme !== 'light' && !preferences.high_contrast
                    ? 'bg-indigo-600/20 text-white border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-xs">Dark Theme</div>
                  <div className="text-3xs text-slate-400">Low-glare obsidian</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  updatePreference('theme', 'light');
                  updatePreference('high_contrast', false);
                  announce("Light theme enabled.", "polite");
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  preferences.theme === 'light' && !preferences.high_contrast
                    ? 'bg-indigo-600/20 text-white border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-xs">Light Theme</div>
                  <div className="text-3xs text-slate-400">Clean daytime contrast</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  updatePreference('high_contrast', true);
                  announce("WCAG AAA high contrast theme enabled.", "polite");
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  preferences.high_contrast
                    ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-xs">AAA Contrast</div>
                  <div className="text-3xs text-slate-400">7:1 max visibility</div>
                </div>
              </button>
            </div>
          </div>

          <Switch
            label="High Contrast Mode (WCAG AAA 7:1+)"
            description="Replaces standard theme with pure black, radiant yellow, and crisp white outlines for maximum legibility."
            checked={preferences.high_contrast}
            onChange={(val) => handleToggle('high_contrast', val, 'High Contrast Mode')}
          />

          <Switch
            label="Focus Mode (Distraction-Free)"
            description="Dims peripheral menus, sidebars, and ambient elements while studying a lesson."
            checked={preferences.focus_mode}
            onChange={(val) => handleToggle('focus_mode', val, 'Focus Mode')}
          />

          <Switch
            label="Reduced Motion"
            description="Eliminates non-essential decorative animations, pulse loops, and transitional zooms."
            checked={preferences.reduced_motion}
            onChange={(val) => handleToggle('reduced_motion', val, 'Reduced Motion')}
          />

          <Switch
            label="Dyslexia-Friendly Typography"
            description="Applies increased character spacing, weighted bottoms, and generous line heights."
            checked={preferences.dyslexia_font}
            onChange={(val) => handleToggle('dyslexia_font', val, 'Dyslexia friendly font')}
          />

          {/* Text Size Scale */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-200">Text Size Scale</span>
              <span className="text-indigo-400 font-mono">{Math.round(preferences.font_size_scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.9"
              max="1.5"
              step="0.05"
              value={preferences.font_size_scale}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updatePreference('font_size_scale', val);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </section>

        {/* 3. Language & Localization */}
        <section aria-labelledby="lang-settings-heading" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <SymbolIcon name="multimodal" className="w-5 h-5 text-indigo-400" />
            <h2 id="lang-settings-heading" className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Language & Regional Localization
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {supportedLanguages.map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  updatePreference('selected_language', lang.code);
                  announce(`Interface language switched to ${lang.name}.`, 'polite');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  preferences.selected_language === lang.code
                    ? 'bg-indigo-600/20 text-white border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm text-slate-100">{lang.nativeName}</div>
                <div className="text-2xs text-slate-400 uppercase font-mono">{lang.name} ({lang.code})</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
