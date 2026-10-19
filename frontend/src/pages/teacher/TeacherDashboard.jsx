import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  BookOpen,
  FileText,
  AlertTriangle,
  ArrowRight,
  Eye,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';

export function TeacherDashboard() {
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateOrientation({
      location: 'Teacher Operational Overview',
      section: 'Administrative Dashboard',
      actions: ['Review pending OCR documents', 'Manage classes', 'Audit lesson accessibility', 'Review student submissions']
    });
    api.getTeacherDashboard().then(res => {
      setData(res);
      announce(`Teacher dashboard loaded. ${res.alerts?.length || 0} operational alerts require attention.`, 'polite');
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-12 animate-pulse text-xs text-slate-400">Loading educator operational telemetry...</div>;
  }

  const { teacher, classes, courses_summary, pending_document_jobs, recent_submissions, alerts, analytics_quick_view } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Editorial Operational Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            Curriculum Administration Suite
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Academic Operations Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {teacher?.organization || "Department of Computing & Inclusive Technology"} • Term Fall 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/teacher/documents">
            <Button variant="accent" size="sm" icon={FileText}>
              Upload Document (Gemini OCR)
            </Button>
          </Link>
          <Link to="/teacher/accessibility-preview">
            <Button variant="secondary" size="sm" icon={Eye}>
              A11y Previewer
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Key Metrics (Dense & High Contrast) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-3xs uppercase font-mono font-bold text-slate-400">Active Students</div>
          <div className="text-2xl font-bold text-white">{analytics_quick_view.total_students}</div>
          <div className="text-3xs text-emerald-400 font-semibold">100% Multimodal Onboarded</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-3xs uppercase font-mono font-bold text-slate-400">Lessons Published</div>
          <div className="text-2xl font-bold text-white">{analytics_quick_view.lessons_published}</div>
          <div className="text-3xs text-indigo-400">WCAG 2.2 AAA Verified</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-3xs uppercase font-mono font-bold text-slate-400">Quiz Pass Rate</div>
          <div className="text-2xl font-bold text-emerald-400">{analytics_quick_view.quiz_pass_rate}%</div>
          <div className="text-3xs text-slate-400">Average first-attempt</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-3xs uppercase font-mono font-bold text-slate-400">Pending OCR Reviews</div>
          <div className="text-2xl font-bold text-amber-400">{pending_document_jobs.length}</div>
          <div className="text-3xs text-amber-300">Requires educator review</div>
        </div>
      </div>

      {/* Operational Alerts Priority Strip */}
      {alerts?.length > 0 ? (
        <section aria-labelledby="alerts-heading" className="space-y-3">
          <h2 id="alerts-heading" className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
            Critical Review Items
          </h2>
          <div className="space-y-2">
            {alerts.map(alt => (
              <div
                key={alt.id}
                className="p-3.5 bg-amber-950/20 border border-amber-700/60 rounded-xl flex items-center justify-between text-xs gap-4"
              >
                <div className="flex items-center gap-2.5 text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{alt.message}</span>
                </div>
                <Link to={alt.link}>
                  <Button variant="accent" size="sm" className="text-xs">
                    Review Item
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section aria-labelledby="alerts-heading" className="space-y-3">
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All systems clear • No pending OCR document reviews or grading backlogs.</span>
            </div>
            <span className="text-2xs text-slate-400 font-mono">Status: Ready</span>
          </div>
        </section>
      )}

      {/* Structured Operational Tables: Classes & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Classes Table */}
        <section aria-labelledby="classes-heading" className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="classes-heading" className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
              Enrolled Cohort Classes
            </h2>
            <Link to="/teacher/classes" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
              Manage Cohorts →
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
            {classes && classes.length > 0 ? (
              classes.map(cls => (
                <div key={cls.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">{cls.title}</div>
                    <div className="flex items-center gap-3 text-2xs text-slate-400 font-mono">
                      <span>Code: {cls.code}</span>
                      <span>•</span>
                      <span>{cls.students_count} students</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs font-bold text-emerald-400">{cls.avg_mastery}% avg</span>
                    <div className="text-3xs text-slate-400">{cls.active_submissions} pending grading</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No class cohorts created yet. Use Class Management to organize cohorts.
              </div>
            )}
          </div>
        </section>

        {/* Recent Submissions Feed */}
        <section aria-labelledby="submissions-heading" className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="submissions-heading" className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
              Recent Submissions
            </h2>
            <Link to="/teacher/assignments" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
              View All →
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            {recent_submissions && recent_submissions.length > 0 ? (
              recent_submissions.map(asg => (
                <div key={asg.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{asg.title}</span>
                    <Badge variant={asg.status === 'SUBMITTED' ? 'warning' : 'success'}>
                      {asg.status}
                    </Badge>
                  </div>
                  <div className="text-2xs text-slate-400 font-mono">
                    Submitted by {asg.student_name || 'Enrolled Student'} {asg.score ? `• ${asg.score}/${asg.max_score}` : ''}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <CheckCircle2 className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                <div className="font-semibold text-slate-300">No Submissions Pending</div>
                <div className="text-2xs text-slate-500">Student submissions will appear here once assignments are completed.</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
