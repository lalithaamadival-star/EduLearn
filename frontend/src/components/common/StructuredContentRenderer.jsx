import React, { useState } from 'react';
import {
  Copy,
  Check,
  CheckCircle2,
  Info,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Terminal,
  Bookmark
} from 'lucide-react';

/**
 * Sanitizes markdown / code text into clear, fluent spoken text for Edge Neural TTS.
 * Strips code syntax, markdown hashes, asterisks, brackets, and caps at sentence boundaries.
 */
export function cleanSpokenText(text, maxChars = 800) {
  if (!text) return '';

  let cleaned = String(text)
    // Replace literal escaped newlines
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    // Summarize code blocks into conversational phrase
    .replace(/```[a-zA-Z]*\n[\s\S]*?```/g, ' A practical code example is shown here. ')
    .replace(/```[\s\S]*?```/g, ' A code example is shown here. ')
    // Remove markdown table lines
    .replace(/\|[^\n]+\|/g, ' ')
    .replace(/[-:]{3,}/g, ' ')
    // Replace inline code backticks with just the content
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown headers
    .replace(/#{1,6}\s+/g, '')
    // Remove bold and italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Convert numbered lists into natural spoken points
    .replace(/^\s*(\d+)\.\s+/gm, 'Step $1: ')
    // Convert bullet lists into smooth sentences
    .replace(/^\s*[-*+]\s+/gm, '')
    // Remove blockquote markers
    .replace(/^\s*>\s*(\[!NOTE\]|\[!TIP\]|\[!WARNING\])?\s*/gim, '')
    // Strip common emoji markers that TTS can stumble over
    .replace(/[💡⚠️🎯🚀🔍📌]/g, '')
    // Normalize newlines to conversational pauses
    .replace(/\s*\n+\s*/g, '. ')
    // Collapse duplicate periods and spaces
    .replace(/\.{2,}/g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If text exceeds maximum desired speech length, trim neatly at a sentence end
  if (maxChars && cleaned.length > maxChars) {
    const slice = cleaned.slice(0, maxChars);
    const lastPunctuation = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('? '),
      slice.lastIndexOf('! ')
    );
    if (lastPunctuation > maxChars * 0.5) {
      cleaned = slice.slice(0, lastPunctuation + 1);
    } else {
      cleaned = slice.trim() + '...';
    }
  }

  return cleaned;
}

/**
 * High-contrast, accessible Code Block with language tag and clipboard copy.
 */
export function CodeBlock({ code, language = 'python', isCompact = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`my-3 sm:my-4 rounded-xl bg-slate-950 border border-slate-800 shadow-md overflow-hidden ${isCompact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/90 border-b border-slate-800 text-2xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-indigo-400" />
          <span className="uppercase text-indigo-400 font-bold tracking-wider">{language || 'CODE'}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-2xs sm:text-xs"
          aria-label={`Copy ${language} code snippet to clipboard`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy snippet</span>
            </>
          )}
        </button>
      </div>
      <pre
        tabIndex="0"
        aria-label={`${language} code snippet`}
        className={`p-3 sm:p-4 overflow-x-auto font-mono text-emerald-400 leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
          isCompact ? 'text-2xs sm:text-xs' : 'text-xs sm:text-sm'
        }`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Inlines bold, italics, inline-code, and links cleanly.
 */
function renderInlineFormatting(text) {
  if (!text) return null;

  // Split by inline code: `code`
  const codeParts = text.split(/(`[^`]+`)/g);
  return codeParts.map((part, cIdx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const codeText = part.slice(1, -1);
      return (
        <code
          key={cIdx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs border border-slate-700/60 font-semibold inline-block"
        >
          {codeText}
        </code>
      );
    }

    // Split by bold: **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        return (
          <strong key={`${cIdx}-${bIdx}`} className="font-bold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }

      // Split by italic: *italic*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((iPart, iIdx) => {
        if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
          return (
            <em key={`${cIdx}-${bIdx}-${iIdx}`} className="italic text-slate-300">
              {iPart.slice(1, -1)}
            </em>
          );
        }
        return iPart;
      });
    });
  });
}

/**
 * Strips all raw markdown heading hashes (#, ##, ###) and trailing hashes from text.
 * Ensures cards, previews, and reader views never show raw '#' symbols.
 */
