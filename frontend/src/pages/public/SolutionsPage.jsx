import React from 'react';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Building2, GraduationCap, School, CheckCircle2 } from 'lucide-react';

export function SolutionsPage() {
  const solutions = [
    {
      title: "Universities & Higher Education",
      icon: GraduationCap,
      desc: "Empower academic departments to fulfill strict accessibility mandates while improving STEM and humanities retention for neurodivergent and low-vision undergraduates.",
      benefits: ["Automated syllabus document OCR", "Role-based institutional course sandboxes", "Multi-lingual curriculum translation"]
    },
    {
      title: "K-12 & Specialized Academies",
      icon: School,
      desc: "Provide elementary and secondary students with cognitive simplification layers, high-contrast dyslexic modes, and patient, private AI tutoring.",
      benefits: ["Cognitive plain language translation", "Auditory read-aloud with synced words", "Zero distracting or gamified ads"]
    },
    {
      title: "Enterprise Learning & Professional Training",
      icon: Building2,
      desc: "Deploy inclusive internal compliance and technical engineering onboarding across distributed international workforces.",
      benefits: ["WCAG 2.2 AAA audit compliance", "Self-hosted & Supabase RLS privacy isolation", "Hands-on code walkthroughs"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 font-semibold">
          <SymbolIcon name="learning" className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sector Solutions</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Solutions for Inclusive Educational Institutions
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          AccessEd scales across colleges, specialized learning centers, and enterprise academies with tailored multimodal learning deployments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {solutions.map((sol, idx) => {
          const Icon = sol.icon;
          return (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">{sol.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{sol.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                {sol.benefits.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
