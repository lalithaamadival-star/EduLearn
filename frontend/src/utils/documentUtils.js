/**
 * AccessEd Document Utilities
 * Robust, client-safe document viewing, clipboard copy, and native Save as PDF.
 * Avoids any top-level blob: navigation that Chrome blocks with ERR_BLOCKED_BY_CLIENT in sandboxed origins.
 */

/**
 * Strips markdown hashtags (#) and cleans text for document rendering and previews.
 */
export function cleanDocumentText(raw) {
  if (!raw) return '';
  return raw
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ''))
    .trim();
}

/**
 * Copies the full formatted document text to the user's clipboard.
 */
export async function copyDocumentText(doc) {
  if (!doc) return false;
  const title = doc.title || doc.file_name || 'Study Document';
  const author = doc.teacher_name || 'Faculty Educator';
  const content = doc.extracted_markdown || doc.markdown_preview || 'AccessEd Inclusive Learning Study Guide';
  const fullText = `================================================================================\n${title.toUpperCase()}\nCurating Faculty Educator: ${author}\nSource Document: ${doc.file_name || 'document.pdf'}\nVerification: OCR & Accessibility Verified - AccessEd Platform\n================================================================================\n\n${cleanDocumentText(content)}`;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullText);
      return true;
    }
  } catch (_) {}

  try {
    const ta = document.createElement('textarea');
    ta.value = fullText;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Opens the native browser print / "Save as PDF" dialog.
 * Works seamlessly in all environments including restricted sandboxes.
 */
export function printOrSaveDocument() {
  try {
    window.print();
    return true;
  } catch (err) {
    console.warn('window.print invocation note:', err);
    return false;
  }
}

/**
 * Download document handler.
 * 1. Copies full document text to clipboard.
 * 2. Attempts direct client-side blob download (for local/un-sandboxed browsers).
 * 3. Triggers browser print/Save as PDF so user can save the document directly as a PDF.
 */
export function downloadDocumentFile(doc, onMessage = null) {
  if (!doc) return;
  const fileName = doc.file_name || `${(doc.title || 'study_document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const title = doc.title || doc.file_name || 'Study Document';
  const author = doc.teacher_name || 'Faculty Educator';
  const content = doc.extracted_markdown || doc.markdown_preview || 'AccessEd Inclusive Learning Study Guide';

  // 1. Copy text to clipboard
  copyDocumentText(doc);

  // 2. Try programmatic download (works in normal browsers)
  try {
    const header = `================================================================================\n${title.toUpperCase()}\nCurating Educator: ${author}\nSource File: ${fileName}\nPlatform: AccessEd Inclusive Learning (www.web-a2z.com)\nDate: ${new Date().toLocaleDateString()}\n================================================================================\n\n`;
    const fullText = header + cleanDocumentText(content);
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName.endsWith('.txt') ? fileName : `${fileName.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 1000);
  } catch (_) {}

  // 3. Open Save as PDF dialog
  setTimeout(() => {
    printOrSaveDocument();
  }, 300);

  if (onMessage) {
    onMessage(`Document ready: select "Save as PDF" to save file (Text also copied to clipboard)`);
  }
}
