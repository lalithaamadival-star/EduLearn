import React, { useState } from 'react';
import { Volume2, Sliders, Globe, Eye, Zap, HelpCircle, Sun, Moon, Keyboard } from 'lucide-react';
import { useAuditoryOrientation } from './AuditoryOrientationContext';
import { useAccessibility } from './AccessibilityContext';
import { supportedLanguages } from '../../lib/i18n';
import { SymbolIcon } from '../../components/ui/SymbolIcon';

export function OrientationBar() {
  const { currentOrientation, triggerFullOrientation, announce, openShortcutsModal } = useAuditoryOrientation();
  const { preferences, updatePreference, toggleTheme, isLight } = useAccessibility();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleToggleTheme = () => {
    toggleTheme();
    announce(isLight ? "Dark theme enabled." : "Light theme enabled.", "polite");
  };

  return (
    <nav
      aria-label="Auditory Orientation and Quick Accessibility Toolbar"
      className="bg-slate-950/95 border-b border-slate-800 text-xs text-slate-300 py-1.5 px-4 backdrop-blur-md sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Orientation status trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerFullOrientation}
            aria-label={`Auditory Orientation: You are at ${currentOrientation.location}. Press to hear complete orientation.`}
            title="Press Alt+O for voice orientation"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <SymbolIcon name="orientation" className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-200">Orientation:</span>
            <span className="text-indigo-300 truncate max-w-[200px] sm:max-w-none">{currentOrientation.location}</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-2xs bg-slate-800 border border-slate-700 rounded text-slate-400">
              Alt+O
            </kbd>
          </button>

          <span className="hidden md:inline-flex items-center text-slate-400 text-2xs">
            Section: {currentOrientation.section}
          </span>
        </div>

        {/* Right: Quick Accessibility Switches & Multilingual Selector */}
        <div className="flex items-center gap-2">
          {/* Keyboard Shortcuts Guide Button */}
          <button
            type="button"
            onClick={openShortcutsModal}
            aria-label="Open Keyboard Shortcuts Guide (Alt+H or ?)"
            title="Keyboard Shortcuts (Alt+H or ?)"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Auditory Voice Toggle */}
          <button
            type="button"
            onClick={() => updatePreference('auditory_orientation', !preferences.auditory_orientation)}
            aria-pressed={preferences.auditory_orientation}
            aria-label={preferences.auditory_orientation ? "Auditory speech cues enabled (Alt+V)" : "Auditory speech cues disabled (Alt+V)"}
            className={`p-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              preferences.auditory_orientation ? 'text-indigo-400 bg-indigo-950/60' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Voice Announcements (Alt+V)"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-pressed={isLight}
            aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-2xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            )}
          </button>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={() => updatePreference('high_contrast', !preferences.high_contrast)}
            aria-pressed={preferences.high_contrast}
            aria-label="Toggle High Contrast Mode (WCAG AAA)"
            className={`px-2 py-1 rounded text-2xs font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              preferences.high_contrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            AAA Contrast
          </button>

          {/* Focus Mode Toggle */}
          <button
            type="button"
            onClick={() => updatePreference('focus_mode', !preferences.focus_mode)}
            aria-pressed={preferences.focus_mode}
            aria-label="Toggle Focus Mode (dims periphery)"
            className={`px-2 py-1 rounded text-2xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              preferences.focus_mode
                ? 'bg-sky-950 text-sky-300 border-sky-600'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            Focus Mode
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              aria-expanded={showLanguageMenu}
              aria-haspopup="true"
              aria-label={`Language selector, current language: ${preferences.selected_language}`}
              className="flex items-center gap-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase text-2xs font-bold">{preferences.selected_language}</span>
            </button>

            {showLanguageMenu && (
              <div
                role="menu"
                className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
              >
                {supportedLanguages.map(lang => (
                  <button
                    key={lang.code}
                    role="menuitem"
                    onClick={() => {
                      updatePreference('selected_language', lang.code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 transition-colors flex items-center justify-between ${
                      preferences.selected_language === lang.code ? 'bg-indigo-600/30 text-indigo-300 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-2xs text-slate-400 uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
