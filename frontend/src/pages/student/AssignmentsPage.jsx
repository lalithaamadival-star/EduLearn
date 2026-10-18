import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FileCheck2, Clock, CheckCircle2, MessageSquare, Send } from 'lucide-react';

export function AssignmentsPage() {
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [assignments, setAssignments] = useState([]);
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateOrientation({
      location: 'Assignments Workspace',
      section: 'Coursework Submissions',
      actions: ['Review assignment instructions', 'Submit coursework', 'Inspect teacher evaluations']
    });
    api.getAssignments().then(data => {
      setAssignments(data);
      announce(`Assignments loaded. ${data.length} coursework items found.`, 'polite');
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsg || !submissionText.trim()) return;

    setSubmitting(true);
    try {
      const updated = await api.submitAssignment(selectedAsg.id, submissionText);
      setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
      setSelectedAsg(null);
      setSubmissionText('');
      announce("Assignment submitted successfully. Awaiting educator review.", "polite");
    } catch (err) {
      announce("Submission failed. Please check network connection.", "assertive");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 animate-pulse text-xs text-slate-400">Loading assignments...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
          Academic Submissions
        </span>
        <h1 className="text-3xl font-extrabold text-white">Coursework & Assignments</h1>
        <p className="text-xs text-slate-400">
          Submit technical problem sets and review verified instructor feedback.
        </p>
      </div>

      <div className="space-y-6">
        {assignments.map(asg => (
          <div
            key={asg.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={asg.status === 'SUBMITTED' ? 'primary' : 'warning'}>
                  {asg.status}
                </Badge>
                <span className="text-2xs font-mono text-slate-400">{asg.course_title}</span>
              </div>
              <span className="text-2xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Due Oct 25, 2026
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-100">{asg.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{asg.instructions}</p>

            {/* Teacher Feedback Block if graded */}
            {asg.feedback && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-indigo-300">
                  <MessageSquare className="w-4 h-4" />
                  <span>Instructor Evaluation • Score: {asg.score}/{asg.max_score}</span>
                </div>
                <p className="text-slate-300 leading-relaxed italic">"{asg.feedback}"</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-2xs font-mono text-slate-400">Max Score: {asg.max_score} pts</span>
              {asg.status !== 'SUBMITTED' ? (
                <Button variant="primary" size="sm" onClick={() => setSelectedAsg(asg)}>
                  Submit Solution
                </Button>
              ) : (
                <span className="text-2xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solution Submitted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal Dialog */}
      <Modal
        isOpen={!!selectedAsg}
        onClose={() => setSelectedAsg(null)}
        title={selectedAsg?.title || "Submit Assignment"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">{selectedAsg?.instructions}</p>
          <div className="space-y-1.5">
            <label htmlFor="solution-input" className="block font-semibold text-slate-200">
              Your Implementation / Technical Solution
            </label>
            <textarea
              id="solution-input"
              rows={6}
              required
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste your implementation, proof, or technical analysis..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedAsg(null)}>
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
