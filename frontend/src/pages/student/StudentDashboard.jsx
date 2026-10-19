import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  FileText
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { announce } = useAuditoryOrientation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announce("Student Dashboard loaded. Press Tab to explore continue learning, upcoming assignments, and AI tutor.", "polite");
    api.getStudentDashboard()
      .then(res => setData(res))
      .catch(err => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard data">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  const { assigned_teacher, continue_learning, upcoming_assignments, recent_notes, bookmarks, overall_progress } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
            AccessEd Student Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || user?.full_name || 'Learner'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal learning active • {overall_progress?.total_lessons || 0} lessons in curriculum
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <SymbolIcon name="progress" className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="font-semibold text-slate-200">Curriculum Mastery</div>
            <div className="text-2xs text-slate-400">{overall_progress?.percentage || 0}% completed across enrolled courses</div>
          </div>
        </div>
      </div>

      {/* Faculty Instructor Card */}
      {assigned_teacher && (
        <section aria-label="Course Educator Information" className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <SymbolIcon name="learning" className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xs uppercase font-mono font-bold text-amber-400">Assigned Educator</span>
                <span className="text-3xs text-slate-400">• {assigned_teacher.organization || 'Faculty Department'}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{assigned_teacher.full_name}</h3>
              <p className="text-2xs text-slate-400 font-mono">{assigned_teacher.email}</p>
            </div>
          </div>

          <a href={`mailto:${assigned_teacher.email}`}>
            <Button variant="outline" size="sm" className="text-xs">
              Contact Instructor
            </Button>
          </a>
        </section>
      )}

      {/* 1. VISUALLY DOMINANT: Continue Learning Hero Card */}
      <section aria-labelledby="continue-learning-heading">
        <h2 id="continue-learning-heading" className="text-xs uppercase font-mono font-bold text-slate-400 mb-3 tracking-wider">
          Primary Learning Focus
        </h2>

        {continue_learning && continue_learning.has_content ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-700/50 shadow-xl relative overflow-hidden hero-focus-card">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-600/5 pointer-events-none hero-focus-card-glow" />
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="primary">Active Course</Badge>
                <span className="text-xs text-slate-400 font-medium">{continue_learning.course_title}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {continue_learning.lesson_title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Resume your structured coursework with full accessibility options (TTS, simplified text, AAA contrast).
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to={`/courses/${continue_learning.course_slug}/lessons/${continue_learning.lesson_slug}`}>
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Resume Lesson Reader
                  </Button>
                </Link>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  ~{continue_learning.estimated_minutes} min remaining
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-indigo-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Coursework Published Yet</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Your instructor {assigned_teacher ? `(${assigned_teacher.full_name})` : ''} is currently preparing new coursework. You can test the AI Tutor below or verify your accessibility settings.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/student/ai-tutor">
                <Button variant="primary" size="sm" icon={Sparkles}>
                  Consult AI Tutor
                </Button>
              </Link>
              <Link to="/student/accessibility-center">
                <Button variant="outline" size="sm">
                  Accessibility Center
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 2. Secondary Editorial Grid: AI Tutor + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contextual AI Tutor Surface */}
        <section aria-labelledby="ai-tutor-quick-heading" className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="ai-tutor-quick-heading" className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
              Contextual AI Tutor
            </h2>
            <Link to="/student/ai-tutor" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Open Full Conversation →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                <SymbolIcon name="ai" className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Grounded in Active Lesson</div>
                <div className="text-2xs text-slate-400">Ask questions or request plain language analogies</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-300 italic">
              "Would you like me to walk through the difference between reassignment (<code>x = 42</code>) and mutable mutation (<code>list.append()</code>)?"
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/student/ai-tutor?prompt=Explain%20mutable%20aliasing%20with%20an%20analogy">
                <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 text-left transition-colors">
                  💡 "Explain with an everyday analogy"
                </button>
              </Link>
              <Link to="/student/ai-tutor?prompt=Give%20me%20a%20practice%20quiz%20question">
                <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 text-left transition-colors">
                  📝 "Give me a quick practice question"
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Work & Submissions */}
        <section aria-labelledby="upcoming-work-heading" className="lg:col-span-5 space-y-3">
          <h2 id="upcoming-work-heading" className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
            Assigned Work
          </h2>

          <div className="space-y-3">
            {upcoming_assignments && upcoming_assignments.length > 0 ? (
              upcoming_assignments.map((asg) => (
                <div key={asg.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-amber-400 font-semibold uppercase tracking-wider">Pending Submission</span>
                    <span className="text-slate-400">Due {asg.due_date || 'Upcoming'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">{asg.title}</h3>
                  <p className="text-2xs text-slate-400 line-clamp-2">{asg.instructions}</p>
                  <div className="pt-2">
                    <Link to="/student/assignments">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View Assignment & Submit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2 text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="font-semibold text-slate-200">No Pending Coursework</div>
                <div className="text-2xs text-slate-500">You are all caught up with current assignments.</div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 3. Lower Activity: Recent Notes & Bookmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Saved Bookmarks</span>
          </div>
          <div className="space-y-2">
            {bookmarks && bookmarks.length > 0 ? (
              bookmarks.map(bm => (
                <div key={bm.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-slate-200">{bm.lesson_title}</div>
                  <div className="text-2xs text-indigo-400">{bm.section}</div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-slate-500">
                No bookmarks saved yet. Use the bookmark tool while reading lessons.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Personal Learning Notes</span>
          </div>
          <div className="space-y-2">
            {recent_notes && recent_notes.length > 0 ? (
              recent_notes.map(n => (
                <div key={n.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-slate-200">{n.lesson_title}</div>
                  <p className="text-2xs text-slate-400 italic">"{n.content}"</p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-slate-500">
                No personal notes taken yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
