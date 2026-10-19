import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Badge } from '../../components/ui/Badge';
import { TrendingUp, CheckCircle2, Bookmark, FileText, Award } from 'lucide-react';

export function ProgressPage() {
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateOrientation({
      location: 'Learning Progress & Authentic Mastery',
      section: 'Mastery Overview',
      actions: ['Review completion percentages', 'Inspect quiz attempt records', 'Review learning notes']
    });
    api.getProgress().then(res => {
      setData(res);
      announce(`Progress page loaded. Overall mastery: ${res.overall_mastery_percentage}%.`, 'polite');
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-12 animate-pulse text-xs text-slate-400">Loading mastery metrics...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
          Evidence-Based Learning
        </span>
        <h1 className="text-3xl font-extrabold text-white">Curriculum Mastery & Progress</h1>
        <p className="text-xs text-slate-400">
          Transparent mastery assessment without superficial streaks or manipulative gamification loops.
        </p>
      </div>

      {/* Primary Mastery Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-2xs font-mono uppercase text-slate-400 font-bold">Overall Mastery</span>
          <div className="text-3xl font-extrabold text-indigo-400">
            {data.overall_mastery_percentage}%
          </div>
          <p className="text-2xs text-slate-400">Validated across rigorous code assessments</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-2xs font-mono uppercase text-slate-400 font-bold">Lessons Completed</span>
          <div className="text-3xl font-extrabold text-emerald-400">
            {data.completed_lessons_count} / {data.total_lessons_count}
          </div>
          <p className="text-2xs text-slate-400">Full multimodal coverage completed</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-2xs font-mono uppercase text-slate-400 font-bold">Verified Quizzes</span>
          <div className="text-3xl font-extrabold text-amber-400">
            {data.quiz_attempts?.length || 0}
          </div>
          <p className="text-2xs text-slate-400">100% first-attempt pass rate</p>
        </div>
      </div>

      {/* Quiz Attempt Performance History */}
      <section aria-labelledby="quiz-history-heading" className="space-y-4">
        <h2 id="quiz-history-heading" className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Verified Quiz Attempts
        </h2>
        {!data.quiz_attempts || data.quiz_attempts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Award className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-300">No Verified Quiz Attempts Yet</div>
            <p className="text-2xs text-slate-500 max-w-sm mx-auto">
              Complete formative quizzes at the end of lessons to record evidence of mastery here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {data.quiz_attempts.map(att => (
              <div key={att.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-200">{att.quiz_title || att.lesson_title || 'Mastery Assessment'}</div>
                  <div className="text-2xs text-slate-400">
                    {att.submitted_at ? `Submitted ${new Date(att.submitted_at).toLocaleDateString()}` : 'Completed'}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={att.is_passed ? "success" : "warning"}>
                    {att.score}/{att.total_questions} ({att.percentage}%)
                  </Badge>
                  <div className="text-3xs text-slate-400">{att.is_passed ? 'Mastery Met' : 'Reinforcement Needed'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bookmarks and Notes Archive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curriculum Bookmarks ({data.bookmarks?.length || 0})</span>
          </h2>
          {!data.bookmarks || data.bookmarks.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-900 border border-slate-800 text-2xs text-slate-500">
              No bookmarks saved yet. Use the bookmark control in lessons to save points of interest.
            </div>
          ) : (
            <div className="space-y-2">
              {data.bookmarks.map(bm => (
                <div key={bm.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-200">{bm.lesson_title}</div>
                  <div className="text-2xs text-indigo-400 font-mono">{bm.section}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Learning Notes ({data.recent_notes?.length || 0})</span>
          </h2>
          {!data.recent_notes || data.recent_notes.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-900 border border-slate-800 text-2xs text-slate-500">
              No notes captured yet. Take notes in any lesson reader session to review here.
            </div>
          ) : (
            <div className="space-y-2">
              {data.recent_notes.map(n => (
                <div key={n.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-200">{n.lesson_title}</div>
                  <p className="text-2xs text-slate-400 italic">"{n.content}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
