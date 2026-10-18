import React from 'react';
import { SymbolIcon } from '../../components/ui/SymbolIcon';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 font-semibold">
          <SymbolIcon name="learning" className="w-3.5 h-3.5 text-indigo-400" />
          <span>Mission & Philosophy</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Why AccessEd Exists
        </h1>
        <p className="text-xl text-slate-300 leading-relaxed font-serif italic">
          "Learning should adapt to the learner."
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white">The Fundamental Flaw in Digital Education</h2>
        <p>
          Most educational software is designed for a hypothetical "average" student who consumes text with perfect vision, navigates complex interfaces with a mouse, processes dense paragraphs at a uniform speed, and speaks English as a primary language.
        </p>
        <p>
          When accessibility is considered, it is almost universally treated as an afterthought: a clumsy high-contrast toggle that breaks responsive styles, an automated screen-reader announcement that recites raw HTML tags, or an isolated "blind version" of a website that quickly falls behind the main syllabus.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">Our Approach: Multimodal Polymorphism</h2>
        <p>
          AccessEd was engineered around a single foundational axiom: <strong>every unit of educational content must exist in equivalent, simultaneous representations.</strong>
        </p>
        <p>
          A lesson on computer memory pointers should be equally lucid when read as an in-depth technical monograph, listened to as a multi-speed neural voice narration, absorbed through simplified cognitive anchors, navigated via keyboard with clear spatial auditory orientation, or studied in Kannada or Hindi.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">AI as an Assistive Lens, Not an Automation Shortcut</h2>
        <p>
          We do not believe in replacing teachers with chatbots. In AccessEd, Artificial Intelligence serves as an assistive lens:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-300">
          <li><strong>For Learners:</strong> AI adapts explanations to their current difficulty, breaks down complex jargon, and patiently deconstructs quiz errors without judgment.</li>
          <li><strong>For Educators:</strong> AI accelerates curriculum extraction from legacy PDFs and generates draft quizzes, while keeping the human teacher in absolute control before anything is published.</li>
        </ul>
      </div>
    </div>
  );
}
