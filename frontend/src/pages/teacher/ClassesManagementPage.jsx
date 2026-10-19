import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Users, Plus, UserCheck, ShieldCheck } from 'lucide-react';

export function ClassesManagementPage() {
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');

  useEffect(() => {
    updateOrientation({
      location: 'Class Operations & Student Cohorts',
      section: 'Class Management',
      actions: ['Create new class cohort', 'View enrolled student accessibility preferences', 'Audit student mastery']
    });
    api.getClasses().then(data => {
      setClasses(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await api.createClass({
        title: newTitle.trim(),
        code: newCode.trim() || undefined,
        academic_term: "Fall 2026"
      });
      setClasses(prev => [created, ...prev]);
      setCreateModalOpen(false);
      setNewTitle('');
      setNewCode('');
      announce(`Created new class cohort: ${newTitle}.`, 'polite');
    } catch (err) {
      announce("Failed to create class cohort. Please retry.", "assertive");
    }
  };

  if (loading) {
    return <div className="p-12 animate-pulse text-xs text-slate-400">Loading class cohorts...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            Cohort Administration
          </span>
          <h1 className="text-3xl font-extrabold text-white">Class Management</h1>
          <p className="text-xs text-slate-400">
            Monitor real registered students and their active accessibility preferences by cohort.
          </p>
        </div>

        <Button variant="accent" size="sm" onClick={() => setCreateModalOpen(true)} icon={Plus}>
          Create New Class Cohort
        </Button>
      </div>

      <div className="space-y-6">
        {classes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Users className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No Class Cohorts Created</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first class cohort to start tracking student accessibility and curriculum progress.
            </p>
            <div className="pt-2">
              <Button variant="accent" size="sm" onClick={() => setCreateModalOpen(true)} icon={Plus}>
                Create Cohort Now
              </Button>
            </div>
          </div>
        ) : (
          classes.map(cls => (
            <div key={cls.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">{cls.title}</h2>
                  <div className="text-2xs font-mono text-slate-400">Code: {cls.code} • {cls.academic_term}</div>
                </div>
                <Badge variant="primary">{cls.enrolled_students?.length || 0} Registered Students</Badge>
              </div>

              {/* Students Table */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Enrolled Students & Verified Accessibility Profiles
                </div>

                {!cls.enrolled_students || cls.enrolled_students.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <Users className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                    <div className="font-semibold text-slate-300">No Students Registered Yet</div>
                    <div className="text-2xs text-slate-500">
                      When students register on AccessEd, their verified profiles and preferred modalities will appear here.
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                    {cls.enrolled_students.map(stu => (
                      <div key={stu.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            <span>{stu.full_name}</span>
                            <span className="text-3xs px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                              {stu.organization || 'Student'}
                            </span>
                          </div>
                          <div className="text-2xs text-slate-400 font-mono">{stu.email}</div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-left sm:text-right">
                            <div className="text-2xs font-mono text-indigo-400 font-bold">
                              {stu.preferred_mode}
                            </div>
                            <div className="text-3xs text-slate-400">Active Modality Preference</div>
                          </div>

                          <Badge variant={stu.completion_rate > 0 ? "success" : "neutral"}>
                            {stu.completion_rate}% Mastery
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Class Cohort"
      >
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="new-class-title" className="block font-semibold text-slate-200">
              Class Title
            </label>
            <input
              id="new-class-title"
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. CS202: Advanced Algorithms & Multimodal Systems"
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-class-code" className="block font-semibold text-slate-200">
              Class Code
            </label>
            <input
              id="new-class-code"
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. CS202-2026A"
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm">
              Save Class Cohort
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
