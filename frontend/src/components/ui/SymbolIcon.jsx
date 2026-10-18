import React from 'react';

/**
 * AccessEd Proprietary Geometric Symbol System
 * Replaces emoji characters with bespoke technical vector glyphs.
 */
export function SymbolIcon({ name, className = "w-5 h-5", title }) {
  const glyphs = {
    // 1. Accessibility: Geometric Aperture & Universal Alignment
    accessibility: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="7.5" r="1.5" fill="currentColor" />
        <path d="M7 11.5h10M12 11.5v6.5M9.5 18l2.5-2.5 2.5 2.5" />
      </svg>
    ),

    // 2. AI: Neural geometry & abstract connected nodes
    ai: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="5" cy="7" r="2" />
        <circle cx="19" cy="7" r="2" />
        <circle cx="5" cy="17" r="2" />
        <circle cx="19" cy="17" r="2" />
        <path d="M6.8 8.2l3.2 2.3M17.2 8.2l-3.2 2.3M6.8 15.8l3.2-2.3M17.2 15.8l-3.2-2.3M12 9.5V5M12 14.5V19" />
      </svg>
    ),

    // 3. Audio: Multi-band resonant waveform geometry
    audio: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
        <line x1="4" y1="10" x2="4" y2="14" />
        <line x1="8" y1="6" x2="8" y2="18" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="16" y1="7" x2="16" y2="17" />
        <line x1="20" y1="10" x2="20" y2="14" />
      </svg>
    ),

    // 4. Learning: Layered hierarchical prism / isometric plane
    learning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),

    // 5. Progress: Dual orbital trajectory & completion node
    progress: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="9" strokeDasharray="36 12" />
        <path d="M12 7v5l3 3" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),

    // 6. Documents: Semantic structured document glyph
    document: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),

    // 7. Processing: Orbital geometric cycle
    processing: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} animate-spin`}>
        <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
        <path d="M12 3a9 9 0 0 1 9 9" />
      </svg>
    ),

    // 8. Auditory Orientation: Compass radar pulse
    orientation: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),

    // 9. Multimodal: Triquetra equivalent transform
    multimodal: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="9" cy="9" r="6" strokeOpacity="0.8" />
        <circle cx="15" cy="9" r="6" strokeOpacity="0.8" />
        <circle cx="12" cy="15" r="6" strokeOpacity="0.8" />
      </svg>
    ),

    // 10. Simplify: Cognitive clarity lens
    simplify: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),

    // 11. Success: Minimal verifiable checkmark
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),

    // 12. Focus Mode: Concentric target
    focus: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    )
  };

  const svgElement = glyphs[name] || glyphs.accessibility;

  return (
    <span role="img" aria-label={title || name} className="inline-flex items-center justify-center shrink-0">
      {svgElement}
    </span>
  );
}
