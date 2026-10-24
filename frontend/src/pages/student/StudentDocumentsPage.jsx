import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { StructuredContentRenderer, stripMarkdownHashes } from '../../components/common/StructuredContentRenderer';
import {
  FileText,
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Eye,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Download,
  ChevronRight
} from 'lucide-react';

export function StudentDocumentsPage() {
  const { user, setSelectedTeacher } = useAuth();
  const { announce, updateOrientation } = useAuditoryOrientation();

  const [documents, setDocuments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDoc, setActiveDoc] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    updateOrientation({
      location: 'Faculty Study Documents & Lecture Materials',
      section: 'Course Repository',
      actions: ['Inspect study documents', 'Listen to document summary', 'Switch instructor']
    });
    loadData();
  }, []);

  const loadData = async (teacherId = null) => {
    setLoading(true);
    try {
      // 1. Fetch available teachers
      const tList = await api.getTeachers().catch(() => []);
      const teachersArr = Array.isArray(tList) ? tList : [];
      setTeachers(teachersArr);

      // Determine active teacher
      const savedTid = typeof localStorage !== 'undefined' ? localStorage.getItem('accessed_selected_teacher_id') : null;
      const currentTeacherId = teacherId || user?.selected_teacher_id || savedTid || (teachersArr.length > 0 ? teachersArr[0].id : null);
      if (currentTeacherId) {
        setSelectedTeacherId(currentTeacherId);
      }

      // 2. Fetch documents for this teacher
      const docs = await api.getStudyDocuments(currentTeacherId);
      const docsArr = Array.isArray(docs) ? docs : [];
      setDocuments(docsArr);

      announce(`Loaded ${docsArr.length} study documents from faculty.`, 'polite');
    } catch (err) {
      console.error("Failed to load study documents:", err);
      announce("Failed to load study documents. Please refresh.", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = async (newTeacherId) => {
    setSelectedTeacherId(newTeacherId);
    setSwitching(true);
    announce("Switching educator and updating study documents...", "polite");

    try {
      await api.selectTeacher(newTeacherId);
      if (setSelectedTeacher) {
        setSelectedTeacher(newTeacherId);
      }
      const docs = await api.getStudyDocuments(newTeacherId);
      setDocuments(Array.isArray(docs) ? docs : []);
      const teacherObj = teachers.find(t => t.id === newTeacherId);
      announce(`Active educator updated to ${teacherObj?.full_name || 'selected educator'}. Loaded ${docs.length} materials.`, 'polite');
    } catch (err) {
      console.error("Failed to switch educator:", err);
      announce("Failed to switch educator. Please retry.", "assertive");
    } finally {
      setSwitching(false);
    }
  };

  // TTS Speech Reader
  const handleToggleTTS = (text) => {
    if (!('speechSynthesis' in window)) {
      announce("Text-to-speech is not supported in this browser.", "assertive");
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      announce("Audio playback stopped.", "polite");
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
      announce("Reading study document aloud.", "polite");
    }
  };

  const handleCloseModal = () => {
    if (isReading && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
    setActiveDoc(null);
  };

  const currentTeacherObj = teachers.find(t => t.id === selectedTeacherId);

  const filteredDocs = documents.filter(doc => {
    const q = searchQuery.toLowerCase();
    const title = (doc.title || doc.file_name || '').toLowerCase();
    const concepts = (doc.concepts_detected || []).map(c => typeof c === 'object' && c !== null ? `${c.term || ''} ${c.definition || ''}` : String(c)).join(' ').toLowerCase();
    const preview = (doc.markdown_preview || doc.extracted_markdown || '').toLowerCase();
    return title.includes(q) || concepts.includes(q) || preview.includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header with Educator Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
            Faculty Knowledge Base
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Study Materials & Lecture Notes</span>
            <Badge variant="primary">{filteredDocs.length} Documents</Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accessible, OCR-verified curriculum documents and study notes uploaded by your faculty educators.
          </p>
        </div>

        {/* Educator Selector Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-3xs uppercase font-mono font-bold text-slate-400">Curating Educator</span>
            <select
              value={selectedTeacherId}
              onChange={(e) => handleTeacherChange(e.target.value)}
              disabled={switching}
              aria-label="Filter study materials by educator"
              className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer pr-2"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                  {t.full_name} ({t.organization || 'Faculty'} • {t.courses_count || 0} courses)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or concepts..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto justify-end">
          <span>Active Instructor:</span>
          <span className="font-semibold text-white">
            {currentTeacherObj ? currentTeacherObj.full_name : 'All Educators'}
          </span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl" />
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      ) : filteredDocs.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Study Documents Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {currentTeacherObj
                ? `Instructor ${currentTeacherObj.full_name} has not uploaded study documents yet. Switch educators above or check back later.`
                : 'No study materials match your search query.'}
            </p>
          </div>
          {teachers.length > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              {teachers
                .filter(t => t.id !== selectedTeacherId)
                .map(t => (
                  <Button
                    key={t.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTeacherChange(t.id)}
                  >
                    View {t.full_name}'s Materials
                  </Button>
                ))}
            </div>
          )}
        </div>
      ) : (
        /* Document Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.map((doc) => {
            const rawConcepts = doc.concepts_detected || [];
            const concepts = (Array.isArray(rawConcepts) ? rawConcepts : []).map(c => {
              if (typeof c === 'string') return c;
              if (typeof c === 'object' && c !== null) return c.term || c.name || c.title || c.definition || '';
              return String(c);
            }).filter(Boolean);
            const previewText = doc.markdown_preview || doc.extracted_markdown || 'Study guide and lecture notes verified for accessible screen-reading and plain language synthesis.';
            const isWord = (doc.file_name || '').toLowerCase().endsWith('.docx');
            const isPdf = (doc.file_name || '').toLowerCase().endsWith('.pdf');

            return (
              <div
                key={doc.job_id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-3xs uppercase font-mono font-bold text-slate-400">
                            {isWord ? 'Word Document' : isPdf ? 'PDF OCR Paper' : 'Lecture Material'}
                          </span>
                          <span className="text-3xs text-slate-500">•</span>
                          <span className="text-3xs text-emerald-400 font-semibold">Accessible OCR</span>
                        </div>
                        <h2 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {doc.title || doc.file_name}
                        </h2>
                      </div>
                    </div>

                    <Badge variant="success">Study Ready</Badge>
                  </div>

                  {/* Detected Concepts */}
                  {concepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {concepts.map((concept, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-3xs font-medium text-indigo-300"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Text Preview - Cleaned without any '#' markers */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                    {stripMarkdownHashes(previewText)}
                  </p>
                </div>

                {/* Footer Actions: File Access & Reader */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-3xs text-slate-400 font-mono">
                    <span>By {doc.teacher_name || currentTeacherObj?.full_name || 'Faculty Educator'}</span>
                    <span className="truncate max-w-[140px]">{doc.file_name}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={doc.file_url || `/api/documents/${doc.job_id}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xs font-semibold border border-slate-700 transition-colors"
                        title="View original physical file in browser"
                      >
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                        <span>View File</span>
                      </a>
                      <a
                        href={doc.download_url || `/api/documents/${doc.job_id}/download`}
                        download={doc.file_name}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        title="Download original file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={Eye}
                      onClick={() => setActiveDoc(doc)}
                      className="text-xs"
                    >
                      Read Study Guide
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Document Reader Modal */}
      {activeDoc && (
        <Modal
          isOpen={!!activeDoc}
          onClose={handleCloseModal}
          title={activeDoc.title || activeDoc.file_name}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            {/* Metadata Bar with File View & Download actions */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300 font-medium">
                  Instructor: <span className="text-white font-semibold">{activeDoc.teacher_name || currentTeacherObj?.full_name || 'Faculty'}</span>
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <a
                  href={activeDoc.file_url || `/api/documents/${activeDoc.job_id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  title="Open original uploaded file directly"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View Original File</span>
                </a>

                <a
                  href={activeDoc.download_url || `/api/documents/${activeDoc.job_id}/download`}
                  download={activeDoc.file_name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  title="Download source document"
                >
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span>Download</span>
                </a>

                {/* TTS Listen Action */}
                <button
                  onClick={() => handleToggleTTS(activeDoc.extracted_markdown || activeDoc.markdown_preview || '')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isReading
                      ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                      : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/40'
                  }`}
                >
                  {isReading ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen Aloud (TTS)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Concepts Detected */}
            {activeDoc.concepts_detected && activeDoc.concepts_detected.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-3xs uppercase font-mono text-slate-400 font-bold mr-1">Key Topics:</span>
                {activeDoc.concepts_detected.map((c, i) => {
                  const label = typeof c === 'object' && c !== null ? (c.term || c.name || c.title || c.definition || '') : String(c);
                  return (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-700/60 text-2xs font-semibold text-indigo-300"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Document Content Viewport: Rendered cleanly via StructuredContentRenderer (zero '#' marks) */}
            <div
              tabIndex="0"
              aria-label="Study document content reading viewport"
              className="p-5 max-h-[55vh] overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <StructuredContentRenderer
                rawContent={stripMarkdownHashes(activeDoc.extracted_markdown || activeDoc.markdown_preview || 'No text extracted for this document.')}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-800">
              <span className="text-3xs text-slate-400">
                Source File: <strong className="text-slate-200 font-mono">{activeDoc.file_name}</strong> • Full accessible typography active
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={activeDoc.file_url || `/api/documents/${activeDoc.job_id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2"
                >
                  Open Original Document ↗
                </a>
                <Button variant="outline" size="sm" onClick={handleCloseModal}>
                  Done Reading
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
