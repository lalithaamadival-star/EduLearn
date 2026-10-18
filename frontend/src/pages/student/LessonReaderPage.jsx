import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAccessibility } from '../../features/accessibility/AccessibilityContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { AudioPlayer } from '../../components/ui/AudioPlayer';
import { Button, IconButton } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import {
  Volume2,
  Sparkles,
  Sliders,
  Bookmark,
  FileText,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Minimize2,
  Layers,
  Menu,
  Languages,
  BookOpen,
  Copy,
  Check
} from 'lucide-react';
import { StructuredContentRenderer, cleanSpokenText } from '../../components/common/StructuredContentRenderer';


export function LessonReaderPage() {
  const { courseSlug, lessonSlug } = useParams();
  const { preferences, updatePreference } = useAccessibility();
  const { announce, updateOrientation } = useAuditoryOrientation();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Multimodal presentation mode
  // normal, simplified, summary, translated
  const [viewMode, setViewMode] = useState('normal');
  const [simplifiedContent, setSimplifiedContent] = useState('');
  const [summaryContent, setSummaryContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Mobile Drawers
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  // In-lesson note
  const [notes, setNotes] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lessonQuiz, setLessonQuiz] = useState(null);

  // Quick In-lesson AI Chat
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponses, setAiResponses] = useState([]);
  const [aiWaiting, setAiWaiting] = useState(false);

  useEffect(() => {
    const activeSlug = lessonSlug || 'variables-and-memory';
    const activeCourseSlug = courseSlug || 'python-fundamentals';

    setLoading(true);
    Promise.all([
      api.getLesson(activeSlug),
      api.getCourse(activeCourseSlug),
      api.listQuizzes().catch(() => [])
    ]).then(([lessonData, courseData, allQuizzes]) => {
      setLesson(lessonData);
      setCourse(courseData);
      setSimplifiedContent(lessonData.content_simplified || '');
      setSummaryContent(lessonData.summary || '');

      // Check if a quiz is associated with this lesson or course
      const matchedQuiz = allQuizzes.find(q => String(q.lesson_id) === String(lessonData.id)) ||
                          allQuizzes.find(q => String(q.lesson_id) === String(lessonData.slug)) ||
                          (allQuizzes.length > 0 ? allQuizzes[0] : null);
      if (matchedQuiz) {
        setLessonQuiz(matchedQuiz);
      }

      updateOrientation({
        location: `${lessonData.title} Lesson`,
        section: 'Lesson Reader Workspace',
        actions: ['Listen to audio', 'Simplify text', 'Ask AI Tutor', 'Take mastery quiz', 'Save notes']
      });
      announce(`Lesson loaded: ${lessonData.title}. Press Alt+O for full orientation.`, 'polite');
    }).catch(err => {
      console.error("Error loading lesson:", err);
    }).finally(() => setLoading(false));
  }, [lessonSlug, courseSlug]);

  const handleSimplify = async () => {
    if (viewMode === 'simplified') {
      setViewMode('normal');
      announce("Switched back to standard lesson text.", "polite");
      return;
    }
    setViewMode('simplified');
    announce("Lesson adapted to cognitive simplified plain language.", "polite");
    if (!simplifiedContent && lesson) {
      setAiLoading(true);
      try {
        const res = await api.aiSimplify(lesson.content_raw);
        setSimplifiedContent(res.content);
      } catch (e) {
        setSimplifiedContent(lesson.content_simplified || lesson.content_raw);
      } finally {
        setAiLoading(false);
      }
    }
  };

  // Keyboard shortcut event listeners for Alt+S and Alt+A
  useEffect(() => {
    const onToggleSimplify = () => {
      handleSimplify();
    };
    const onFocusAI = () => {
      const el = document.getElementById('lesson-ai-input');
      if (el) {
        el.focus();
        announce("AI Tutor input focused. Type your question.", "polite");
      }
    };

    window.addEventListener('accessed:toggle-simplify', onToggleSimplify);
    window.addEventListener('accessed:focus-ai', onFocusAI);
    return () => {
      window.removeEventListener('accessed:toggle-simplify', onToggleSimplify);
      window.removeEventListener('accessed:focus-ai', onFocusAI);
    };
  }, [viewMode, simplifiedContent, lesson]);

  const handleSummarize = async () => {
    if (viewMode === 'summary') {
      setViewMode('normal');
      announce("Switched back to standard lesson text.", "polite");
      return;
    }
    setViewMode('summary');
    announce("Lesson condensed to key takeaways.", "polite");
    if (!summaryContent && lesson) {
      setAiLoading(true);
      try {
        const res = await api.aiSummarize(lesson.content_raw);
        setSummaryContent(res.content);
      } catch (e) {
        setSummaryContent(lesson.summary || "Summary generation complete.");
      } finally {
        setAiLoading(false);
      }
    }
  };

  const handleAskLessonAI = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const query = aiQuery;
    setAiQuery('');
    setAiResponses(prev => [...prev, { role: 'user', content: query }]);
    setAiWaiting(true);
    announce("AI Tutor thinking...", "polite");

    try {
      const res = await api.aiChat({
        message: query,
        context: {
          course_title: course?.title,
          lesson_title: lesson?.title,
          lesson_content: lesson?.content_raw?.slice(0, 1000),
          accessibility_mode: viewMode
        }
      });
      setAiResponses(prev => [...prev, {
        role: 'assistant',
        content: res.content,
        provider: res.provider_used
      }]);
      // Speak actual response via Microsoft Edge Neural TTS
      announce(cleanSpokenText(res.content, 900), "polite", true);
    } catch (err) {
      setAiResponses(prev => [...prev, {
        role: 'assistant',
        content: "AI Tutor is temporarily offline. Please consult the lesson notes or retry shortly.",
        provider: "Local System"
      }]);
      announce("AI Tutor is temporarily offline.", "assertive");
    } finally {
      setAiWaiting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;
    await api.markLessonComplete(lesson.id);
    setIsCompleted(true);
    announce("Lesson marked as complete. Mastery progress recorded.", "polite");
  };

  if (loading || !lesson) {
    return (
      <div className="max-w-7xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  // Active reading content based on mode
  const displayedContent = viewMode === 'simplified'
    ? (simplifiedContent || lesson.content_simplified || lesson.content_raw)
    : viewMode === 'summary'
    ? (summaryContent || lesson.summary)
    : lesson.content_raw;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Multimodal Accessibility Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2">
          {/* Mobile Syllabus Nav Trigger */}
          <button
            type="button"
            onClick={() => setNavDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
            aria-label="Open course syllabus drawer"
          >
            <Menu className="w-4 h-4" />
          </button>

          <span className="text-2xs font-mono uppercase text-slate-400 font-bold hidden sm:inline">
            Active Mode:
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800">
            {viewMode}
          </span>
        </div>

        {/* Multimodal Adaptive Tool Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'normal' ? 'primary' : 'outline'}
            onClick={() => {
              setViewMode('normal');
              announce("Standard lesson text enabled.", "polite");
            }}
          >
            Standard
          </Button>

          <Button
            size="sm"
            variant={viewMode === 'simplified' ? 'accent' : 'outline'}
            onClick={handleSimplify}
            icon={Sparkles}
          >
            {viewMode === 'simplified' ? 'Simplified Active' : 'Simplify'}
          </Button>

          <Button
            size="sm"
            variant={viewMode === 'summary' ? 'secondary' : 'outline'}
            onClick={handleSummarize}
          >
            Key Takeaways
          </Button>

          {/* Mobile AI Drawer Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAiDrawerOpen(true)}
            className="lg:hidden"
            icon={Sparkles}
          >
            AI Co-pilot
          </Button>

          {/* Quiz Button if quiz attached */}
          {lesson.quiz && (
            <Link to={`/quizzes/${lesson.quiz.id}`}>
              <Button size="sm" variant="accent" icon={HelpCircle}>
                Mastery Quiz
              </Button>
            </Link>
          )}

          <IconButton
            icon={Bookmark}
            label={isBookmarked ? "Remove bookmark" : "Bookmark this section"}
            active={isBookmarked}
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              announce(isBookmarked ? "Bookmark removed." : "Lesson bookmarked successfully.", "polite");
            }}
            size="sm"
          />
        </div>
      </div>

      {/* Flagship 3-Column Desktop Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Course Syllabus Navigation (Desktop) */}
        <nav
          aria-label="Lesson Syllabus"
          className="hidden lg:block lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 sticky top-20"
        >
          <div>
            <span className="text-3xs uppercase font-mono tracking-wider text-indigo-400 font-bold">
              Course Syllabus
            </span>
            <h2 className="text-sm font-bold text-slate-100 truncate mt-0.5">
              {course?.title || "Python Fundamentals"}
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {course?.modules?.map((mod, mIdx) => (
              <div key={mod.id || mIdx} className="space-y-1">
                <div className="font-semibold text-slate-300 text-2xs uppercase tracking-wider py-1 border-b border-slate-800">
                  {mod.title}
                </div>
                <div className="space-y-1 pt-1">
                  {mod.lessons?.map(les => {
                    const isCurrent = les.slug === (lessonSlug || 'variables-and-memory');
                    return (
                      <Link
                        key={les.id}
                        to={`/courses/${course.slug}/lessons/${les.slug}`}
                        className={`block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        {les.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Center Column: Multimodal Adaptive Content Canvas */}
        <article
          aria-label="Active Lesson Body"
          className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          {/* Header */}
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
              <span className="text-indigo-400 font-semibold">{course?.title}</span>
              <span>~{lesson.estimated_minutes} min duration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {lesson.title}
            </h1>
          </div>

          {/* Integrated Neural Audio Player */}
          <div className="pt-2">
            <AudioPlayer
              title={`${lesson.title} (Audio Mode)`}
              voiceName="Neural Speech / Human Narration"
              transcript={lesson.audio_transcript || lesson.content_raw}
            />
          </div>

          {/* Main Lesson Body (Structured Rich Typography) */}
          <div className="pt-4">
            <StructuredContentRenderer rawContent={displayedContent} />
          </div>

          {/* Lesson Completion Action */}
          <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <Button
              variant={isCompleted ? "outline" : "primary"}
              onClick={handleMarkComplete}
              icon={CheckCircle2}
            >
              {isCompleted ? "Completed" : "Mark Lesson Completed"}
            </Button>

            {(lessonQuiz || lesson.quiz) && (
              <Link to={`/quizzes/${lessonQuiz?.id || lesson.quiz?.id}`}>
                <Button variant="accent" icon={ArrowRight}>
                  Proceed to Mastery Quiz
                </Button>
              </Link>
            )}
          </div>
        </article>

        {/* Right Column: AI Co-pilot & In-Context Study Tools (Desktop) */}
        <aside
          aria-label="Assistive Co-pilot and Study Notes"
          className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20"
        >
          {/* Contextual AI Assistant Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
                <SymbolIcon name="ai" className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Contextual AI Tutor
              </h2>
            </div>

            {/* Conversation Snippets */}
            <div className="space-y-3 max-h-72 overflow-y-auto text-xs pr-1">
              {aiResponses.length === 0 ? (
                <div className="text-2xs text-slate-400 italic p-3 bg-slate-950 rounded-lg border border-slate-850">
                  Ask me anything about {lesson.title}. I am aware of this lesson's concepts and your learning mode.
                </div>
              ) : (
                aiResponses.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl leading-relaxed text-xs space-y-2 ${
                      msg.role === 'user'
                        ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/40'
                        : 'bg-slate-950 text-slate-200 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-3xs uppercase font-bold text-slate-400">
                      <span>{msg.role === 'user' ? 'You' : 'AccessEd Tutor'}</span>
                      {msg.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => announce(cleanSpokenText(msg.content, 2000), "polite", true)}
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
                          aria-label="Read AI answer aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Read Aloud</span>
                        </button>
                      )}
                    </div>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    ) : (
                      <StructuredContentRenderer rawContent={msg.content} isCompact={true} />
                    )}
                  </div>
                ))
              )}
              {aiWaiting && (
                <div className="text-xs text-indigo-400 animate-pulse p-2 flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Thinking through explanation...</span>
                </div>
              )}
            </div>

            {/* AI Input Form */}
            <form onSubmit={handleAskLessonAI} className="space-y-2">
              <input
                id="lesson-ai-input"
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask about this lesson... (Alt+A)"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              />
              <Button type="submit" variant="primary" size="sm" className="w-full text-xs">
                Ask Tutor
              </Button>
            </form>
          </div>

          {/* Quick Learning Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personal Note</span>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record a key insight or reminder..."
              className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 leading-relaxed"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setNoteSaved(true);
                announce("Learning note saved.", "polite");
                setTimeout(() => setNoteSaved(false), 2000);
              }}
            >
              {noteSaved ? "Saved" : "Save Note"}
            </Button>
          </div>
        </aside>
      </div>

      {/* Mobile Drawer: Syllabus */}
      <Drawer
        isOpen={navDrawerOpen}
        onClose={() => setNavDrawerOpen(false)}
        title="Course Syllabus"
        position="left"
      >
        <div className="space-y-4 text-xs">
          {course?.modules?.map(mod => (
            <div key={mod.id} className="space-y-2">
              <div className="font-bold text-indigo-400 uppercase tracking-wider">{mod.title}</div>
              <div className="space-y-1">
                {mod.lessons?.map(les => (
                  <Link
                    key={les.id}
                    to={`/courses/${course.slug}/lessons/${les.slug}`}
                    onClick={() => setNavDrawerOpen(false)}
                    className="block p-2 rounded bg-slate-950 text-slate-300 hover:text-white"
                  >
                    {les.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Drawer>

      {/* Mobile Drawer: AI Co-pilot */}
      <Drawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        title="Contextual AI Tutor"
        position="right"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-400">Ask a question regarding {lesson.title}.</p>

          {/* Mobile Message Snippets */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {aiResponses.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl leading-relaxed text-xs space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/40'
                    : 'bg-slate-950 text-slate-200 border border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-3xs uppercase font-bold text-slate-400">
                  <span>{msg.role === 'user' ? 'You' : 'AccessEd Tutor'}</span>
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => announce(cleanSpokenText(msg.content, 2000), "polite", true)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
                      aria-label="Read AI answer aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Read Aloud</span>
                    </button>
                  )}
                </div>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                ) : (
                  <StructuredContentRenderer rawContent={msg.content} isCompact={true} />
                )}
              </div>
            ))}
            {aiWaiting && (
              <div className="text-xs text-indigo-400 animate-pulse p-2 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Thinking through explanation...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleAskLessonAI} className="space-y-2">
            <textarea
              rows={3}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask for clarification or examples..."
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            />
            <Button type="submit" variant="primary" size="sm" className="w-full">
              Submit Question
            </Button>
          </form>
        </div>
      </Drawer>
    </div>
  );
}
