import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  Sparkles,
  Save,
  Eye,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Languages,
  Code2
} from 'lucide-react';

export function LessonBuilderPage() {
  const { announce, updateOrientation } = useAuditoryOrientation();

  const [title, setTitle] = useState('Dynamic Memory Allocation & Garbage Collection');
  const [content, setContent] = useState(
    '# Dynamic Memory Allocation & Garbage Collection\n\n' +
    'Python manages memory automatically using reference counting combined with a generational cycle detector.\n\n' +
    '### Reference Counting Mechanism\n' +
    'Every object maintains an ob_refcnt counter. When a reference is dropped to zero, memory is immediately deallocated.'
  );
  const [aiDraft, setAiDraft] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAiAction = async (actionType) => {
    setLoadingAi(true);
    announce(`Requesting Teacher AI assistance: ${actionType}.`, 'polite');
    try {
      const res = await api.aiTeacherAssist(
        `Perform task: ${actionType} on this lesson content:`,
        content
      );
      setAiDraft(res.content);
      announce("AI Co-pilot generated draft for your review.", 'polite');
    } catch (e) {
      announce("Teacher AI assistant unavailable.", 'assertive');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAcceptAiDraft = () => {
    setContent(aiDraft);
    setAiDraft('');
    announce("AI draft applied to active lesson editor.", 'polite');
  };

  const handleSaveLesson = () => {
    setSavedSuccess(true);
    announce("Lesson curriculum saved and published.", 'polite');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            Curriculum Authoring
          </span>
          <h1 className="text-3xl font-extrabold text-white">Lesson Builder & AI Co-pilot</h1>
          <p className="text-xs text-slate-400">
            Author rich accessible markdown lessons with assistive AI scaffolding and mandatory review gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="accent" size="sm" onClick={handleSaveLesson} icon={Save}>
            {savedSuccess ? "Saved & Published" : "Publish Lesson"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Lesson Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="builder-title" className="block text-xs font-semibold text-slate-200">
              Lesson Title
            </label>
            <input
              id="builder-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="builder-content" className="block text-xs font-semibold text-slate-200">
                Lesson Content (Markdown / Code / Headings)
              </label>
              <span className="text-3xs text-slate-400 font-mono">Semantic Markdown</span>
            </div>
            <textarea
              id="builder-content"
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-slate-100 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Teacher AI Assistive Toolkit */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <SymbolIcon name="ai" className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Teacher AI Co-pilot
              </h2>
            </div>

            <p className="text-xs text-slate-400">
              Generate pedagogical variations. All drafts require your review before applying.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleAiAction('improve_explanation')}
                disabled={loadingAi}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-left transition-colors"
              >
                ✨ Improve Clarity
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('simplify_content')}
                disabled={loadingAi}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-left transition-colors"
              >
                🔍 Simplify Cognitively
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('generate_quiz_questions')}
                disabled={loadingAi}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-left transition-colors"
              >
                📝 Generate Quiz
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('audit_accessibility')}
                disabled={loadingAi}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-left transition-colors"
              >
                ♿ A11y Audit
              </button>
            </div>

            {loadingAi && (
              <div className="text-xs text-amber-400 animate-pulse p-2 flex items-center gap-2">
                <SymbolIcon name="processing" className="w-4 h-4" />
                <span>AI Co-pilot generating pedagogical draft...</span>
              </div>
            )}

            {/* AI Review Gate */}
            {aiDraft && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/60 space-y-3">
                <div className="flex items-center justify-between text-2xs font-bold text-amber-300 uppercase font-mono">
                  <span>AI Draft for Review</span>
                  <Badge variant="warning">Awaiting Approval</Badge>
                </div>
                <div className="max-h-48 overflow-y-auto text-xs text-slate-200 p-2.5 bg-slate-950 rounded-lg whitespace-pre-wrap font-mono">
                  {aiDraft}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setAiDraft('')}>
                    Discard
                  </Button>
                  <Button variant="accent" size="sm" onClick={handleAcceptAiDraft}>
                    Accept into Editor
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
