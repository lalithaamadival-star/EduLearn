import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export function QuizPage() {
  const { quizId } = useParams();
  const { announce, updateOrientation } = useAuditoryOrientation();

  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mistakeExplanation, setMistakeExplanation] = useState({});
  const [explainingId, setExplainingId] = useState(null);

  useEffect(() => {
    const id = quizId || 'f0000000-0000-0000-0000-000000000001';
    api.getQuiz(id).then(res => {
      setQuiz(res);
      updateOrientation({
        location: `Quiz: ${res.title}`,
        section: 'Mastery Assessment',
        actions: ['Select options via keyboard', 'Submit answers', 'Receive accessible feedback']
      });
      announce(`Quiz loaded: ${res.title}. Total questions: ${res.questions.length}.`, 'polite');
    }).catch(err => {
      console.error("Failed to load quiz:", err);
    }).finally(() => setLoading(false));
  }, [quizId]);

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: [optionId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz) return;

    setSubmitting(true);
    const answersPayload = Object.entries(selectedAnswers).map(([qId, opts]) => ({
      question_id: qId,
      selected_options: opts
    }));

    try {
      const result = await api.submitQuiz(quiz.id, answersPayload);
      setSubmissionResult(result);
      announce(result.submitted_announcement, 'assertive');
    } catch (err) {
      announce("Failed to submit quiz attempt. Please check connection and retry.", "assertive");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExplainMistake = async (item) => {
    setExplainingId(item.question_id);
    announce("Requesting AI Tutor explanation for missed question.", "polite");
    try {
      const res = await api.explainQuizMistake({
        question_text: item.question_text,
        student_answer: item.selected_options.join(', '),
        correct_answer: item.correct_options.join(', '),
        explanation: item.explanation
      });
      setMistakeExplanation(prev => ({
        ...prev,
        [item.question_id]: res.explanation
      }));
      announce("Mistake explanation ready.", "polite");
    } catch (e) {
      setMistakeExplanation(prev => ({
        ...prev,
        [item.question_id]: item.explanation
      }));
    } finally {
      setExplainingId(null);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Mastery Assessment</Badge>
          <span className="text-xs text-slate-400 font-mono">Passing score: {quiz.passing_score}%</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {quiz.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          {quiz.description}
        </p>
      </div>

      {/* Quiz Submission Result Screen */}
      {submissionResult ? (
        <div className="space-y-8">
          {/* Accessible Score Announcement Card */}
          <div
            role="status"
            aria-live="polite"
            className={`p-6 sm:p-8 rounded-2xl border ${
              submissionResult.is_passed
                ? 'bg-emerald-950/40 border-emerald-600/60'
                : 'bg-amber-950/40 border-amber-600/60'
            } space-y-4 text-center shadow-xl`}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-slate-900 border border-slate-700">
              {submissionResult.is_passed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <RotateCcw className="w-6 h-6 text-amber-400" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">
                {submissionResult.is_passed ? "Assessment Passed!" : "Review Recommended"}
              </h2>
              <p className="text-base text-slate-200 font-semibold">
                Your score is {submissionResult.score} out of {submissionResult.total_questions} ({submissionResult.percentage}%)
              </p>
            </div>

            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {submissionResult.is_passed
                ? "Excellent retention. You have demonstrated rigorous conceptual mastery of memory pointer mechanics."
                : "You have completed the assessment. Review explanations below or consult the AI Tutor to reinforce your mental model."}
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/student/revision">
                <Button variant="secondary" size="sm" icon={RotateCcw}>
                  Add to Revision Plan
                </Button>
              </Link>
              <Link to="/student/courses">
                <Button variant="primary" size="sm" icon={BookOpen}>
                  Continue Curriculum
                </Button>
              </Link>
            </div>
          </div>

          {/* Question Breakdown with Non-Color Meaning */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono text-xs">
              Detailed Question Review
            </h3>

            {submissionResult.feedback_details?.map((fb, idx) => (
              <div
                key={fb.question_id}
                className={`p-5 rounded-2xl border ${
                  fb.is_correct
                    ? 'bg-slate-900/80 border-emerald-700/50'
                    : 'bg-slate-900/80 border-rose-700/50'
                } space-y-3`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300 font-mono">Question {idx + 1}</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    {fb.is_correct ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 uppercase tracking-wider text-2xs">Correct Answer</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400 uppercase tracking-wider text-2xs">Incorrect Selection</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-100">{fb.question_text}</p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-slate-200">Instructor Explanation:</div>
                  <p>{fb.explanation}</p>
                </div>

                {/* AI Explanation Trigger for Mistake */}
                {!fb.is_correct && (
                  <div className="pt-2">
                    {mistakeExplanation[fb.question_id] ? (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-700/50 rounded-lg text-xs text-indigo-200 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                          <SymbolIcon name="ai" className="w-3.5 h-3.5" />
                          <span>AI Tutor Deep Explanation:</span>
                        </div>
                        <p className="leading-relaxed">{mistakeExplanation[fb.question_id]}</p>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={explainingId === fb.question_id}
                        onClick={() => handleExplainMistake(fb)}
                        icon={Sparkles}
                      >
                        Explain My Mistake with AI Tutor
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quiz Question Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            {quiz.questions.map((q, idx) => (
              <fieldset
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 focus-within:border-indigo-500/80 transition-colors"
              >
                <legend className="text-sm sm:text-base font-bold text-slate-100 px-1 leading-snug">
                  <span className="text-indigo-400 font-mono mr-2">{idx + 1}.</span>
                  {q.question_text}
                </legend>

                <div className="space-y-2 pt-2" role="radiogroup" aria-label={`Options for Question ${idx + 1}`}>
                  {q.options.map(opt => {
                    const isSelected = selectedAnswers[q.id]?.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'bg-indigo-600/20 text-white border-indigo-500 ring-1 ring-indigo-500'
                            : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={opt.id}
                          checked={isSelected || false}
                          onChange={() => handleSelectOption(q.id, opt.id)}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-400 h-4 w-4"
                        />
                        <span className="text-xs sm:text-sm leading-relaxed">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Answered {Object.keys(selectedAnswers).length} of {quiz.questions.length} questions
            </span>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              disabled={Object.keys(selectedAnswers).length === 0}
              icon={CheckCircle2}
            >
              Submit Quiz Attempt
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
