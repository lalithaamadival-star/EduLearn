import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  FileCheck2,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  BookOpen,
  Calendar,
  Award,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  Filter,
  Check,
  Sparkles
} from 'lucide-react';
import { useToast } from '../../components/common/ToastContext';

export function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { announce, updateOrientation } = useAuditoryOrientation();

  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'SUBMITTED' | 'GRADED'

  // Create Assignment Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState('manual'); // 'manual' | 'ai'
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('Intermediate');
  const [aiGenerating, setAiGenerating] = useState(false);

  const [newCourseId, setNewCourseId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxScore, setNewMaxScore] = useState(100);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Grading Modal State
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedAsgForGrading, setSelectedAsgForGrading] = useState(null);
  const [gradeScore, setGradeScore] = useState(90);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    updateOrientation({
      location: 'Coursework & Assignment Suite',
      section: 'Assignments Management',
      actions: ['Create new assignment', 'Assign coursework to students', 'Evaluate submissions']
    });
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, asgsData] = await Promise.all([
        api.getCourses(user?.id).catch(() => []),
        api.getAssignments().catch(() => [])
      ]);
      const courseList = Array.isArray(coursesData) ? coursesData : [];
      setCourses(courseList);
      if (courseList.length > 0 && !newCourseId) {
        setNewCourseId(courseList[0].id);
      }
      const asgList = Array.isArray(asgsData) ? asgsData : [];
      setAssignments(asgList);
      announce(`Loaded ${asgList.length} assignments across ${courseList.length} courses.`, 'polite');
    } catch (err) {
      console.error("Failed to load assignments data:", err);
      announce("Failed to load assignments data. Please refresh.", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = (preselectedCourseId = null, mode = 'manual') => {
    if (preselectedCourseId) {
      setNewCourseId(preselectedCourseId);
    } else if (courses.length > 0) {
      setNewCourseId(courses[0].id);
    }
    setCreateMode(mode);
    setAiTopic('');
    setNewTitle('');
    setNewInstructions('');
    setNewDueDate('');
    setNewMaxScore(100);
    setCreateError('');
    setCreateModalOpen(true);
  };

  const handleGenerateWithAI = async () => {
    if (!aiTopic.trim()) {
      setCreateError('Please enter a topic or concept for the AI generator.');
      return;
    }
    setAiGenerating(true);
    setCreateError('');
    try {
      const selectedCourse = courses.find(c => String(c.id) === String(newCourseId));
      const courseTitle = selectedCourse ? selectedCourse.title : 'Computer Science Curriculum';
      const draft = await api.aiGenerateAssignment({
        topic: aiTopic.trim(),
        course_title: courseTitle,
        difficulty: aiDifficulty
      });

      setNewTitle(draft.title || `Problem Set: ${aiTopic.trim()}`);
      setNewInstructions(draft.instructions || '');
      setNewMaxScore(draft.max_score || 100);

      const d = new Date();
      d.setDate(d.getDate() + (draft.suggested_due_days || 7));
      setNewDueDate(d.toISOString().split('T')[0]);

      setCreateMode('manual');
      toast.info("AI generated assignment draft! Review the parameters below and assign.");
      announce("AI drafted assignment successfully. You can now adjust parameters and assign to students.", "polite");
    } catch (err) {
      setCreateError(err.message || 'Failed to generate assignment with AI.');
      toast.error('AI generation failed. Please try a different topic.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newCourseId) {
      setCreateError('Please select a course for this assignment.');
      return;
    }
    if (!newTitle.trim()) {
      setCreateError('Please enter an assignment title.');
      return;
    }
    if (!newInstructions.trim()) {
      setCreateError('Please enter detailed instructions.');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      const payload = {
        course_id: newCourseId,
        title: newTitle.trim(),
        instructions: newInstructions.trim(),
        due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
        max_score: Number(newMaxScore) || 100
      };
      const created = await api.createAssignment(payload);
      setAssignments(prev => [created, ...prev]);
      setCreateModalOpen(false);
      toast.success(`Assignment "${created.title}" successfully assigned to students!`);
      announce(`Assignment "${created.title}" successfully assigned to students!`, 'polite');
    } catch (err) {
      console.error("Assignment creation error:", err);
      setCreateError(err.message || 'Failed to create assignment.');
      toast.error(`Failed to create assignment: ${err.message}`);
      announce("Failed to create assignment. Please retry.", "assertive");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenGradeModal = (asg) => {
    setSelectedAsgForGrading(asg);
    setGradeScore(asg.score !== null && asg.score !== undefined ? asg.score : asg.max_score || 100);
    setGradeFeedback(asg.feedback || 'Great technical reasoning and clear understanding of core concepts.');
    setGradeModalOpen(true);
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!selectedAsgForGrading) return;

    setGrading(true);
    try {
      const updated = await api.gradeAssignment(selectedAsgForGrading.id, {
        score: Number(gradeScore),
        feedback: gradeFeedback.trim()
      });
      setAssignments(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
      setGradeModalOpen(false);
      toast.success(`Evaluation saved: ${gradeScore}/${selectedAsgForGrading.max_score || 100} points awarded!`);
      announce(`Grade ${gradeScore}/${selectedAsgForGrading.max_score || 100} and feedback saved for student!`, 'polite');
    } catch (err) {
      console.error("Failed to submit grade:", err);
      toast.error(`Failed to submit grade: ${err.message}`);
      announce("Failed to save grade evaluation. Please retry.", "assertive");
    } finally {
      setGrading(false);
    }
  };

  const handleDeleteAssignment = async (asgId, title) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"?`)) {
      return;
    }
    try {
      await api.deleteAssignment(asgId);
      setAssignments(prev => prev.filter(a => a.id !== asgId));
      toast.info(`Assignment "${title}" removed.`);
      announce(`Assignment "${title}" removed.`, 'polite');
    } catch (err) {
      console.error("Failed to delete assignment:", err);
      toast.error(`Failed to delete assignment: ${err.message}`);
      announce("Failed to delete assignment.", "assertive");
    }
  };

  // Filtered Assignments
  const filteredAssignments = assignments.filter(asg => {
    if (selectedCourseFilter !== 'ALL' && String(asg.course_id) !== String(selectedCourseFilter)) {
      return false;
    }
    if (statusFilter !== 'ALL' && asg.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (asg.title || '').toLowerCase().includes(q);
      const matchCourse = (asg.course_title || '').toLowerCase().includes(q);
      const matchInstructions = (asg.instructions || '').toLowerCase().includes(q);
      return matchTitle || matchCourse || matchInstructions;
    }
    return true;
  });

  // KPI Metrics
  const totalAssigned = assignments.length;
  const pendingSubmissions = assignments.filter(a => a.status === 'ASSIGNED').length;
  const needsGrading = assignments.filter(a => a.status === 'SUBMITTED').length;
  const gradedCount = assignments.filter(a => a.status === 'GRADED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="space-y-4 border-b border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              Curriculum Operational Suite
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Coursework & Assignments Manager
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Author technical problem sets, assign coursework to your student cohorts, review submissions, and provide evaluated grading feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              onClick={() => handleOpenCreateModal(null, 'ai')}
              className="text-xs"
            >
              Draft with AI
            </Button>
            <Button
              variant="accent"
              size="md"
              icon={Plus}
              onClick={() => handleOpenCreateModal(null, 'manual')}
              className="shadow-lg font-bold text-xs"
            >
              Create Manually
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-2xs font-mono uppercase text-slate-400 font-semibold">Total Assigned</div>
            <div className="text-2xl font-bold text-white">{totalAssigned}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-2xs font-mono uppercase text-slate-400 font-semibold">Pending Submissions</div>
            <div className="text-2xl font-bold text-amber-300">{pendingSubmissions}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-amber-600/40 bg-amber-950/20 space-y-1">
            <div className="text-2xs font-mono uppercase text-amber-300 font-semibold">Needs Review</div>
            <div className="text-2xl font-bold text-amber-400">{needsGrading}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-2xs font-mono uppercase text-slate-400 font-semibold">Evaluated & Graded</div>
            <div className="text-2xl font-bold text-emerald-400">{gradedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Course Selector */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-400 ml-1 shrink-0" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Authored Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-2xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({totalAssigned})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Needs Grading ({needsGrading})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('GRADED')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'GRADED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Graded ({gradedCount})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <FileCheck2 className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
          <p className="text-xs">Loading course assignments and student submission queues...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
          <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Coursework Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL' || selectedCourseFilter !== 'ALL'
              ? 'No assignments matched the current filters. Clear your filters to view all coursework.'
              : 'You have not assigned any coursework to your students yet. Click "Create & Assign Coursework" to publish your first assignment.'}
          </p>
          <div className="pt-2">
            <Button variant="accent" size="sm" icon={Plus} onClick={() => handleOpenCreateModal()}>
              Create First Assignment
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((asg) => {
            const isSubmitted = asg.status === 'SUBMITTED';
            const isGraded = asg.status === 'GRADED';
            const dueDateFormatted = asg.due_date ? new Date(asg.due_date).toLocaleDateString() : 'Upcoming / Self-Paced';

            return (
              <div
                key={asg.id}
                className={`p-6 rounded-2xl bg-slate-900 border transition-all space-y-4 ${
                  isSubmitted
                    ? 'border-amber-500/60 shadow-lg bg-slate-900/90 ring-1 ring-amber-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={isGraded ? 'success' : isSubmitted ? 'warning' : 'primary'}>
                      {isGraded ? 'Graded & Verified' : isSubmitted ? 'Submission Ready for Review' : 'Assigned to Students'}
                    </Badge>
                    <span className="text-2xs font-mono text-slate-400 font-semibold">
                      {asg.course_title || 'Curriculum Course'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-2xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Due: {dueDateFormatted}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Max Score: {asg.max_score || 100} pts
                    </span>
                  </div>
                </div>

                {/* Title & Instructions */}
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-white">{asg.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                    {asg.instructions}
                  </p>
                </div>

                {/* Student Submission Viewport if submitted */}
                {asg.submission_content && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-2xs font-semibold">
                      <span className="text-amber-300">
                        Student Submission ({asg.student_name || 'Enrolled Student'}):
                      </span>
                      <span className="text-slate-500 font-mono">
                        {asg.submitted_at ? new Date(asg.submitted_at).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {asg.submission_content}
                    </div>
                  </div>
                )}

                {/* Grade and Evaluation comments if graded */}
                {isGraded && (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-700/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Instructor Evaluation Recorded
                      </span>
                      <span className="text-sm font-mono font-extrabold text-emerald-200">
                        Score: {asg.score} / {asg.max_score || 100}
                      </span>
                    </div>
                    {asg.feedback && (
                      <p className="text-slate-300 text-xs italic pl-5">
                        "{asg.feedback}"
                      </p>
                    )}
                  </div>
                )}

                {/* Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-3xs text-slate-500 font-mono">
                    ID: {asg.id}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete this assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isSubmitted && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleOpenGradeModal(asg)}
                        icon={Award}
                        className="text-xs font-bold"
                      >
                        Evaluate & Grade Submission
                      </Button>
                    )}

                    {isGraded && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenGradeModal(asg)}
                        icon={Edit}
                        className="text-xs"
                      >
                        Edit Grade / Feedback
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Create & Assign Coursework Modal */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Assign Coursework to Students"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs font-sans">
          <p className="text-slate-300 text-xs">
            Create a technical assignment for your enrolled students. When published, this assignment immediately appears on the student portal and dashboard.
          </p>

          {createError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/60 text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setCreateMode('manual')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                createMode === 'manual'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual Authoring
            </button>
            <button
              type="button"
              onClick={() => setCreateMode('ai')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                createMode === 'ai'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Draft with AI Co-pilot</span>
            </button>
          </div>

          {createMode === 'ai' ? (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200">
                  Target Curriculum Course *
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200">
                  What technical topic / problem do you want to assign? *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Memory aliasing & mutable object mutation proofs in Python"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200">
                  Difficulty Level
                </label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner / Fundamentals</option>
                  <option value="Intermediate">Intermediate / Applied Engineering</option>
                  <option value="Advanced">Advanced / Systems & Theory</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2 text-2xs text-slate-400">
                  <span>Quick:</span>
                  <button
                    type="button"
                    onClick={() => setAiTopic('Object References & id() Equality')}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Memory References
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiTopic('Asymptotic Space Complexity & Recursion')}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Big-O & Recursion
                  </button>
                </div>

                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  loading={aiGenerating}
                  icon={Sparkles}
                  onClick={handleGenerateWithAI}
                >
                  Generate Assignment Draft
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Select Course */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200">
                  Target Curriculum Course *
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Title */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Problem Set 1: Memory Layout & Mutable Reference Aliasing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-200">
              Instructions & Pedagogical Guidance *
            </label>
            <textarea
              rows={5}
              placeholder="Provide clear prompt requirements, code samples to analyze, and submission guidelines..."
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Due Date & Max Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">
                Maximum Score (Points)
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={newMaxScore}
                onChange={(e) => setNewMaxScore(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" loading={creating} icon={Check}>
              Publish & Assign to Students
            </Button>
          </div>
            </>
          )}
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* Grade & Evaluation Modal */}
      {/* ------------------------------------------------------------- */}
      {selectedAsgForGrading && (
        <Modal
          isOpen={gradeModalOpen}
          onClose={() => setGradeModalOpen(false)}
          title={`Evaluate Submission: ${selectedAsgForGrading.title}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmitGrade} className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-2xs">
                <span className="font-bold text-white">{selectedAsgForGrading.course_title}</span>
                <span className="text-slate-400 font-mono">Max Score: {selectedAsgForGrading.max_score || 100}</span>
              </div>
              <p className="text-2xs text-slate-400">
                Student: <strong className="text-slate-200">{selectedAsgForGrading.student_name || 'Enrolled Student'}</strong>
              </p>
            </div>

            {/* Student Response Display */}
            <div className="space-y-1.5">
              <label className="block font-bold text-amber-300">
                Student's Submitted Work:
              </label>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                {selectedAsgForGrading.submission_content || 'No text submitted.'}
              </div>
            </div>

            {/* Score Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">
                Awarded Score (0 to {selectedAsgForGrading.max_score || 100}) *
              </label>
              <input
                type="number"
                min={0}
                max={selectedAsgForGrading.max_score || 100}
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Teacher Feedback Textarea */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">
                Instructor Evaluation Feedback & Commentary *
              </label>
              <textarea
                rows={4}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Provide actionable praise, corrections, or references to curriculum concepts..."
                required
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" type="button" onClick={() => setGradeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" loading={grading} icon={Check}>
                Save Grade & Send Feedback
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default TeacherAssignmentsPage;
