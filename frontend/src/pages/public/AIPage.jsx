import React from 'react';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Sparkles, Cpu, Layers, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export function AIPage() {
  const { isTeacher, isStudent } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 font-semibold">
          <SymbolIcon name="ai" className="w-3.5 h-3.5 text-indigo-400" />
          <span>Assistive Intelligence</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Contextual AI Built for Comprehension
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          AccessEd rejects generic chat wrappers. Our AI layer operates with deep pedagogical context, grounded in the student's active lesson, past quiz errors, and accessibility preferences.
        </p>
      </div>

      {/* Fallback Architecture Flow Diagram */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>Two-Tier Resilient Inference Pipeline</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-indigo-400 font-mono font-bold">Step 1: Primary Inference</div>
            <div className="text-sm font-semibold text-slate-100">Groq (LLaMA 3.3 70B / 120B)</div>
            <p className="text-slate-400">High-throughput, low-latency generation for immediate tutor responses and step-by-step simplification.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-sky-400 font-mono font-bold">Step 2: Resilient Failover</div>
            <div className="text-sm font-semibold text-slate-100">OpenRouter (Nemotron 3.5 Lightning)</div>
            <p className="text-slate-400">Automatic background fallback when rate limits or provider network timeouts occur. Invisible to the user.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-mono font-bold">Step 3: Pedagogical Fallback</div>
            <div className="text-sm font-semibold text-slate-100">Local Assistive Engine</div>
            <p className="text-slate-400">Guarantees that network loss never blocks a student taking an exam or reviewing a lesson.</p>
          </div>
        </div>
      </div>

      {/* Non-Negotiable Safety Rule */}
      <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-lg font-bold text-amber-300">Non-Negotiable AI Curriculum Rule</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI-generated educational content must <strong>NEVER</strong> automatically become published student coursework. Every generated outline, quiz question, and document extraction enters a mandatory educator review gate before publishing.
          </p>
        </div>
        {isTeacher ? (
          <Link to="/teacher/documents">
            <Button variant="accent" size="sm">
              Inspect Review Pipeline
            </Button>
          </Link>
        ) : isStudent ? (
          <Link to="/student/ai-tutor">
            <Button variant="primary" size="sm">
              Consult Contextual AI Tutor
            </Button>
          </Link>
        ) : (
          <Link to="/signin">
            <Button variant="accent" size="sm">
              Sign In to Platform
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
