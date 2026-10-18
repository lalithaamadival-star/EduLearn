import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RotateCcw, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, Sparkles } from 'lucide-react';

export function RevisionPage() {
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [revisionData, setRevisionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateOrientation({
      location: 'Intelligent Revision Hub',
      section: 'Targeted Conceptual Reinforcement',
      actions: ['Review missed quiz concepts', 'Launch targeted practice', 'Mark concept reviewed']
    });
    api.getProgress().then(res => {
      setRevisionData(res.revision_records || []);
      announce(`Revision Hub loaded. ${res.revision_records?.length || 0} active revision targets.`, 'polite');
    }).finally(() => setLoading(false));
  }, []);

  const handleToggleReviewed = (id) => {
    setRevisionData(prev => prev.map(item =>
      item.id === id ? { ...item, is_reviewed: !item.is_reviewed } : item
    ));
    announce("Revision target status updated.", "polite");
  };

  if (loading) {
    return <div className="p-12 animate-pulse text-xs text-slate-400">Loading intelligent revision queue...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
          Cognitive Reinforcement
        </span>
        <h1 className="text-3xl font-extrabold text-white">Intelligent Revision Hub</h1>
        <p className="text-xs text-slate-400">
          Targeted study recommendations generated from your quiz performance, conceptual hesitations, and saved notes.
        </p>
      </div>

      <div className="space-y-6">
        {revisionData.map(item => (
          <div
            key={item.id}
            className={`p-6 rounded-2xl border transition-all ${
              item.is_reviewed
                ? 'bg-slate-900/40 border-slate-800 opacity-75'
                : 'bg-slate-900 border-indigo-700/50 shadow-lg'
            } space-y-4`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={item.is_reviewed ? 'neutral' : 'warning'}>
                  {item.is_reviewed ? 'Mastery Verified' : 'Needs Reinforcement'}
                </Badge>
                <span className="text-2xs font-mono text-slate-400">{item.course_title}</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleReviewed(item.id)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {item.is_reviewed ? 'Mark for Re-study' : 'Mark Reviewed'}
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-100">{item.topic}</h2>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-400 text-2xs uppercase tracking-wider">Diagnostic Trigger:</div>
              <p>{item.reason}</p>
            </div>

            <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
              <div className="font-bold text-indigo-300 text-2xs uppercase tracking-wider">Recommended Action:</div>
              <p>{item.recommended_action}</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/courses/python-fundamentals/lessons/variables-and-memory">
                <Button variant="primary" size="sm" icon={BookOpen}>
                  Open Section in Lesson Reader
                </Button>
              </Link>
              <Link to={`/student/ai-tutor?prompt=Explain%20why%20I%20might%20get%20confused%20by%20${encodeURIComponent(item.topic)}`}>
                <Button variant="outline" size="sm" icon={Sparkles}>
                  Ask AI Tutor to Test Me
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
