import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../components/common/ToastContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { StructuredContentRenderer, stripMarkdownHashes } from '../../components/common/StructuredContentRenderer';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  UploadCloud,
  FileCode,
  ExternalLink,
  Download,
  Eraser
} from 'lucide-react';

export function DocumentProcessingPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { announce, updateOrientation } = useAuditoryOrientation();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState('editor'); // 'editor' | 'preview'

  useEffect(() => {
    updateOrientation({
      location: 'Gemini Document Intelligence OCR Pipeline',
      section: 'Curriculum Ingestion',
      actions: ['Upload syllabus document', 'Review extracted markdown', 'Publish to course lesson']
    });
    loadJobs();
  }, [user?.id]);

  const loadJobs = () => {
    api.getDocumentJobs(user?.id).then(data => {
      setJobs(Array.isArray(data) ? data : []);
    }).catch(err => console.error("Error loading document jobs:", err));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    announce(`Uploading ${file.name} to Gemini Document OCR pipeline.`, 'polite');

    try {
      const job = await api.uploadDocument(file);
      setJobs(prev => [job, ...prev]);
      toast.success(`"${job.file_name}" uploaded & parsed with Gemini OCR!`);
      announce(`Document processed: ${job.file_name}. Status: Needs Review.`, 'polite');
    } catch (err) {
      toast.error(err.message || "Document processing could not be completed.");
      announce("Document processing could not be completed. Please retry.", "assertive");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenReview = (job) => {
    setSelectedJob(job);
    setEditedMarkdown(job.extracted_markdown || '');
    setTeacherNotes(job.teacher_notes || '');
    setReviewModalOpen(true);
    announce(`Opened review editor for ${job.file_name}.`, 'polite');
  };

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleSaveReview = async () => {
    if (!selectedJob) return;
    try {
      const updated = await api.reviewDocument(selectedJob.job_id, {
        extracted_markdown: editedMarkdown,
        teacher_notes: teacherNotes,
        status: 'READY'
      });
      setJobs(prev => prev.map(j => j.job_id === updated.job_id ? { ...j, ...updated, status: 'READY' } : j));
      setSelectedJob(prev => ({ ...prev, ...updated, status: 'READY' }));
      setSaveSuccessMsg('✓ Review saved! Document is marked as READY and shared with students.');
      toast.success("Document review saved & shared with enrolled students!");
      announce("Teacher edits saved. Document marked as Ready for publishing.", "polite");
    } catch (e) {
      toast.error(e.message || "Failed to save document review.");
      announce("Failed to save document review.", "assertive");
    }
  };

  const handlePublish = async () => {
    if (!selectedJob) return;
    setPublishing(true);
    try {
      const res = await api.publishDocument(selectedJob.job_id);
      setJobs(prev => prev.map(j => j.job_id === selectedJob.job_id ? { ...j, status: 'PUBLISHED' } : j));
      setReviewModalOpen(false);
      toast.success(`Published as lesson: "${res.lesson.title}"!`);
      announce(`Document published as new lesson: ${res.lesson.title}.`, 'polite');
    } catch (e) {
      toast.error(e.message || "Publishing failed.");
      announce("Publishing failed.", "assertive");
    } finally {
      setPublishing(false);
    }
  };

  const [pushingDocQuiz, setPushingDocQuiz] = useState(false);
  const [docQuizPushed, setDocQuizPushed] = useState(false);

  const handlePushDocumentQuiz = async () => {
    if (!selectedJob) return;
    const questions = selectedJob.extracted_structure?.suggested_quiz_questions || [];
    if (questions.length === 0) return;

    setPushingDocQuiz(true);
    try {
      const payload = {
        title: `Mastery Assessment: ${selectedJob.file_name.replace(/\.[^/.]+$/, "")}`,
        description: `Pedagogical assessment generated from document ${selectedJob.file_name}`,
        passing_score: 70,
        questions: questions.map((q, idx) => ({
          id: `doc-q-${idx + 1}`,
          question_text: q.question || q.question_text || `Question ${idx + 1}`,
          options: q.options || ["Option A", "Option B", "Option C", "Option D"],
          correct_answer: [q.correct_answer || (q.options ? q.options[0] : "Option A")],
          explanation: q.explanation || "Extracted from source document material."
        }))
      };
      await api.createQuiz(payload);
      setDocQuizPushed(true);
      toast.success("Document quiz successfully published to students!");
      announce("Document quiz questions successfully pushed to course quiz section!", "polite");
    } catch (e) {
      toast.error(e.message || "Failed to push document quiz. Please retry.");
      announce("Failed to push document quiz. Please retry.", "assertive");
    } finally {
      setPushingDocQuiz(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-2xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          AI Document Intelligence (Google Gemini OCR)
        </span>
        <h1 className="text-3xl font-extrabold text-white">Curriculum Ingestion Pipeline</h1>
        <p className="text-xs text-slate-400">
          Upload PDF lecture notes, syllabi, or DOCX slides. Gemini extracts semantic structure, headings, formulas, and suggested quizzes for mandatory educator review.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="p-8 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 hover:border-amber-500/80 transition-colors text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">Upload Educational Document</h2>
          <p className="text-xs text-slate-400">Supported formats: PDF, DOCX, PPTX, Images (up to 50MB)</p>
        </div>

        <div>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow">
              Select Document File
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.pptx,image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {uploading && (
          <div className="flex items-center justify-center gap-2 text-xs text-amber-400 pt-2 animate-pulse">
            <SymbolIcon name="processing" className="w-4 h-4" />
            <span>Gemini OCR analyzing document structure...</span>
          </div>
        )}
      </div>

      {/* Processing Pipeline Stages */}
      <section aria-labelledby="jobs-heading" className="space-y-4">
        <h2 id="jobs-heading" className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
          Ingestion & Review Queue ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <FileText className="w-6 h-6 text-slate-500 mx-auto" />
            <div className="font-semibold text-slate-200">No Documents Uploaded Yet</div>
            <p className="text-2xs text-slate-500 max-w-sm mx-auto">
              Your educator workspace is clean. Use the upload button above to ingest syllabi, lecture notes, or research papers.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {jobs.map(job => (
              <div key={job.job_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === 'NEEDS_REVIEW' ? 'warning' : (job.status === 'READY' || job.status === 'PUBLISHED') ? 'success' : 'neutral'}>
                      {job.status}
                    </Badge>
                    <span className="text-2xs font-mono text-slate-400">Job ID: {job.job_id}</span>
                  </div>
                  <div className="font-bold text-white text-sm truncate">{job.file_name}</div>
                  {job.extracted_structure && (
                    <div className="text-2xs text-slate-400">
                      Extracted: {job.extracted_structure.headings?.length || 3} sections • Proposed {job.extracted_structure.suggested_quiz_questions?.length || 1} quiz questions
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={job.file_url || `/api/documents/${job.job_id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xs font-semibold border border-slate-700 transition-colors"
                    title="View uploaded document in browser"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>View File</span>
                  </a>
                  <a
                    href={job.download_url || `/api/documents/${job.job_id}/download`}
                    download={job.file_name}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Download original file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <Button variant="secondary" size="sm" onClick={() => handleOpenReview(job)} icon={Eye}>
                    {job.status === 'PUBLISHED' ? 'View Published Markdown' : 'Review & Edit Draft'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Educator Review & Publish Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Educator Review: ${selectedJob?.file_name}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4 text-xs">
          {saveSuccessMsg ? (
            <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs font-semibold">
              {saveSuccessMsg}
            </div>
          ) : (
            <div className="p-3 bg-amber-950/20 border border-amber-700/40 rounded-xl text-amber-200 text-xs">
              <strong>Mandatory Human Gate:</strong> Review AI-extracted markdown, verify accuracy and formulas, then click Publish to Course.
            </div>
          )}

          {/* Source Document File Bar */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="text-slate-200 font-semibold">{selectedJob?.file_name}</span>
              <span className="text-3xs text-slate-500 font-mono">({selectedJob?.job_id})</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={selectedJob?.file_url || `/api/documents/${selectedJob?.job_id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xs font-semibold border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-amber-400" />
                <span>View Original File</span>
              </a>
              <a
                href={selectedJob?.download_url || `/api/documents/${selectedJob?.job_id}/download`}
                download={selectedJob?.file_name}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xs font-semibold border border-slate-700 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </a>
            </div>
          </div>

          {/* Mode Switcher & Hash Cleaner Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveReviewTab('editor')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeReviewTab === 'editor'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Markdown Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveReviewTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeReviewTab === 'preview'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student Live View (Zero Hashes)
              </button>
            </div>

            {activeReviewTab === 'editor' && (
              <button
                type="button"
                onClick={() => {
                  setEditedMarkdown(prev => stripMarkdownHashes(prev));
                  announce("Cleaned all raw '#' hashes from document text.", "polite");
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-2xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Remove all raw '#' markdown heading characters from the text"
              >
                <Eraser className="w-3 h-3" />
                <span>Clean '#' Hashes</span>
              </button>
            )}
          </div>

          {activeReviewTab === 'editor' ? (
            <div className="space-y-1.5">
              <label htmlFor="markdown-editor" className="block font-semibold text-slate-200">
                Extracted Curriculum Markdown (Editable)
              </label>
              <textarea
                id="markdown-editor"
                rows={12}
                value={editedMarkdown}
                onChange={(e) => setEditedMarkdown(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="text-2xs text-slate-400 uppercase font-mono font-bold">
                Live Formatted Preview (Accessible Multi-Sensory Renderer):
              </div>
              <div className="p-5 max-h-[45vh] overflow-y-auto rounded-xl bg-slate-950 border border-slate-800">
                <StructuredContentRenderer rawContent={stripMarkdownHashes(editedMarkdown)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="teacher-notes-input" className="block font-semibold text-slate-200">
              Teacher Editorial Notes
            </label>
            <input
              id="teacher-notes-input"
              type="text"
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="e.g. Added accessibility note on Raft consensus message ordering..."
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          </div>

          {/* AI Suggested Quiz Push Section */}
          {selectedJob?.extracted_structure?.suggested_quiz_questions?.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">
                    Gemini Suggested Diagnostic Quiz ({selectedJob.extracted_structure.suggested_quiz_questions.length} Questions)
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  loading={pushingDocQuiz}
                  disabled={docQuizPushed}
                  onClick={handlePushDocumentQuiz}
                  icon={docQuizPushed ? CheckCircle2 : UploadCloud}
                  className={`text-xs ${docQuizPushed ? 'text-emerald-400 border-emerald-600' : 'text-amber-300 border-amber-500/60'}`}
                >
                  {docQuizPushed ? 'Quiz Pushed to Section' : 'Push Suggested Quiz to Quiz Section'}
                </Button>
              </div>

              {docQuizPushed && (
                <div className="text-2xs text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800">
                  Quiz assessment successfully created and linked in Supabase!
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setReviewModalOpen(false)}>
              Close
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleSaveReview}>
                Save Draft Edits
              </Button>
              <Button
                variant="accent"
                size="sm"
                loading={publishing}
                onClick={handlePublish}
                icon={Check}
              >
                Approve & Publish to Curriculum
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
