import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAccessibility } from '../../features/accessibility/AccessibilityContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button, IconButton } from '../../components/ui/Button';
import { AudioPlayer } from '../../components/ui/AudioPlayer';
import { StructuredContentRenderer, cleanSpokenText } from '../../components/common/StructuredContentRenderer';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Copy,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Languages,
  RotateCcw
} from 'lucide-react';

export function AITutorPage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  const { preferences } = useAccessibility();
  const { announce, updateOrientation } = useAuditoryOrientation();

  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: "### Welcome to your AccessEd AI Tutor! 🎓\n\nI am grounded in your active course: **Python Fundamentals & Memory Architecture**.\n\n- **Interactive Explanations:** Ask any programming question and get step-by-step breakdowns.\n- **Concrete Code Snippets:** Ready-to-copy code snippets with syntax explanations.\n- **Auditory Learning:** Every answer is announced aloud using natural speech.\n\nWhat concept would you like to explore today?",
      provider: "AccessEd Intelligence"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    updateOrientation({
      location: 'Contextual AI Tutor',
      section: 'Conversational Learning Surface',
      actions: ['Type question', 'Use voice input', 'Request cognitive simplification', 'Listen to audio response']
    });

    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Browser Speech-to-Text Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = true;
      recognizer.lang = preferences.selected_language || 'en-US';

      recognizer.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(res => res[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognizer.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        announce("Voice input stopped.", "polite");
      };

      recognizer.onend = () => {
        setIsListening(false);
        announce("Voice transcription ready for review. You can edit text before submitting.", "polite");
      };

      recognitionRef.current = recognizer;
    }
  }, [preferences.selected_language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      announce("Browser speech recognition is not supported on this browser. Keyboard entry is available.", "assertive");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        announce("Listening to speech. Speak your question clearly.", "polite");
      } catch (err) {
        console.warn('Failed to start recognition:', err);
      }
    }
  };

  const sendMessage = async (textToSend = inputText) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    announce("AI Tutor thinking...", "polite");

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.aiChat({
        message: textToSend,
        history,
        context: {
          course_title: "Python Fundamentals & Memory Architecture",
          lesson_title: "Variables, Data Types and Memory References",
          selected_language: preferences.selected_language,
          accessibility_mode: preferences.high_contrast ? "high_contrast" : "standard"
        }
      });

      const assistantMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: res.content,
        provider: res.provider_used
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Speak actual response via Microsoft Edge Neural TTS
      const spokenText = cleanSpokenText(res.content, 900);
      announce(spokenText, "polite", true);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: "The AI Tutor is temporarily unavailable. Please retry in a moment.",
          provider: "System"
        }
      ]);
      announce("AI Tutor is temporarily unavailable.", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    announce("Response copied to clipboard.", "polite");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReadAloud = (text) => {
    const spoken = cleanSpokenText(text, 2500);
    announce(spoken, "polite", true);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] space-y-4">
      {/* Context Badge Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
            <SymbolIcon name="ai" className="w-4 h-4" />
          </div>
          <div>
            <span className="text-2xs font-mono uppercase text-indigo-400 font-bold">Active Educational Context</span>
            <div className="text-xs font-semibold text-slate-200">
              Python Fundamentals • Variables & Memory
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-2xs text-slate-400 font-mono">
          <span>Language: {preferences.selected_language.toUpperCase()}</span>
          <span>•</span>
          <span className="text-emerald-400">Contextual Memory Active</span>
        </div>
      </div>

      {/* Message History Feed */}
      <div
        role="region"
        aria-label="Tutor Conversation History"
        className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl"
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-2 text-2xs text-slate-400 font-mono">
              <span className="font-semibold text-slate-300">
                {msg.role === 'user' ? 'You' : 'AccessEd AI Tutor'}
              </span>
              {msg.provider && <span className="text-3xs text-slate-400">({msg.provider})</span>}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950 text-slate-200 border border-slate-800/90 rounded-tl-none space-y-3'
              }`}
            >
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
              ) : (
                <StructuredContentRenderer rawContent={msg.content} />
              )}

              {/* Action Toolbar on Assistant Messages */}
              {msg.role === 'assistant' && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-850 text-2xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReadAloud(msg.content)}
                    icon={Volume2}
                  >
                    Read Aloud
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    icon={copiedId === msg.id ? CheckCircle2 : Copy}
                  >
                    {copiedId === msg.id ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 p-3 bg-slate-950 rounded-xl border border-slate-850">
            <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading contextual AI response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Pill if active */}
      {isListening && (
        <div className="p-2.5 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-between text-xs text-indigo-300 animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Listening to voice... Click mic again to finish and review text.</span>
          </div>
        </div>
      )}

      {/* Quick Inquiry Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-2xs font-mono">
        <span className="text-slate-400 shrink-0">Try asking:</span>
        {[
          "Explain memory addresses vs variable labels",
          "What is the difference between mutable and immutable?",
          "Show code example of object mutation in Python",
          "Give me an everyday analogy for blind learners"
        ].map((promptText, pIdx) => (
          <button
            key={pIdx}
            type="button"
            disabled={loading}
            onClick={() => sendMessage(promptText)}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-900/50 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-700/60 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Surface */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl"
      >
        <IconButton
          icon={isListening ? MicOff : Mic}
          label={isListening ? "Stop voice listening" : "Start speech-to-text input"}
          active={isListening}
          onClick={toggleVoiceInput}
          size="md"
        />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question or explain a concept in plain language..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent border-0 text-slate-100 placeholder-slate-400 focus-visible:outline-none"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim() || loading}
          icon={Send}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
