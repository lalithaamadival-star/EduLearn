import React from 'react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-300 text-sm">
      <h1 className="text-3xl font-extrabold text-white">Student Data Privacy & Ethical Governance</h1>
      <div className="space-y-4 leading-relaxed border-t border-slate-800 pt-6">
        <p>AccessEd adheres strictly to academic privacy guidelines and student autonomy principles.</p>
        <h2 className="text-lg font-bold text-white pt-2">1. Data Minimization</h2>
        <p>We only process data required to render personalized accessibility preferences and evaluate learning progress. We never sell, advertise against, or monetize student activity data.</p>
        <h2 className="text-lg font-bold text-white pt-2">2. Scoped AI Context</h2>
        <p>When student queries are sent to the AI Tutor, context is restricted strictly to the current lesson snippet and active course. Personal identifiers and unrelated notes are never included in prompts.</p>
        <h2 className="text-lg font-bold text-white pt-2">3. Row Level Security Isolation</h2>
        <p>Private notes, bookmarks, and quiz attempts are secured using PostgreSQL Row Level Security policies. Only the owning student has read and write access.</p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-300 text-sm">
      <h1 className="text-3xl font-extrabold text-white">Terms of Educational Service</h1>
      <div className="space-y-4 leading-relaxed border-t border-slate-800 pt-6">
        <p>By utilizing the AccessEd platform, educational institutions and learners agree to adhere to academic integrity, mutual respect, and inclusive learning standards.</p>
        <h2 className="text-lg font-bold text-white pt-2">1. Educational Assistance</h2>
        <p>The AI Tutor is intended as a pedagogical companion to foster deep comprehension. Submissions must represent the authentic conceptual understanding of the student.</p>
        <h2 className="text-lg font-bold text-white pt-2">2. Intellectual Property & Uploads</h2>
        <p>Educators retain full copyright over all lecture documents and course materials processed through the Gemini Document Intelligence pipeline.</p>
      </div>
    </div>
  );
}
