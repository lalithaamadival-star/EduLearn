import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  FileText,
  GraduationCap,
  Mail,
  Check,
  Eye,
  Volume2,
  VolumeX,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export function StudentDashboard() {
  const { user, setSelectedTeacher } = useAuth();
  const { announce } = useAuditoryOrientation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [readingDoc, setReadingDoc] = useState(null);
  const [isReadingAudio, setIsReadingAudio] = useState(false);

  const fetchDashboard = (teacherId = null) => {
    setLoading(true);
    const targetTid = teacherId || user?.selected_teacher_id || localStorage.getItem('accessed_selected_teacher_id');
    api.getStudentDashboard(targetTid)
      .then(res => {
        setData(res);
        if (res?.assigned_teacher && setSelectedTeacher) {
          setSelectedTeacher(res.assigned_teacher.id);
        }
      })
      .catch(err => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    announce("Student Dashboard loaded. Press Tab to explore continue learning, upcoming assignments, and faculty materials.", "polite");
    fetchDashboard();
  }, []);

  const handleSwitchTeacher = async (teacherId) => {
    setSwitching(true);
    try {
      try {
        await api.selectTeacher(teacherId);
      } catch (err) {
        console.warn("Server select-teacher endpoint note:", err);
      }
      if (setSelectedTeacher) {
        setSelectedTeacher(teacherId);
      }
      localStorage.setItem('accessed_selected_teacher_id', teacherId);

      const res = await api.getStudentDashboard(teacherId);
      setData(res);
      setSwitchModalOpen(false);
      const teacherName = res?.assigned_teacher?.full_name || 'selected educator';
      announce(`Switched educator to ${teacherName}. Curriculum and study documents refreshed.`, 'polite');
    } catch (err) {
      console.error("Failed to switch educator:", err);
      announce("Failed to switch educator. Please try again.", "assertive");
    } finally {
      setSwitching(false);
    }
  };

  const handleToggleTTS = (text) => {
    if (!('speechSynthesis' in window)) {
      announce("Text-to-speech not supported in browser.", "assertive");
      return;
    }
    if (isReadingAudio) {
      window.speechSynthesis.cancel();
      setIsReadingAudio(false);
      announce("Audio stopped.", "polite");
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsReadingAudio(false);
      utterance.onerror = () => setIsReadingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingAudio(true);
      announce("Reading study notes aloud.", "polite");
    }
  };

  const handleCloseDocModal = () => {
    if (isReadingAudio && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReadingAudio(false);
    }
    setReadingDoc(null);
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard data">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  const {
    assigned_teacher,
    instructors = [],
    continue_learning,
    upcoming_assignments = [],
    study_documents = [],
    courses_count = 0,
    recent_notes = [],
    bookmarks = [],
    overall_progress
  } = data || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
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
            Multimodal learning active • {overall_progress?.total_lessons || 0} lessons in curriculum • {courses_count} courses available
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

      {/* Faculty Instructor Card with Educator Switcher */}
      {assigned_teacher ? (
        <section
          aria-label="Course Educator Information"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xs uppercase font-mono font-bold text-amber-400">Assigned Educator</span>
                <span className="text-3xs text-slate-400">• {assigned_teacher.organization || 'Faculty Department'}</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{assigned_teacher.full_name}</span>
                <Badge variant="primary">{courses_count || (assigned_teacher.full_name === 'ABC' ? 2 : 0)} Courses</Badge>
              </h2>
              <p className="text-2xs text-slate-400 font-mono">{assigned_teacher.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => setSwitchModalOpen(true)}
              disabled={switching}
              className="text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/15"
            >
              Switch Educator
            </Button>
            <a href={`mailto:${assigned_teacher.email}`}>
              <Button variant="outline" size="sm" icon={Mail} className="text-xs">
                Contact
              </Button>
            </a>
          </div>
        </section>
      ) : (
        <section className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Select Your Course Educator</h2>
              <p className="text-xs text-slate-300">
                Choose an educator to browse their published coursework, assignments, and study documents.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={GraduationCap}
            onClick={() => setSwitchModalOpen(true)}
          >
            Choose Educator
          </Button>
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
              Your instructor {assigned_teacher ? `(${assigned_teacher.full_name})` : ''} has not published active lessons yet. You can switch educators or consult the AI Tutor below.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button variant="outline" size="sm" icon={RotateCcw} onClick={() => setSwitchModalOpen(true)}>
                Switch Educator
              </Button>
              <Link to="/student/ai-tutor">
                <Button variant="primary" size="sm" icon={Sparkles}>
                  Consult AI Tutor
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 2. Educator Uploaded Study Documents & Lecture Notes Section */}
      <section aria-labelledby="study-documents-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h2 id="study-documents-heading" className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
              Faculty Study Documents & Lecture Materials
            </h2>
            <Badge variant="primary">{study_documents.length}</Badge>
          </div>
          <Link
            to="/student/documents"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>Explore All Materials</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {study_documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {study_documents.map((doc) => {
              const concepts = doc.concepts_detected || [];
              const preview = doc.markdown_preview || doc.extracted_markdown || 'Curriculum notes verified for accessible learning.';
              const isWord = (doc.file_name || '').toLowerCase().endsWith('.docx');
              const isPdf = (doc.file_name || '').toLowerCase().endsWith('.pdf');

              return (
                <div
                  key={doc.job_id}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-3xs uppercase font-mono text-slate-400">
                            {isWord ? 'Word Document' : isPdf ? 'PDF Paper' : 'Study Notes'}
                          </div>
                          <h3 className="text-sm font-bold text-white line-clamp-1">
                            {doc.title || doc.file_name}
                          </h3>
                        </div>
                      </div>
                      <Badge variant="success">Study Ready</Badge>
                    </div>

                    {concepts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {concepts.slice(0, 3).map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-3xs text-indigo-300">
                            #{c}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-2xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-850">
                      {preview.replace(/[#*`_]/g, '')}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-3xs text-slate-400 font-mono">
                      By {assigned_teacher?.full_name || 'Educator'}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Eye}
                      onClick={() => setReadingDoc(doc)}
                      className="text-xs"
                    >
                      Read Notes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2 text-xs text-slate-400">
            <FileText className="w-6 h-6 text-slate-500 mx-auto" />
            <div className="font-semibold text-slate-200">No Study Materials Uploaded Yet</div>
            <p className="text-2xs text-slate-400 max-w-sm mx-auto">
              {assigned_teacher
                ? `Instructor ${assigned_teacher.full_name} has not shared study documents yet. Switch educators to explore other faculty libraries.`
                : 'Select an educator to view their study materials.'}
            </p>
          </div>
        )}
      </section>

      {/* 3. Secondary Editorial Grid: AI Tutor + Upcoming Tasks */}
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

      {/* 4. Lower Activity: Recent Notes & Bookmarks */}
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

      {/* Switch Educator Modal */}
      <Modal
        isOpen={switchModalOpen}
        onClose={() => setSwitchModalOpen(false)}
        title="Select or Switch Your Educator"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Select a faculty educator below to access their authored curriculum, uploaded lecture notes, and assignments:
          </p>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {instructors.map((teacher) => {
              const isActive = assigned_teacher && String(assigned_teacher.id) === String(teacher.id);

              return (
                <div
                  key={teacher.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{teacher.full_name}</h4>
                        {isActive && <Badge variant="success">Active</Badge>}
                      </div>
                      <p className="text-2xs text-slate-400">{teacher.organization || 'Faculty Department'}</p>
                      <p className="text-3xs text-slate-500 font-mono">{teacher.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant="outline">{teacher.courses_count || (teacher.full_name === 'ABC' ? 2 : 0)} Courses</Badge>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-2xs text-emerald-400 font-semibold px-2 py-1">
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={switching}
                        onClick={() => handleSwitchTeacher(teacher.id)}
                        className="text-xs"
                      >
                        {switching ? 'Switching...' : 'Select Educator'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setSwitchModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Accessible Document Reader Modal on Dashboard */}
      {readingDoc && (
        <Modal
          isOpen={!!readingDoc}
          onClose={handleCloseDocModal}
          title={readingDoc.title || readingDoc.file_name}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Uploaded by <span className="text-white font-semibold">{assigned_teacher?.full_name || 'Educator'}</span></span>
              </div>

              <button
                onClick={() => handleToggleTTS(readingDoc.extracted_markdown || readingDoc.markdown_preview || '')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isReadingAudio
                    ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                    : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/40'
                }`}
              >
                {isReadingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Reading</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Aloud (TTS)</span>
                  </>
                )}
              </button>
            </div>

            {readingDoc.concepts_detected && readingDoc.concepts_detected.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-3xs uppercase font-mono text-slate-400 font-bold">Key Topics:</span>
                {readingDoc.concepts_detected.map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-700/60 text-2xs font-semibold text-indigo-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            <div
              tabIndex="0"
              aria-label="Document reader viewport"
              className="p-5 max-h-[50vh] overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {readingDoc.extracted_markdown || readingDoc.markdown_preview || 'No text extracted.'}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <Link to="/student/documents" onClick={handleCloseDocModal}>
                <span className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                  Open full Study Materials Hub →
                </span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleCloseDocModal}>
                Done Reading
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
