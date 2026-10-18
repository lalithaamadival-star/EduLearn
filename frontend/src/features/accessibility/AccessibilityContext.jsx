import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultPreferences = {
  auditory_orientation: true,
  read_ai_responses_aloud: true,
  read_lesson_content_aloud: false,
  navigation_announcements: true,
  verbosity: 'STANDARD', // CONCISE, STANDARD, DETAILED
  voice_identifier: 'default',
  speech_rate: 1.0,
  font_size_scale: 1.0,
  theme: 'dark', // dark, light
  high_contrast: false,
  reduced_motion: false,
  focus_mode: false,
  dyslexia_font: false,
  selected_language: 'en'
};

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('accessed_a11y_prefs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultPreferences,
          ...parsed,
          read_ai_responses_aloud: parsed.read_ai_responses_aloud ?? true
        };
      }
      return defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  // Apply DOM classes based on accessibility preferences
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Theme (Light vs Dark vs High Contrast)
    if (preferences.high_contrast) {
      body.classList.add('theme-high-contrast');
      body.classList.remove('theme-light');
      root.style.colorScheme = 'dark';
    } else if (preferences.theme === 'light') {
      body.classList.add('theme-light');
      body.classList.remove('theme-high-contrast');
      root.style.colorScheme = 'light';
    } else {
      body.classList.remove('theme-light');
      body.classList.remove('theme-high-contrast');
      root.style.colorScheme = 'dark';
    }

    // Focus Mode
    if (preferences.focus_mode) {
      body.classList.add('mode-focus');
    } else {
      body.classList.remove('mode-focus');
    }

    // Reduced Motion
    if (preferences.reduced_motion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }

    // Dyslexia Font
    if (preferences.dyslexia_font) {
      body.classList.add('font-dyslexia');
    } else {
      body.classList.remove('font-dyslexia');
    }

    // Font Scale
    root.style.fontSize = `${Math.round(preferences.font_size_scale * 16)}px`;

    // Persist
    try {
      localStorage.setItem('accessed_a11y_prefs', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Could not persist a11y preferences to localStorage', e);
    }
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleTheme = () => {
    setPreferences(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
      high_contrast: false
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const isLight = preferences.theme === 'light' && !preferences.high_contrast;

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference, toggleTheme, resetPreferences, isLight }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
