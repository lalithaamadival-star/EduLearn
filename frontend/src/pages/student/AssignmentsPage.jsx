import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../components/common/ToastContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  MessageSquare,
  Send,
  GraduationCap,
  Sparkles,
  BookOpen,
  RotateCcw
} from 'lucide-react';

export function AssignmentsPage() {
  const { user, setSelectedTeacher } = useAuth();
  const toast = useToast();
  const { announce, updateOrientation } = useAuditoryOrientation();

  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    updateOrientation({
      location: 'Assignments Workspace',
      section: 'Coursework Submissions',
      actions: ['Review assignment instructions', 'Submit coursework', 'Inspect teacher evaluations']
    });
    initPage();
  }, []);

  const initPage = async () => {
    setLoading(true);
    try {
      // 1. Load teachers list
      const tList = await api.getTeachers().catch(() => []);
      const teachersArr = Array.isArray(tList) ? tList : [];
      setTeachers(teachersArr);

      // 2. Active teacher resolution
      const savedTid = typeof localStorage !== 'undefined' ? localStorage.getItem('accessed_selected_teacher_id') : null;
      const initialTid = user?.selected_teacher_id || savedTid || (teachersArr.length > 0 ? teachersArr[0].id : null);
      if (initialTid) {
        setSelectedTeacherId(initialTid);
      }

      // 3. Load assignments
      const data = await api.getAssignments(null, initialTid);
      setAssignments(Array.isArray(data) ? data : []);
      announce(`Assignments loaded. ${data.length} coursework items found.`, 'polite');
    } catch (err) {
      console.error("Failed to load assignments:", err);
      announce("Failed to load assignments.", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = async (tid) => {
    setSwitching(true);
    setSelectedTeacherId(tid);
    if (tid && tid !== 'ALL') {
      localStorage.setItem('accessed_selected_teacher_id', tid);
      if (setSelectedTeacher) {
        setSelectedTeacher(tid);
      }
      try {
        await api.selectTeacher(tid);
      } catch (e) {
        console.warn("Server select-teacher sync:", e);
      }
    }

    try {
      const data = await api.getAssignments(null, tid === 'ALL' ? null : tid);
      setAssignments(Array.isArray(data) ? data : []);
      const activeObj = teachers.find(t => t.id === tid);
      toast.info(`Switched to ${activeObj ? activeObj.full_name : 'all faculty'}. Coursework updated.`);
      announce(`Coursework refreshed for ${activeObj ? activeObj.full_name : 'all faculty'}.`, 'polite');
    } catch (err) {
      toast.error("Failed to load assignments for selected educator.");
    } finally {
      setSwitching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsg || !submissionText.trim()) return;

    setSubmitting(true);
    try {
      const updated = await api.submitAssignment(selectedAsg.id, submissionText);
      setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
      setSelectedAsg(null);
      setSubmissionText('');
      toast.success("Assignment submitted successfully! Your educator will review it.");
      announce("Assignment submitted successfully. Awaiting educator review.", "polite");
    } catch (err) {
      toast.error(err.message || "Submission failed. Please check network connection.");
      announce("Submission failed. Please check network connection.", "assertive");
    } finally {
      setSubmitting(false);
    }
  };

  const assignedCount = assignments.filter(a => a.status === 'ASSIGNED').length;
  const submittedCount = assignments.filter(a => a.status === 'SUBMITTED').length;
  const gradedCount = assignments.filter(a => a.status === 'GRADED').length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-4">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header with Educator Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="space-y-1">
          <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
            Academic Submissions
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Coursework & Assignments</span>
            <Badge variant="primary">{assignments.length} Total</Badge>
          </h1>
          <p className="text-xs text-slate-400">
            Submit technical problem sets, review instructions, and inspect verified instructor feedback.
          </p>
        </div>

        {/* Educator Selector Pill */}
        {teachers.length > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-3xs uppercase font-mono font-bold text-slate-400">Curating Educator</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                disabled={switching}
                aria-label="Filter assignments by educator"
                className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer pr-2"
              >
                <option value="ALL" className="bg-slate-900 text-slate-100">All Faculty Educators</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                    {t.full_name} ({t.organization || 'Faculty'} • {t.courses_count || 0} courses)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono text-amber-400 font-bold uppercase">To Be Done</div>
            <div className="text-2xl font-black text-white">{assignedCount}</div>
          </div>
          <Clock className="w-6 h-6 text-amber-400/50" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono text-indigo-400 font-bold uppercase">Under Review</div>
            <div className="text-2xl font-black text-white">{submittedCount}</div>
          </div>
          <FileCheck2 className="w-6 h-6 text-indigo-400/50" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono text-emerald-400 font-bold uppercase">Graded & Evaluated</div>
            <div className="text-2xl font-black text-white">{gradedCount}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400/50" />
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {assignments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Coursework Assigned Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When your educator publishes technical problem sets or coursework, they will immediately appear here.
            </p>
            {teachers.length > 1 && (
              <div className="pt-2">
                <Button variant="outline" size="sm" icon={RotateCcw} onClick={() => handleTeacherChange('ALL')}>
                  View All Educators
                </Button>
              </div>
            )}
          </div>
        ) : (
          assignments.map(asg => (
            <div
              key={asg.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={asg.status === 'GRADED' ? 'success' : asg.status === 'SUBMITTED' ? 'primary' : 'warning'}>
                    {asg.status === 'ASSIGNED' ? 'Pending Solution' : asg.status}
                  </Badge>
                  <span className="text-2xs font-mono text-slate-400 font-semibold">{asg.course_title || 'General Curriculum'}</span>
                  {asg.instructor_name && (
                    <span className="text-3xs text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                      Prof. {asg.instructor_name}
                    </span>
                  )}
                </div>
                <span className="text-2xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {asg.due_date ? `Due ${new Date(asg.due_date).toLocaleDateString()}` : 'No Deadline'}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-100">{asg.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{asg.instructions}</p>

              {/* Student's Own Submission if submitted */}
              {asg.submission && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                  <span className="text-3xs uppercase font-mono font-bold text-slate-400">Your Submitted Response</span>
                  <p className="font-mono text-slate-300 whitespace-pre-wrap text-2xs bg-slate-900/60 p-2.5 rounded border border-slate-850">
                    {asg.submission}
                  </p>
                </div>
              )}

              {/* Teacher Feedback Block if graded */}
              {asg.feedback && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-indigo-300">
                    <MessageSquare className="w-4 h-4" />
                    <span>Instructor Evaluation • Awarded Score: {asg.score}/{asg.max_score} pts</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">"{asg.feedback}"</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-2xs font-mono text-slate-400">Maximum: {asg.max_score || 100} pts</span>
                {asg.status === 'ASSIGNED' ? (
                  <Button variant="primary" size="sm" onClick={() => setSelectedAsg(asg)}>
                    Submit Solution
                  </Button>
                ) : asg.status === 'GRADED' ? (
                  <span className="text-2xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Graded ({asg.score}/{asg.max_score} pts)
                  </span>
                ) : (
                  <span className="text-2xs text-amber-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solution Submitted (Awaiting Grade)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submission Modal Dialog */}
      <Modal
        isOpen={!!selectedAsg}
        onClose={() => setSelectedAsg(null)}
        title={selectedAsg?.title || "Submit Assignment"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">{selectedAsg?.instructions}</p>
          <div className="space-y-1.5">
            <label htmlFor="solution-input" className="block font-semibold text-slate-200">
              Your Implementation / Technical Solution *
            </label>
            <textarea
              id="solution-input"
              rows={7}
              required
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste your code implementation, proof, or technical analysis..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedAsg(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting} icon={Send}>
              Confirm Submission
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
