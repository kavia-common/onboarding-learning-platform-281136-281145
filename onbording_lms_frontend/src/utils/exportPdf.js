//
// Reusable PDF export utilities for capturing DOM elements using html2canvas + jsPDF.
// This implements multi-page handling, sharp rendering (scale:2), and CORS support.
// Usage notes:
//  - Prefer passing a specific container element (e.g., a card or content section) rather than the whole page.
//  - Ensure any web fonts/images are loaded; the function waits briefly before capture.
//  - Example:
//      import { exportElementToPdf, exportSelectorToPdf } from '../utils/exportPdf';
//      const ref = useRef(null);
//      <button onClick={() => exportElementToPdf(ref.current, 'my-export.pdf')}>Download PDF</button>
//      // or by selector:
//      <button onClick={() => exportSelectorToPdf('#content', 'my-export.pdf')}>Download PDF</button>
//
/* eslint-disable no-console */

// PUBLIC_INTERFACE
export async function exportElementToPdf(element, filename = 'page-export.pdf') {
  /**
   * Capture a DOM element into a multi-page A4 portrait PDF using html2canvas + jsPDF.
   * - element: HTMLElement or null
   * - filename: string, the PDF filename to save as
   * Returns: true on success, false on failure (logs warnings)
   */
  if (typeof window === 'undefined') return false;
  if (!element) {
    console.warn('[exportElementToPdf] No element provided.');
    return false;
  }

  // Delay slightly to allow fonts/images to settle.
  await new Promise((r) => setTimeout(r, 120));

  // Attempt to dynamically import libs (app may also install them locally).
  let html2canvas = null;
  let jsPDFCtor = null;

  try {
    // Try local dependencies first
    const h2c = await import(/* webpackChunkName: "html2canvas" */ 'html2canvas').catch(() => null);
    if (h2c && (h2c.default || h2c)) html2canvas = h2c.default || h2c;
  } catch {
    // ignore
  }
  try {
    const jspdfMod = await import(/* webpackChunkName: "jspdf" */ 'jspdf').catch(() => null);
    if (jspdfMod && (jspdfMod.jsPDF || jspdfMod.default?.jsPDF)) {
      jsPDFCtor = jspdfMod.jsPDF || jspdfMod.default.jsPDF;
    }
  } catch {
    // ignore
  }

  // If local imports failed (not installed), fall back to CDN globals.
  if (!html2canvas) {
    try {
      await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      html2canvas = window.html2canvas || null;
    } catch { /* ignore */ }
  }
  if (!jsPDFCtor) {
    try {
      await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
      jsPDFCtor = window.jspdf ? (window.jspdf.jsPDF || window.jspdf?.default?.jsPDF) : null;
    } catch { /* ignore */ }
  }

  if (!html2canvas || !jsPDFCtor) {
    console.warn('[exportElementToPdf] Missing libs. Falling back to window.print().');
    try { window.print(); } catch { /* ignore */ }
    return false;
  }

  // For capture fidelity, add a temporary class to allow CSS tweaks if needed.
  element.classList?.add?.('print-ready');

  try {
    const canvas = await html2canvas(element, {
      scale: 2,                // crisper output
      useCORS: true,           // allow cross-origin images if CORS-enabled
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: document.documentElement.clientWidth,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDFCtor({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Fit image to page width, maintain aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Multi-page: keep adding the same tall image, shifted upward
    while (heightLeft > 1) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // Ensure a meaningful filename
    const safeName = String(filename || 'page-export.pdf').trim() || 'page-export.pdf';
    pdf.save(safeName);
    return true;
  } catch (e) {
    console.warn('[exportElementToPdf] Failed to generate PDF:', e);
    try { window.print(); } catch { /* ignore */ }
    return false;
  } finally {
    element.classList?.remove?.('print-ready');
  }
}

// PUBLIC_INTERFACE
export async function exportSelectorToPdf(selector, filename = 'page-export.pdf') {
  /**
   * Convenience helper that resolves an element by query selector and invokes exportElementToPdf.
   */
  if (typeof window === 'undefined') return false;
  if (!selector || typeof selector !== 'string') {
    console.warn('[exportSelectorToPdf] Invalid selector.');
    return false;
  }
  const el = document.querySelector(selector);
  if (!el) {
    console.warn('[exportSelectorToPdf] Element not found for selector:', selector);
    return false;
  }
  return exportElementToPdf(el, filename);
}
