import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, RotateCcw, FileText, Loader2, Sparkles, Info } from 'lucide-react';
import { Button, IconButton } from './Button';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { api } from '../../services/api';

export function AudioPlayer({
  audioUrl,
  transcript,
  title = "Audio Narrative",
  voiceName = "Neural Audio",
  language = "en",
  voiceId = null
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [activeAudioUrl, setActiveAudioUrl] = useState(audioUrl || null);
  const [currentVoiceName, setCurrentVoiceName] = useState(voiceName);
  const [infoMessage, setInfoMessage] = useState(null);

  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const { announce, stopCurrentAudio } = useAuditoryOrientation();

  // Reset audio state when transcript or language or voiceId changes
  useEffect(() => {
    stopPlayback();
    setActiveAudioUrl(audioUrl || null);
    setCurrentVoiceName(voiceName);
    setInfoMessage(null);
  }, [transcript, language, voiceId, audioUrl]);

  // Adjust playback speed on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  // Global keyboard shortcut listener for Alt+P
  useEffect(() => {
    const handleToggleAudio = () => {
      handlePlayPause();
    };
    window.addEventListener('accessed:toggle-audio', handleToggleAudio);
    return () => window.removeEventListener('accessed:toggle-audio', handleToggleAudio);
  });

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
      announce("Audio playback paused.", "polite");
    } else {
      startPlayback();
    }
  };

  const startPlayback = async () => {
    // Silence any active navigation speech immediately
    stopCurrentAudio();

    // 1. If we already have a generated or provided audio URL
    if (activeAudioUrl && audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        announce("Audio playback started.", "polite", false);
        return;
      } catch (e) {
        console.warn("Direct audio playback failed:", e);
      }
    }

    // 2. Fetch neural synthesis from backend
    if (transcript) {
      setIsLoading(true);
      setInfoMessage(null);
      announce("Generating neural speech narration...", "polite", false);
      try {
        const res = await api.synthesizeTTS(transcript, language, voiceId);
        if (res && res.audio_url) {
          const resolvedUrl = res.audio_url.startsWith('http')
            ? res.audio_url
            : `http://localhost:8000${res.audio_url}`;

          setActiveAudioUrl(resolvedUrl);
          setCurrentVoiceName(res.voice_name || (language === 'kn' ? 'Microsoft Neural (Sapna - Kannada)' : 'Microsoft Neural (Prabhat - Indian English)'));
          setIsLoading(false);
          setIsPlaying(true);

          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = resolvedUrl;
              audioRef.current.playbackRate = rate;
              audioRef.current.play().catch(playErr => {
                console.error("Audio playback failed on new source:", playErr);
                fallbackToWebSpeech();
              });
            }
          }, 80);
          return;
        } else if (res && res.use_browser_fallback) {
          setCurrentVoiceName(res.voice_name || "Browser Web Speech Fallback");
          if (res.error_detail) {
            setInfoMessage(res.error_detail);
          }
          fallbackToWebSpeech();
        } else {
          fallbackToWebSpeech();
        }
      } catch (err) {
        console.warn("TTS synthesis error:", err);
        setInfoMessage("Backend audio server reachable? Using Web Speech engine.");
        fallbackToWebSpeech();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fallbackToWebSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && transcript) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.rate = rate;
      utterance.lang = language === 'kn' ? 'kn-IN' : 'en-US';
      utterance.onend = () => {
        setIsPlaying(false);
        announce("Audio playback completed.", "polite");
      };
      utterance.onerror = (e) => {
        setIsPlaying(false);
        console.warn("SpeechSynthesis error:", e);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      announce("Playing through device speech synthesizer.", "polite", false);
    } else {
      setIsPlaying(false);
      announce("Speech synthesis unavailable.", "assertive");
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  const cycleRate = () => {
    const rates = [0.85, 1.0, 1.25, 1.5];
    const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setRate(nextRate);
    announce(`Speech speed set to ${nextRate}x`, "polite");
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-lg space-y-3">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={activeAudioUrl || undefined}
        onEnded={() => {
          setIsPlaying(false);
          announce("Audio playback completed.", "polite");
        }}
        onError={(e) => {
          console.warn("Audio element error:", e);
        }}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-950/70 text-indigo-400 border border-indigo-800/40 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>{title}</span>
              {activeAudioUrl && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  <Sparkles className="w-2.5 h-2.5" /> Neural Audio Ready
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {currentVoiceName}
            </div>
          </div>
        </div>

        {/* Animated Waveform Bars */}
        {isPlaying && (
          <div className="flex items-center gap-1 h-6 px-3 py-1 bg-indigo-950/40 rounded-full border border-indigo-800/30" aria-hidden="true">
            <span className="w-1 bg-indigo-400 rounded-full animate-wave-bar-1 h-3" />
            <span className="w-1 bg-indigo-400 rounded-full animate-wave-bar-2 h-5" />
            <span className="w-1 bg-indigo-400 rounded-full animate-wave-bar-3 h-2" />
            <span className="w-1 bg-indigo-400 rounded-full animate-wave-bar-4 h-4" />
            <span className="w-1 bg-indigo-400 rounded-full animate-wave-bar-5 h-3" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "outline" : "primary"}
            onClick={handlePlayPause}
            disabled={isLoading}
            ariaLabel={isPlaying ? "Pause audio narration" : "Play audio narration"}
            icon={isLoading ? Loader2 : (isPlaying ? Pause : Play)}
            className={isLoading ? "animate-pulse" : ""}
          >
            {isLoading ? "Synthesizing..." : (isPlaying ? "Pause" : "Listen")}
          </Button>

          {isPlaying && (
            <IconButton
              icon={Square}
              label="Stop playback"
              onClick={() => {
                stopPlayback();
                announce("Audio playback stopped.", "polite");
              }}
              size="sm"
            />
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={cycleRate}
            ariaLabel={`Playback speed: ${rate}x. Click to change.`}
          >
            {rate}x
          </Button>

          <IconButton
            icon={FileText}
            label={showTranscript ? "Hide transcript" : "Show transcript"}
            active={showTranscript}
            onClick={() => setShowTranscript(!showTranscript)}
            size="sm"
          />
        </div>
      </div>

      {/* Notice / Fallback Message if any */}
      {infoMessage && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Accessible Synchronized Transcript */}
      {showTranscript && transcript && (
        <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed max-h-36 overflow-y-auto">
          <div className="text-2xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Accessible Equivalent Transcript
          </div>
          <p className="leading-normal">{transcript}</p>
        </div>
      )}
    </div>
  );
}

