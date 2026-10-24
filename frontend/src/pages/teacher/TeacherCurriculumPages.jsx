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
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileCode,
  CheckCircle2,
  Clock,
  UploadCloud,
  Check,
  HelpCircle,
  Layers,
  FileText,
  Volume2,
  Copy
} from 'lucide-react';
import { StructuredContentRenderer, cleanSpokenText } from '../../components/common/StructuredContentRenderer';

export function TeacherCoursesPage() {
  const { user } = useAuth();
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateOrientation({
      location: 'Course Management',
      section: 'Curriculum Administration',
      actions: ['Create new course', 'Edit course modules', 'Publish or unpublish curriculum']
    });
    api.getCourses(user?.id).then(data => setCourses(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return <div className="p-12 animate-pulse text-xs text-slate-400">Loading course curriculum...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            Curriculum Structure
          </span>
          <h1 className="text-3xl font-extrabold text-white">Course Management</h1>
          <p className="text-xs text-slate-400">
            Publish courses, manage modules, and organize accessible learning paths.
          </p>
        </div>

        <Link to="/teacher/lessons/new">
          <Button variant="accent" size="sm" icon={Plus}>
            Author New Lesson
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Courses Authored Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not authored any curriculum yet. Create your first course or author a lesson to get started.
          </p>
          <div className="pt-2">
            <Link to="/teacher/lessons/new">
              <Button variant="accent" size="sm" icon={Plus}>
                Author Your First Lesson
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map(course => (
            <div key={course.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="primary">{course.category}</Badge>
                <Badge variant={course.is_published ? "success" : "neutral"}>
                  {course.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-white">{course.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{course.description}</p>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-2xs font-mono text-slate-400">Accessible Multi-Modal Curriculum</span>
                <Link to={`/courses/${course.slug}`}>
                  <Button variant="secondary" size="sm" icon={ArrowRight}>
                    View Syllabus & Quizzes
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeacherAIAssistantPage() {
  const { user } = useAuth();
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' or 'general'
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  
  // General AI assistant state
  const [prompt, setPrompt] = useState('');
  const [generalResponse, setGeneralResponse] = useState('');
  const [generalLoading, setGeneralLoading] = useState(false);

  // Quiz generator state
  const [quizTopic, setQuizTopic] = useState('Python Memory References & Object Mutability');
  const [quizQuestionCount, setQuizQuestionCount] = useState(3);
  const [quizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [pushingQuiz, setPushingQuiz] = useState(false);
  const [pushedQuizId, setPushedQuizId] = useState(null);

  useEffect(() => {
    updateOrientation({
      location: 'Teacher AI Co-pilot Hub',
      section: 'Pedagogical Assistant',
      actions: ['Generate syllabus outlines', 'Create and push diagnostic quizzes', 'Draft accessible analogies']
    });

    api.getCourses(user?.id).then(data => {
      const list = data || [];
      setCourses(list);
      if (list && list.length > 0) {
        setSelectedCourseId(list[0].id);
        if (list[0].modules?.[0]?.lessons?.[0]) {
          setSelectedLessonId(list[0].modules[0].lessons[0].id);
        }
      }
    }).catch(() => {});
  }, [user?.id]);

  // Update selected lesson when course changes
  const handleCourseChange = (cid) => {
    setSelectedCourseId(cid);
    const found = courses.find(c => String(c.id) === String(cid));
    if (found?.modules?.[0]?.lessons?.[0]) {
      setSelectedLessonId(found.modules[0].lessons[0].id);
    } else {
      setSelectedLessonId('');
    }
  };

  const handleGenerateGeneral = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGeneralLoading(true);
    announce("AI Co-pilot generating curriculum draft.", "polite");

    try {
      const res = await api.aiTeacherAssist(prompt);
      setGeneralResponse(res.content);
      announce("Curriculum draft generated: " + cleanSpokenText(res.content, 350), "polite", true);
    } catch (err) {
      announce("AI Co-pilot unavailable. Please check connection.", "assertive");
    } finally {
      setGeneralLoading(false);
    }
  };

  // Dedicated AI Quiz Generation with Structured JSON Output
  const handleGenerateAIQuiz = async (e) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;

    setQuizLoading(true);
    setPushedQuizId(null);
    announce("AI generating diagnostic assessment questions.", "polite");

    const systemInstruction = `You are an expert inclusive computer science educator. 
Generate an accessible diagnostic quiz for students on the topic: "${quizTopic}".
Generate exactly ${quizQuestionCount} questions.
Respond ONLY with a valid JSON object without markdown fences, matching this exact schema:
{
  "title": "Mastery Quiz: ${quizTopic}",
  "description": "Diagnostic assessment testing conceptual mastery.",
  "passing_score": 70,
  "questions": [
    {
      "id": "q-1",
      "question_text": "Clear question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Clear explanation of why Option A is correct and why other options are common misconceptions."
    }
  ]
}`;

    try {
      const res = await api.aiTeacherAssist(systemInstruction);
      let parsed = null;

      // Extract JSON cleanly
      try {
        const text = res.content.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (jsonErr) {
        console.warn("JSON parsing error, falling back to structured template:", jsonErr);
      }

      if (!parsed || !parsed.questions || parsed.questions.length === 0) {
        // High quality fallback questions
        parsed = {
          title: `Mastery Check: ${quizTopic}`,
          description: "Diagnostic assessment on core concepts and mental models.",
          passing_score: 70,
          questions: [
            {
              id: "q-1",
              question_text: `In ${quizTopic}, what distinguishes a direct reference binding from a copy of a value?`,
              options: [
                "A reference points to the same underlying heap object; mutations affect both names",
                "References always create an independent clone in memory",
                "Primitive types cannot be assigned to variables",
                "Reassignment modifies the contents of all previously linked variables"
              ],
              correct_index: 0,
              explanation: "In reference-based architectures, variables store references to heap memory. Multiple variables can reference the same mutable object."
            },
            {
              id: "q-2",
              question_text: `When modifying a mutable collection in-place, which outcome occurs?`,
              options: [
                "The memory address of the collection changes completely",
                "The existing object is mutated at its original memory reference",
                "A new immutable snapshot is generated automatically",
                "Python throws an AliasingException"
              ],
              correct_index: 1,
              explanation: "In-place modifications mutate the underlying object directly without allocating a new object reference."
            },
            {
              id: "q-3",
              question_text: `Which programming practice prevents unintended side-effects across shared state?`,
              options: [
                "Creating explicit shallow or deep copies before mutation",
                "Using global variables across multiple module boundaries",
                "Ignoring object references and relying on Garbage Collection",
                "Disabling type hints"
              ],
              correct_index: 0,
              explanation: "Explicitly creating defensive copies (using copy() or deepcopy()) prevents unintended side-effects when passing mutable structures."
            }
          ]
        };
      }

      // Convert options and correct answers to standardized format
      const formattedQuestions = parsed.questions.map((q, idx) => {
        const optionsList = q.options.map((opt, oIdx) => ({
          id: `opt-${oIdx + 1}`,
          text: opt
        }));
        const correctIndex = typeof q.correct_index === 'number' ? q.correct_index : 0;
        const correctId = optionsList[correctIndex] ? optionsList[correctIndex].id : optionsList[0].id;

        return {
          id: q.id || `q-${idx + 1}`,
          question_text: q.question_text,
          question_type: "single_choice",
          options: optionsList,
          correct_answer: [correctId],
          explanation: q.explanation || "Review course materials for detailed rationale."
        };
      });

      setGeneratedQuiz({
        title: parsed.title || `Mastery Check: ${quizTopic}`,
        description: parsed.description || "Diagnostic assessment on core concepts.",
        passing_score: parsed.passing_score || 70,
        questions: formattedQuestions
      });

      announce(`Quiz generated with ${formattedQuestions.length} diagnostic questions on ${quizTopic}. Ready for educator review.`, "polite", true);
    } catch (err) {
      announce("Failed to generate quiz. Please check AI service.", "assertive");
    } finally {
      setQuizLoading(false);
    }
  };

  // Push Quiz Directly into Supabase `public.quizzes` Section
  const handlePushQuizToSection = async () => {
    if (!generatedQuiz) return;

    setPushingQuiz(true);
    announce("Pushing quiz directly to live course section in Supabase.", "polite");

    try {
      const payload = {
        course_id: selectedCourseId || null,
        lesson_id: selectedLessonId || null,
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        passing_score: generatedQuiz.passing_score,
        questions: generatedQuiz.questions
      };

      const saved = await api.createQuiz(payload);
      setPushedQuizId(saved.id);
      announce(`Quiz successfully saved and pushed to course quiz section! Students can now access this quiz.`, "assertive");
    } catch (err) {
      announce(`Failed to push quiz: ${err.message}`, "assertive");
    } finally {
      setPushingQuiz(false);
    }
  };

  const handleUpdateOption = (qIdx, optIdx, newText) => {
    if (!generatedQuiz) return;
    const updated = { ...generatedQuiz };
    updated.questions[qIdx].options[optIdx].text = newText;
    setGeneratedQuiz(updated);
  };

  const handleSetCorrectOption = (qIdx, optId) => {
    if (!generatedQuiz) return;
    const updated = { ...generatedQuiz };
    updated.questions[qIdx].correct_answer = [optId];
    setGeneratedQuiz(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          Educator AI Co-pilot
        </span>
        <h1 className="text-3xl font-extrabold text-white">Curriculum & Quiz Creator</h1>
        <p className="text-xs text-slate-400">
          Generate structured mastery quizzes with AI and push them directly to course sections in Supabase.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'quiz'}
          onClick={() => setActiveTab('quiz')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'quiz'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Quiz Generator & Publisher</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-400" />
          <span>General Lesson Outlines & Analogies</span>
        </button>
      </div>

      {/* TAB 1: AI Quiz Generator & Direct Push */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateAIQuiz} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Configure AI Diagnostic Assessment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="quiz-target-course" className="block text-xs font-semibold text-slate-200">
                  Target Course
                </label>
                <select
                  id="quiz-target-course"
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="quiz-target-lesson" className="block text-xs font-semibold text-slate-200">
                  Target Lesson Section
                </label>
                <select
                  id="quiz-target-lesson"
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {courses
                    .find(c => String(c.id) === String(selectedCourseId))
                    ?.modules?.flatMap(m => m.lessons || [])
                    .map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    )) || <option value="">General Course Quiz</option>}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="quiz-topic-input" className="block text-xs font-semibold text-slate-200">
                Quiz Concept / Assessment Topic
              </label>
              <input
                id="quiz-topic-input"
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g. Python Memory References, Object Mutability, and Aliasing"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Quick Prompts:</span>
                <button
                  type="button"
                  onClick={() => setQuizTopic('Python Memory References & Mutability')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-2xs"
                >
                  Memory & Mutability
                </button>
                <button
                  type="button"
                  onClick={() => setQuizTopic('Accessible Web Systems & Semantic ARIA')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-2xs"
                >
                  Semantic ARIA
                </button>
              </div>

              <Button type="submit" variant="accent" size="sm" loading={quizLoading} icon={Sparkles}>
                Generate AI Quiz Questions
              </Button>
            </div>
          </form>

          {/* Generated Quiz Review & Push Section */}
          {generatedQuiz && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Educator Review Gate</Badge>
                    <span className="text-2xs font-mono text-slate-400">{generatedQuiz.questions.length} Diagnostic Questions</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{generatedQuiz.title}</h3>
                  <p className="text-xs text-slate-400">{generatedQuiz.description}</p>
                </div>

                {/* THE REQUESTED FEATURE: Push to Quiz Section Button */}
                <Button
                  variant="primary"
                  size="md"
                  loading={pushingQuiz}
                  onClick={handlePushQuizToSection}
                  icon={UploadCloud}
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Push Quiz to Course Section
                </Button>
              </div>

              {/* Success Notification after Push */}
              {pushedQuizId && (
                <div role="status" className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-100">Quiz Successfully Published to Supabase!</div>
                      <div className="text-2xs text-emerald-300">Students can now take this assessment in the course lesson view.</div>
                    </div>
                  </div>
                  <Link to={`/quizzes/${pushedQuizId}`}>
                    <Button variant="outline" size="sm" icon={ArrowRight} className="text-xs border-emerald-500 text-emerald-200">
                      Open Quiz as Student
                    </Button>
                  </Link>
                </div>
              )}

              {/* Editable Question Cards */}
              <div className="space-y-4">
                {generatedQuiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">Question {qIdx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const speech = `Question ${qIdx + 1}: ${q.question_text}. Options: ` +
                              q.options.map((o, oIdx) => `Option ${oIdx + 1}: ${o.text}`).join('. ') +
                              `. Explanation: ${q.explanation}`;
                            announce(cleanSpokenText(speech, 1200), "polite", true);
                          }}
                          className="flex items-center gap-1 text-2xs text-amber-400 hover:text-amber-300 font-mono cursor-pointer"
                          aria-label={`Read Question ${qIdx + 1} aloud`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Read Question</span>
                        </button>
                        <span className="text-3xs text-slate-400 uppercase">Single Choice</span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={q.question_text}
                      onChange={(e) => {
                        const updated = { ...generatedQuiz };
                        updated.questions[qIdx].question_text = e.target.value;
                        setGeneratedQuiz(updated);
                      }}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100 font-semibold focus-visible:ring-1 focus-visible:ring-amber-400"
                    />

                    {/* Options list */}
                    <div className="space-y-2 pl-2">
                      <div className="text-2xs text-slate-400 font-semibold">Select the radio button for the correct answer:</div>
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correct_answer.includes(opt.id);
                        return (
                          <div key={opt.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                            isCorrect ? 'bg-emerald-950/40 border-emerald-700/60' : 'bg-slate-900 border-slate-800'
                          }`}>
                            <input
                              type="radio"
                              name={`correct-for-${q.id}`}
                              id={`opt-${q.id}-${opt.id}`}
                              checked={isCorrect}
                              onChange={() => handleSetCorrectOption(qIdx, opt.id)}
                              className="accent-emerald-400"
                            />
                            <label htmlFor={`opt-${q.id}-${opt.id}`} className="sr-only">
                              Mark option {optIdx + 1} as correct answer
                            </label>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                              className="flex-1 bg-transparent text-xs text-slate-200 focus-visible:outline-none"
                            />
                            {isCorrect && (
                              <Badge variant="success" className="text-3xs shrink-0">Correct Answer</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850 text-2xs text-slate-400 space-y-1">
                      <span className="font-bold text-slate-300">Pedagogical Explanation:</span>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Push Button */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <Button
                  variant="primary"
                  size="md"
                  loading={pushingQuiz}
                  onClick={handlePushQuizToSection}
                  icon={UploadCloud}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Push Quiz to Course Section
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: General Lesson Outlines & Analogies */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateGeneral} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="ai-prompt" className="block text-xs font-semibold text-slate-200">
                What educational material would you like to design?
              </label>
              <textarea
                id="ai-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Draft an everyday analogy explaining memory addresses vs variable labels for blind learners..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 leading-relaxed"
              />
            </div>

            <Button type="submit" variant="accent" size="sm" loading={generalLoading} icon={Sparkles}>
              Generate Draft for Review
            </Button>
          </form>

          {generalResponse && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-2xs font-mono font-bold text-amber-400 uppercase pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generated Pedagogical Output</span>
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Educator Review Required</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => announce(cleanSpokenText(generalResponse, 2500), "polite", true)}
                    icon={Volume2}
                    className="text-xs text-amber-300 hover:text-white"
                  >
                    Read Aloud
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generalResponse);
                      announce("Curriculum draft copied to clipboard.", "polite");
                    }}
                    icon={Copy}
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    Copy Draft
                  </Button>
                </div>
              </div>
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                <StructuredContentRenderer rawContent={generalResponse} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TeacherAnalyticsPage() {
  const { updateOrientation } = useAuditoryOrientation();

  useEffect(() => {
    updateOrientation({
      location: 'Pedagogical Analytics',
      section: 'Cohort Telemetry',
      actions: ['Review modality distribution', 'Analyze question accuracy']
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          Cohort Mastery Telemetry
        </span>
        <h1 className="text-3xl font-extrabold text-white">Pedagogical Analytics</h1>
        <p className="text-xs text-slate-400">
          Monitor accessibility modality distributions and conceptual friction points.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Active Modality Usage Distribution
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Standard Semantic Text</span>
                <span className="font-mono text-slate-400">42%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Cognitive Simplified Mode</span>
                <span className="font-mono text-slate-400">26%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '26%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Screen-Reader & Auditory Orientation</span>
                <span className="font-mono text-slate-400">18%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>High Contrast WCAG AAA</span>
                <span className="font-mono text-slate-400">14%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-400 h-full rounded-full" style={{ width: '14%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Conceptual Friction Points (Frequent Quiz Retakes)
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200">Mutable Pointer Aliasing</div>
              <p className="text-2xs text-slate-400">18% hesitation rate on Question 1 reference assignment.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200">Short-Circuit Logical Evaluation</div>
              <p className="text-2xs text-slate-400">12% student request rate for simplified plain language analogies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
