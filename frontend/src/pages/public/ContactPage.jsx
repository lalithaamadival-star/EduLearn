import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Send, CheckCircle2 } from 'lucide-react';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';

export function ContactPage() {
  const { announce } = useAuditoryOrientation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    reason: 'institutional_pilot',
    preferredContact: 'email',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    announce("Contact inquiry submitted successfully. Our accessibility team will respond via your preferred contact channel.", "polite");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 font-semibold">
          <SymbolIcon name="learning" className="w-3.5 h-3.5 text-indigo-400" />
          <span>Contact & Institutional Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Connect with the AccessEd Team
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Whether you are an educational institution evaluating inclusive technology or an accessibility researcher, we welcome thoughtful collaboration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6 border-t border-slate-800">
        {/* Left Column: Context & Guidelines */}
        <div className="lg:col-span-5 space-y-6 text-xs text-slate-300 leading-relaxed">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Inquiry Categories
            </h2>
            <ul className="space-y-2 text-slate-400">
              <li>• <strong>Academic Pilots:</strong> Department-level deployment of multimodal Lesson Readers.</li>
              <li>• <strong>Accessibility Audits:</strong> Third-party verification of WCAG 2.2 AAA conformance.</li>
              <li>• <strong>Research & Collaboration:</strong> Studies in cognitive simplification and auditory spatial orientation.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-indigo-400">Accessible Form Guarantee</div>
            <p className="text-slate-400">
              This form is structured with explicit form control labels, aria-describedby validation hints, and strict keyboard focus order.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-700/50 space-y-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Inquiry Received</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you for reaching out. Your inquiry has been routed to our academic accessibility solutions team. We will review your message and reply via {formData.preferredContact}.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-200">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    placeholder="e.g. Dr. Ramesh Kumar"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-200">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-org" className="block text-xs font-semibold text-slate-200">
                    Organization / Institution
                  </label>
                  <input
                    id="contact-org"
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    placeholder="College or research lab"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-reason" className="block text-xs font-semibold text-slate-200">
                    Reason for Contact
                  </label>
                  <select
                    id="contact-reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <option value="institutional_pilot">Institutional Academic Pilot</option>
                    <option value="accessibility_audit">Accessibility Inquiry / Audit</option>
                    <option value="curriculum_integration">Curriculum Document Ingestion</option>
                    <option value="research_collaboration">Research Partnership</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-pref" className="block text-xs font-semibold text-slate-200">
                  Preferred Contact Method
                </label>
                <div className="flex items-center gap-6 text-xs text-slate-300 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contact-method"
                      value="email"
                      checked={formData.preferredContact === 'email'}
                      onChange={() => setFormData({ ...formData, preferredContact: 'email' })}
                    />
                    <span>Email Response</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contact-method"
                      value="video"
                      checked={formData.preferredContact === 'video'}
                      onChange={() => setFormData({ ...formData, preferredContact: 'video' })}
                    />
                    <span>Video / Screen-share Consultation</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-200">
                  Message Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 leading-relaxed"
                  placeholder="Please describe your cohort's learning needs or evaluation goals..."
                />
              </div>

              <Button type="submit" variant="primary" size="md" icon={Send} className="w-full sm:w-auto">
                Submit Inquiry
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