export function stripMarkdownHashes(text) {
  if (!text) return '';
  return String(text)
    // Remove leading heading hashes
    .replace(/^(\s*)#{1,6}\s+/gm, '$1')
    // Remove trailing heading hashes
    .replace(/\s+#{1,6}\s*$/gm, '')
    // Remove standalone hash lines
    .replace(/^\s*#{1,6}\s*$/gm, '')
    // Remove any lingering multiple hashes
    .replace(/#{1,6}/g, '')
    .trim();
}

function cleanHeadingLine(line) {
  if (!line) return '';
  return line.replace(/^#{1,6}\s*/, '').replace(/\s*#{1,6}$/, '').trim();
}

/**
 * Renders an AI or lesson text in a beautifully structured, readable, accessible format.
 * Automatically parses:
 * - Code blocks (```lang ... ```)
 * - Headers (#, ##, ###, ####) without showing raw '#'
 * - Key Takeaway / Callout boxes (> Note:, 💡 Key Takeaway:, ⚠️ Alert:)
 * - Numbered steps with badges (1. 2. 3.)
 * - Bullet lists (- item)
 * - Bold key-value pairs (- **Key:** Value)
 */
export function StructuredContentRenderer({ rawContent, className = '', isCompact = false }) {
  if (!rawContent) return null;

  // 1. Normalize literal escaped newlines
  const text = String(rawContent)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .trim();

  // 2. Separate code blocks from regular text blocks
  const blocks = [];
  const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      blocks.push({ type: 'text', content: textBefore });
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'python',
      content: match[2].trim()
    });
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex);
  if (remaining.trim()) {
    blocks.push({ type: 'text', content: remaining });
  }

  return (
    <div className={`space-y-4 text-slate-200 leading-relaxed ${isCompact ? 'text-xs' : 'text-sm'} ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'code') {
          return <CodeBlock key={bIdx} code={block.content} language={block.language} isCompact={isCompact} />;
        }

        // Process lines sequentially to handle headings anywhere in the text
        const rawLines = block.content.split('\n').map(l => l.trim()).filter(Boolean);
        if (rawLines.length === 0) return null;

        return (
          <div key={bIdx} className="space-y-3">
            {rawLines.map((line, lIdx) => {
              // 1. H1 Heading: # Title
              if (/^#\s+/.test(line)) {
                return (
                  <div key={lIdx} className="space-y-2 pb-2 border-b border-slate-800 my-4 pt-2">
                    <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                      {renderInlineFormatting(cleanHeadingLine(line))}
                    </h2>
                  </div>
                );
              }

              // 2. H2 Heading: ## Section
              if (/^##\s+/.test(line)) {
                return (
                  <div key={lIdx} className="space-y-2 my-3 pt-2">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block shrink-0" />
                      {renderInlineFormatting(cleanHeadingLine(line))}
                    </h3>
                  </div>
                );
              }

              // 3. H3 / H4 / H5 / H6 Headings: ### Subsection or #### Point
              if (/^#{3,6}\s+/.test(line)) {
                const headingText = cleanHeadingLine(line);
                const isKeyTakeaway = headingText.toLowerCase().includes('takeaway') || headingText.toLowerCase().includes('summary');

                if (isKeyTakeaway) {
                  return (
                    <div key={lIdx} className="p-3.5 sm:p-4 rounded-xl bg-indigo-950/35 border border-indigo-600/50 space-y-2 my-3">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs sm:text-sm">
                        <Bookmark className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{renderInlineFormatting(headingText)}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={lIdx} className="space-y-1.5 my-2.5 pt-1">
                    <h4 className="text-sm sm:text-base font-bold text-indigo-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-sm bg-indigo-400 inline-block shrink-0" />
                      {renderInlineFormatting(headingText)}
                    </h4>
                  </div>
                );
              }

              // 4. Callout / Blockquote or Key Takeaway
              const isCallout =
                line.startsWith('> ') ||
                line.toLowerCase().includes('key takeaway') ||
                line.toLowerCase().includes('misconception') ||
                line.toLowerCase().includes('core principle') ||
                line.startsWith('💡') ||
                line.startsWith('⚠️');

              if (isCallout) {
                const isWarning = line.toLowerCase().includes('misconception') || line.startsWith('⚠️') || line.toLowerCase().includes('warning');
                const calloutText = line.replace(/^>\s*(\[!NOTE\]|\[!TIP\]|\[!WARNING\])?\s*/i, '').replace(/^[💡⚠️🎯\s]+/, '').replace(/^#{1,6}\s*/, '');

                return (
                  <div
                    key={lIdx}
                    role="note"
                    className={`p-3.5 sm:p-4 rounded-xl border my-2.5 space-y-1.5 shadow-sm ${
                      isWarning
                        ? 'bg-amber-950/30 border-amber-700/60 text-amber-200'
                        : 'bg-indigo-950/30 border-indigo-700/60 text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      {isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                      <span>{renderInlineFormatting(calloutText)}</span>
                    </div>
                  </div>
                );
              }

              // 5. Numbered step: 1. Step
              if (/^\d+\.\s/.test(line)) {
                const numMatch = line.match(/^(\d+)\.\s*(.*)/);
                const stepText = numMatch[2].replace(/^#{1,6}\s*/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-1.5 my-1.5">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 text-3xs sm:text-2xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {numMatch[1]}
                    </span>
                    <div className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                      {renderInlineFormatting(stepText)}
                    </div>
                  </div>
                );
              }

              // 6. Bullet item: - Item or * Item
              if (line.startsWith('- ') || line.startsWith('* ')) {
                const bulletText = line.replace(/^[-*]\s+/, '').replace(/^#{1,6}\s*/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2 my-1 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    <div className="leading-relaxed text-xs sm:text-sm">
                      {renderInlineFormatting(bulletText)}
                    </div>
                  </div>
                );
              }

              // 7. Regular paragraph line - ensure any stray hashes are stripped
              const cleanText = line.replace(/^#{1,6}\s*/, '').replace(/\s*#{1,6}$/, '');
              return (
                <p key={lIdx} className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {renderInlineFormatting(cleanText)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default StructuredContentRenderer;
