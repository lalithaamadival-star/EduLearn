import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, ArrowRight, Clock, Users, CheckCircle2, FileCode, Sparkles, AlertCircle, RotateCcw, UserCheck, GraduationCap } from 'lucide-react';

export function CourseLibraryPage() {
  const { user, setSelectedTeacher } = useAuth();
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(() => user?.selected_teacher_id || 'ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async (teacherId = selectedTeacherId) => {
    setLoading(true);
    setError(null);
    updateOrientation({
      location: 'My Learning & Course Library',
      section: 'Course Catalog',
      actions: ['Inspect course syllabus', 'Launch lesson reader', 'Enroll in curriculum']
    });

    try {
      const tList = await api.getTeachers().catch(() => []);
      setTeachers(Array.isArray(tList) ? tList : []);

      const tParam = (teacherId && teacherId !== 'ALL') ? teacherId : null;
      const data = await api.getCourses(tParam);
      const list = Array.isArray(data) ? data : [];
      setCourses(list);
      announce(`Course catalog loaded. ${list.length} courses available.`, 'polite');
    } catch (err) {
      console.error("Failed to load course catalog:", err);
      setError("Unable to load courses from server. Please verify your connection.");
      announce("Failed to load courses. Please try again.", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherFilter = (tId) => {
    setSelectedTeacherId(tId);
    if (tId !== 'ALL' && setSelectedTeacher) {
      api.selectTeacher(tId).catch(() => {});
      setSelectedTeacher(tId);
    }
    fetchCourses(tId);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Course Catalog Unavailable</h2>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
        <Button variant="primary" size="sm" icon={RotateCcw} onClick={fetchCourses}>
          Retry Loading Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
            Enrolled Curricula
          </span>
          <h1 className="text-3xl font-extrabold text-white">
            My Learning Catalog
          </h1>
          <p className="text-xs text-slate-400">
            All courses feature full multimodal equivalence across visual, auditory, and plain language modes.
          </p>
        </div>

        {teachers.length > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-3xs uppercase font-mono font-bold text-slate-400">Filter by Educator</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => handleTeacherFilter(e.target.value)}
                aria-label="Filter courses by educator"
                className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer pr-2"
              >
                <option value="ALL" className="bg-slate-900 text-slate-100">All Faculty Courses</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                    {t.full_name} ({t.courses_count || 0} courses)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Courses Enrolled Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You are not enrolled in any curricula. Check back when your educator assigns coursework or explore available courses.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={fetchCourses} icon={RotateCcw}>
              Refresh Catalog
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map(course => (
            <div
              key={course.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="primary">{course.category || 'Curriculum'}</Badge>
                  <span className="text-2xs font-mono text-slate-400">{course.difficulty_level || 'Beginner'}</span>
                </div>

                <h2 className="text-xl font-bold text-white leading-snug">
                  {course.title}
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-2xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    Instructor: {course.instructor_name || 'Faculty Educator'}
                  </span>
                  <span className="text-3xs font-mono text-slate-400">
                    {course.instructor_organization || 'Department of Computing'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/student/courses/${course.slug}`} className="flex-1">
                    <Button variant="primary" size="md" className="w-full text-xs" icon={ArrowRight}>
                      Explore Syllabus & Lessons
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CourseDetailPage() {
  const { courseSlug } = useParams();
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = () => {
    setLoading(true);
    setError(null);
    const slug = courseSlug || 'python-fundamentals';
    Promise.all([
      api.getCourse(slug),
      api.listQuizzes().catch(() => [])
    ]).then(([courseData, quizzesData]) => {
      setCourse(courseData);
      setQuizzes(quizzesData || []);
      updateOrientation({
        location: `Course: ${courseData?.title || slug}`,
        section: 'Curriculum Syllabus & Quizzes',
        actions: ['Select lesson', 'Take mastery quizzes', 'Inspect modules']
      });
      announce(`Course syllabus loaded for ${courseData?.title || slug}.`, 'polite');
    }).catch(err => {
      console.error("Failed to load course details:", err);
      setError("Unable to load course syllabus. Please try again.");
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [courseSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Course Syllabus Unavailable</h2>
          <p className="text-xs text-slate-400">{error || 'Course not found.'}</p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="primary" size="sm" icon={RotateCcw} onClick={fetchDetail}>
            Retry
          </Button>
          <Link to="/student/courses">
            <Button variant="outline" size="sm">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Find quizzes matching a lesson id
  const getQuizForLesson = (lessonId) => {
    return quizzes.find(q => String(q.lesson_id) === String(lessonId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <Badge variant="primary">{course.category}</Badge>
        <h1 className="text-3xl font-extrabold text-white">{course.title}</h1>
        <p className="text-sm text-slate-300 leading-relaxed">{course.description}</p>
      </div>

      {/* Course Instructor Card */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <SymbolIcon name="learning" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xs uppercase font-mono font-bold text-amber-400">Course Instructor</span>
              <span className="text-3xs text-slate-400">• {course.instructor_organization || 'Department of Computing'}</span>
            </div>
            <h3 className="text-sm font-bold text-white">{course.instructor_name || 'Faculty Educator'}</h3>
            {course.instructor_email && (
              <p className="text-2xs text-slate-400 font-mono">{course.instructor_email}</p>
            )}
          </div>
        </div>

        {course.instructor_email && (
          <a href={`mailto:${course.instructor_email}`}>
            <Button variant="outline" size="sm" className="text-xs">
              Contact Instructor
            </Button>
          </a>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-xs">
          Curriculum Modules & Lessons
        </h2>

        {!course.modules || course.modules.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No Modules Published Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your instructor ({course.instructor_name || 'Educator'}) is authoring lessons for this curriculum. Please check back soon.
            </p>
          </div>
        ) : (
          course.modules.map((mod, idx) => (
          <div key={mod.id || idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div>
              <h3 className="text-base font-bold text-slate-100">{mod.title}</h3>
              <p className="text-xs text-slate-400">{mod.description}</p>
            </div>

            <div className="divide-y divide-slate-800 border-t border-slate-800 pt-2">
              {mod.lessons?.map(les => {
                const quiz = getQuizForLesson(les.id);
                return (
                  <div key={les.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-200">{les.title}</div>
                      <div className="text-2xs text-slate-400">
                        ~{les.estimated_minutes} min duration • Audio & Transcript Ready
                        {quiz && (
                          <span className="ml-2 text-amber-400 font-semibold">• Quiz available ({quiz.total_questions} questions)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {quiz && (
                        <Link to={`/quizzes/${quiz.id}`}>
                          <Button variant="outline" size="sm" icon={FileCode} className="text-xs border-amber-500/50 text-amber-300 hover:bg-amber-950/30">
                            Take Quiz
                          </Button>
                        </Link>
                      )}
                      <Link to={`/courses/${course.slug}/lessons/${les.slug}`}>
                        <Button variant="secondary" size="sm" icon={ArrowRight}>
                          Study Lesson
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
      </div>

      {/* Pushed Assessments Section */}
      {quizzes.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Course Quizzes & Assessments ({quizzes.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizzes.map(q => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-100">{q.title}</div>
                  <div className="text-2xs text-slate-400">{q.description || 'Mastery diagnostic quiz'}</div>
                  <div className="text-3xs text-amber-400 font-mono mt-1">{q.total_questions} Questions • Passing: {q.passing_score}%</div>
                </div>
                <Link to={`/quizzes/${q.id}`} className="pt-2">
                  <Button variant="accent" size="sm" icon={FileCode} className="w-full text-xs">
                    Start Mastery Quiz
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
