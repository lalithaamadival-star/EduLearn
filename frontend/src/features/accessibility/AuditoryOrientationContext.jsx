import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from './AccessibilityContext';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { api } from '../../services/api';

const AuditoryOrientationContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function AuditoryOrientationProvider({ children }) {
  const { preferences, updatePreference, toggleTheme, isLight } = useAccessibility();
  const [liveMessage, setLiveMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [currentOrientation, setCurrentOrientation] = useState({
    location: 'AccessEd Welcome',
    section: 'Header Navigation',
    actions: ['Navigate public catalog', 'Sign in as Student or Teacher', 'Open Accessibility Center'],
    lastAction: 'Platform loaded',
    whereGoing: 'Ready for interaction'
  });

  const lastSpokenRef = useRef('');
  const currentSeqRef = useRef(0);
  const activeAudioRef = useRef(null);
  const audioCacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  const announceDebounceRef = useRef(null);
  const focusDebounceRef = useRef(null);
  const isKeyboardNavRef = useRef(false);

  // Stop any currently playing audio and cancel prior speech
  const stopCurrentAudio = useCallback(() => {
    // 1. Immediately increment sequence so any in-flight fetches are dropped
    currentSeqRef.current++;

    // 2. Abort active network request
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
      abortControllerRef.current = null;
    }

    // 3. Stop HTML5 Audio element immediately
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current.src = '';
      } catch (e) {}
      activeAudioRef.current = null;
    }

    // 4. Cancel any residual browser speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }, []);

  // Single-channel Microsoft Edge Neural TTS voice synthesizer
  const speakVoiceAnnouncement = useCallback(async (text) => {
    if (!preferences.auditory_orientation) return;
    if (!text || !text.trim()) return;

    // Immediately stop prior audio so announcements never talk over each other
    stopCurrentAudio();

    // Assign a unique monotonically increasing sequence token for this speech request
    const mySeq = ++currentSeqRef.current;

    const lang = preferences.selected_language || 'en';
    const cacheKey = `${text.trim()}_${lang}`;

    // 1. Play from in-memory cache if already synthesized (<5ms latency)
    if (audioCacheRef.current.has(cacheKey)) {
      const cachedUrl = audioCacheRef.current.get(cacheKey);
      if (mySeq !== currentSeqRef.current) return; // Stale request

      try {
        const audio = new Audio(cachedUrl);
        audio.playbackRate = preferences.speech_rate || 1.0;
        activeAudioRef.current = audio;
        audio.onended = () => {
          if (activeAudioRef.current === audio) activeAudioRef.current = null;
        };
        await audio.play();
        return;
      } catch (err) {
        if (mySeq !== currentSeqRef.current) return;
      }
    }

    // 2. Fetch from backend Edge TTS
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await api.synthesizeTTS(text.trim(), lang);

      // CRUCIAL: If a newer announcement started while we were fetching, discard this one!
      if (mySeq !== currentSeqRef.current) {
        return;
      }

      if (res && res.audio_url && !res.use_browser_fallback) {
        const audioUrl = res.audio_url.startsWith('http') ? res.audio_url : `${API_BASE}${res.audio_url}`;
        audioCacheRef.current.set(cacheKey, audioUrl);

        if (mySeq !== currentSeqRef.current) return;

        const audio = new Audio(audioUrl);
        audio.playbackRate = preferences.speech_rate || 1.0;

        // Ensure any previous audio is completely silenced
        if (activeAudioRef.current) {
          try {
            activeAudioRef.current.pause();
            activeAudioRef.current.currentTime = 0;
          } catch (e) {}
        }

        activeAudioRef.current = audio;
        audio.onended = () => {
          if (activeAudioRef.current === audio) activeAudioRef.current = null;
        };

        await audio.play();
      }
    } catch (err) {
      // If aborted or newer speech took over, do nothing
      if (mySeq !== currentSeqRef.current || err.name === 'AbortError') return;
      console.warn('Edge TTS announcement notice:', err.message);
    }
  }, [preferences.auditory_orientation, preferences.speech_rate, preferences.selected_language, stopCurrentAudio]);

  // Core announcement method with debouncing to prevent rapid back-to-back overlapping
  const announce = useCallback((text, priority = 'polite', speakVoice = true) => {
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;

    if (priority === 'assertive') {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(text), 20);
    } else {
      setLiveMessage('');
      setTimeout(() => setLiveMessage(text), 20);
    }

    if (speakVoice && preferences.auditory_orientation) {
      if (announceDebounceRef.current) clearTimeout(announceDebounceRef.current);
      announceDebounceRef.current = setTimeout(() => {
        speakVoiceAnnouncement(text);
      }, 50);
    }

    // Auto-clear message cache after 4 seconds
    setTimeout(() => {
      lastSpokenRef.current = '';
    }, 4000);
  }, [preferences.auditory_orientation, speakVoiceAnnouncement]);

  const updateOrientation = useCallback((newOrientation) => {
    setCurrentOrientation(prev => ({
      ...prev,
      ...newOrientation
    }));

    if (preferences.navigation_announcements && newOrientation.location) {
      announce(`${newOrientation.location}.`, 'polite', true);
    }
  }, [preferences.navigation_announcements, announce]);

  const triggerFullOrientation = useCallback(() => {
    const { location, section, actions } = currentOrientation;
    const actionsText = actions && actions.length > 0 ? `Available actions: ${actions.join(', ')}.` : '';
    const fullText = `Orientation: You are currently on ${location}, in the ${section} section. ${actionsText}`;
    announce(fullText, 'assertive', true);
  }, [currentOrientation, announce]);

  // ---------------------------------------------------------------------------
  // Tab-Key & Focus Listener for Blind Navigation (Speaks element role & name)
  // ONLY fires when user is jumping with Tab key to eliminate mouse click overlap!
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Only flag keyboard nav on Tab / Shift+Tab
    const handleKeyDownCapture = (e) => {
      if (e.key === 'Tab') {
        isKeyboardNavRef.current = true;
      }
    };

    // Any mouse click resets the keyboard nav flag
    const handlePointerDownCapture = () => {
      isKeyboardNavRef.current = false;
    };

    const handleFocusIn = (e) => {
      if (!preferences.auditory_orientation) return;
      // CRITICAL: Only announce focused key names if the user jumped here via TAB key!
      // This prevents mouse clicks and auto-route focus from speaking twice!
      if (!isKeyboardNavRef.current) return;

      const target = e.target;
      if (!target || target === document.body || target.id === 'root') return;

      const tag = target.tagName ? target.tagName.toLowerCase() : '';
      const role = target.getAttribute('role') || '';

      // Ignore structural containers without interactive meaning
      if (['div', 'section', 'article', 'main', 'header', 'footer', 'span'].includes(tag) && !role && target.tabIndex < 0) {
        return;
      }

      // Determine control type
      let typeLabel = 'Item';
      if (tag === 'button' || role === 'button') {
        typeLabel = 'Button';
      } else if (tag === 'a' || role === 'link') {
        typeLabel = 'Link';
      } else if (tag === 'input') {
        const inputType = (target.getAttribute('type') || 'text').toLowerCase();
        if (inputType === 'checkbox') {
          typeLabel = `Checkbox, ${target.checked ? 'checked' : 'not checked'}`;
        } else if (inputType === 'radio') {
          typeLabel = `Radio button, ${target.checked ? 'selected' : 'not selected'}`;
        } else if (inputType === 'password') {
          typeLabel = 'Password field';
        } else if (inputType === 'search') {
          typeLabel = 'Search input';
        } else {
          typeLabel = 'Text input';
        }
      } else if (tag === 'textarea') {
        typeLabel = 'Text area';
      } else if (tag === 'select') {
        typeLabel = 'Dropdown selection';
      } else if (role === 'tab') {
        typeLabel = `Tab, ${target.getAttribute('aria-selected') === 'true' ? 'selected' : ''}`;
      } else if (role === 'menuitem') {
        typeLabel = 'Menu item';
      } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        typeLabel = 'Heading';
      } else if (role) {
        typeLabel = role;
      }

      // Extract accessible label/name
      let name = target.getAttribute('aria-label') || '';
      if (!name && target.getAttribute('aria-labelledby')) {
        const labelledBy = document.getElementById(target.getAttribute('aria-labelledby'));
        if (labelledBy) name = labelledBy.innerText || labelledBy.textContent || '';
      }
      if (!name && (tag === 'input' || tag === 'textarea')) {
        const labelEl = document.querySelector(`label[for="${target.id}"]`);
        if (labelEl) name = labelEl.innerText || labelEl.textContent || '';
        if (!name) name = target.placeholder || target.title || '';
      }
      if (!name) {
        name = target.innerText || target.textContent || target.title || target.getAttribute('placeholder') || '';
      }

      const cleanName = (name || '').replace(/\s+/g, ' ').trim().slice(0, 75);
      if (!cleanName && typeLabel === 'Item') return;

      const announcementText = cleanName ? `${typeLabel}: ${cleanName}` : typeLabel;

      // 80ms debounce so rapid Tabbing speaks only the final target element
      if (focusDebounceRef.current) clearTimeout(focusDebounceRef.current);
      focusDebounceRef.current = setTimeout(() => {
        speakVoiceAnnouncement(announcementText);
      }, 80);
    };

    window.addEventListener('keydown', handleKeyDownCapture, true);
    window.addEventListener('pointerdown', handlePointerDownCapture, true);
    document.addEventListener('focusin', handleFocusIn, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDownCapture, true);
      window.removeEventListener('pointerdown', handlePointerDownCapture, true);
      document.removeEventListener('focusin', handleFocusIn, true);
      if (focusDebounceRef.current) clearTimeout(focusDebounceRef.current);
      if (announceDebounceRef.current) clearTimeout(announceDebounceRef.current);
    };
  }, [preferences.auditory_orientation, speakVoiceAnnouncement]);

  // Global Keyboard Shortcuts Dispatcher
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;

      // Escape: Cancel speech or close shortcuts modal
      if (e.key === 'Escape') {
        stopCurrentAudio();
        if (shortcutsModalOpen) {
          setShortcutsModalOpen(false);
        }
        return;
      }

      // Alt + O: Spatial Orientation
      if (e.altKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        triggerFullOrientation();
        return;
      }

      // Alt + T: Toggle Theme
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        toggleTheme();
        announce(isLight ? "Dark theme enabled." : "Light theme enabled.", "polite", true);
        return;
      }

      // Alt + V: Toggle Voice Announcements
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        const nextVal = !preferences.auditory_orientation;
        updatePreference('auditory_orientation', nextVal);
        announce(nextVal ? "Auditory speech cues enabled." : "Auditory speech cues disabled.", "polite", true);
        return;
      }

      // Alt + H or '?' (when not typing in an input): Open Shortcuts Help
      if ((e.altKey && (e.key === 'h' || e.key === 'H')) || (!isInput && e.key === '?')) {
        e.preventDefault();
        setShortcutsModalOpen(prev => {
          const next = !prev;
          announce(next ? "Keyboard Shortcuts Guide opened. Press Escape to close." : "Shortcuts guide closed.", "polite", true);
          return next;
        });
        return;
      }

      // Alt + P: Toggle Lesson Audio Play/Pause
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('accessed:toggle-audio'));
        return;
      }

      // Alt + S: Toggle Lesson Simplification
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('accessed:toggle-simplify'));
        return;
      }

      // Alt + A: Focus AI Tutor Input
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('accessed:focus-ai'));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFullOrientation, toggleTheme, isLight, preferences.auditory_orientation, updatePreference, announce, shortcutsModalOpen, stopCurrentAudio]);

  return (
    <AuditoryOrientationContext.Provider
      value={{
        currentOrientation,
        updateOrientation,
        announce,
        triggerFullOrientation,
        stopCurrentAudio,
        liveMessage,
        shortcutsModalOpen,
        openShortcutsModal: () => setShortcutsModalOpen(true),
        closeShortcutsModal: () => setShortcutsModalOpen(false)
      }}
    >
      {children}

      {/* ARIA Live Regions for Native Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="aria-polite-region"
      >
        {liveMessage}
      </div>

      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="aria-assertive-region"
      >
        {assertiveMessage}
      </div>

      {/* Global Accessible Keyboard Shortcuts Guide Dialog */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </AuditoryOrientationContext.Provider>
  );
}

export function useAuditoryOrientation() {
  const context = useContext(AuditoryOrientationContext);
  if (!context) {
    throw new Error('useAuditoryOrientation must be used within AuditoryOrientationProvider');
  }
  return context;
}
