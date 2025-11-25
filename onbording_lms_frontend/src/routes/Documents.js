import React, { useEffect, useMemo, useState } from 'react';
import DocumentList from '../components/documents/DocumentList';

import { loadAckState, saveAckState } from '../store/documentsStore';
import { getDocumentsStatus } from '../utils/documentsStatus';
import { postAcknowledgements } from '../utils/api';
import { appendInboxItem } from '../utils/adminInbox';

// Lightweight, client-only PDF generation using CDN libs (no hard deps).
// We attempt to render small HTML snippets for each document into a canvas and embed into a PDF via jsPDF.
// If libraries fail to load, we gracefully fall back to a minimal text-only PDF using jsPDF if available.
async function ensurePdfLibs() {
  try {
    // Use CDN without bundling; CRA will ignore via webpackIgnore comments when supported by bundler.
    await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
  } catch {
    // ignore - html2canvas may still be available on window if cached
  }
  try {
    await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
  } catch {
    // ignore
  }
  const html2canvas = typeof window !== 'undefined' ? window.html2canvas : null;
  const jsPDF = typeof window !== 'undefined' && window.jspdf ? (window.jspdf.jsPDF || window.jspdf?.default?.jsPDF) : null;
  return { html2canvas, jsPDF };
}

// Generate a PDF Data URL for provided HTML content.
// PUBLIC_INTERFACE
async function renderPdfDataUrlFromHtml(html, fileBaseName = 'document') {
  /** Renders given HTML string into a PDF and returns a data URL (base64). Returns '' on failure. */
  const { html2canvas, jsPDF } = await ensurePdfLibs();
  try {
    // Create a hidden container to render the HTML for capture
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px'; // approx A4 width at 96dpi
    container.style.background = '#ffffff';
    container.style.color = '#111827';
    container.innerHTML = html;
    document.body.appendChild(container);

    let dataUrl = '';

    if (html2canvas && jsPDF) {
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 24;
      const maxW = pageWidth - margin * 2;
      const ratio = canvas.width / canvas.height;
      const contentH = maxW / ratio;

      if (contentH <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, maxW, contentH, undefined, 'FAST');
      } else {
        // paginate
        let remainingHeight = contentH;
        const pageCanvasHeight = (pageHeight - margin * 2) * (canvas.height / contentH);
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;

        let sY = 0;
        while (remainingHeight > 0) {
          pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(canvas, 0, sY, canvas.width, pageCanvasHeight, 0, 0, canvas.width, pageCanvasHeight);
          const pageImg = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageImg, 'PNG', margin, margin, maxW, (maxW / ratio), undefined, 'FAST');
          remainingHeight -= (pageHeight - margin * 2);
          sY += pageCanvasHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      dataUrl = pdf.output('datauristring');
    } else if (jsPDF) {
      // Fallback: simple text PDF if html2canvas unavailable
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      pdf.setFontSize(12);
      const margin = 24;
      const lines = pdf.splitTextToSize(html.replace(/<[^>]+>/g, ''), pdf.internal.pageSize.getWidth() - margin * 2);
      pdf.text(lines, margin, margin + 12);
      dataUrl = pdf.output('datauristring');
    }

    document.body.removeChild(container);
    return typeof dataUrl === 'string' ? dataUrl : '';
  } catch {
    return '';
  }
}

// Build minimal HTML snapshots for each document using data available in localStorage.
// PUBLIC_INTERFACE
function buildDocHtmlSnapshots() {
  /**
   * Returns an object with optional HTML strings for each document:
   * { codeOfConductHtml?, ndaHtml?, offerHtml? }
   * These are compact, branded snapshots sufficient for record-keeping and preview.
   */
  const now = new Date().toLocaleString();

  // Code of Conduct
  let codeOfConductHtml = null;
  try {
    const raw = window.localStorage.getItem('code_of_conduct_ack_v1');
    const data = raw ? JSON.parse(raw) : null;
    if (data) {
      codeOfConductHtml = `
        <div style="font-family: Inter, system-ui, Arial; padding: 16px;">
          <h2 style="margin: 0 0 6px; color: #111827;">Code of Conduct - Acknowledgement</h2>
          <div style="font-size: 12px; color: #6b7280;">DigitalT3 • Generated: ${now}</div>
          <hr style="margin: 12px 0; border: 0; border-top: 1px solid #e5e7eb;" />
          <div style="line-height: 1.6; color: #111827;">
            <div><strong>Employee Name:</strong> ${data.name || ''}</div>
            <div style="margin-top: 8px;"><strong>Signature:</strong></div>
            ${data.signatureFileDataUrl ? `<img src="${data.signatureFileDataUrl}" alt="Signature" style="max-height: 96px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 4px;" />` : '<div>No signature uploaded</div>'}
          </div>
        </div>
      `;
    }
  } catch { /* ignore */ }

  // NDA
  let ndaHtml = null;
  try {
    const raw = window.localStorage.getItem('nda_agreement_form_v1');
    const data = raw ? JSON.parse(raw) : null;
    if (data) {
      ndaHtml = `
        <div style="font-family: Inter, system-ui, Arial; padding: 16px;">
          <h2 style="margin: 0 0 6px; color: #111827;">NDA Agreement - Acknowledgement</h2>
          <div style="font-size: 12px; color: #6b7280;">DigitalT3 • Generated: ${now}</div>
          <hr style="margin: 12px 0; border: 0; border-top: 1px solid #e5e7eb;" />
          <div style="line-height: 1.6; color: #111827;">
            <div><strong>Name:</strong> ${data.consultantName || ''}</div>
            <div><strong>Title:</strong> ${data.consultantTitle || ''}</div>
            <div><strong>Date:</strong> ${data.consultantDate || ''}</div>
            <div style="margin-top: 8px;"><strong>Signature:</strong></div>
            ${data.sigDataUrl ? `<img src="${data.sigDataUrl}" alt="Signature" style="max-height: 96px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 4px;" />` : '<div>No signature uploaded</div>'}
          </div>
        </div>
      `;
    }
  } catch { /* ignore */ }

  // Offer Letter
  let offerHtml = null;
  try {
    const raw = window.localStorage.getItem('offer_letter_signature_v1');
    const data = raw ? JSON.parse(raw) : null;
    if (data) {
      offerHtml = `
        <div style="font-family: Inter, system-ui, Arial; padding: 16px;">
          <h2 style="margin: 0 0 6px; color: #111827;">Offer Letter - Acknowledgement</h2>
          <div style="font-size: 12px; color: #6b7280;">DigitalT3 • Generated: ${now}</div>
          <hr style="margin: 12px 0; border: 0; border-top: 1px solid #e5e7eb;" />
          <div style="line-height: 1.6; color: #111827;">
            <div style="margin-top: 8px;"><strong>Signature:</strong></div>
            ${data.sigDataUrl ? `<img src="${data.sigDataUrl}" alt="Signature" style="max-height: 96px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 4px;" />` : '<div>No signature uploaded</div>'}
          </div>
        </div>
      `;
    }
  } catch { /* ignore */ }

  return { codeOfConductHtml, ndaHtml, offerHtml };
}

// PUBLIC_INTERFACE
export default function Documents() {
  /** Documents onboarding page simplified to list and action only, with PDF export to Admin Inbox (v2). */
  const [state] = useState(() => loadAckState());
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | saving | saved
  const [docStatus, setDocStatus] = useState(() => getDocumentsStatus());

  // Refresh statuses from localStorage on mount and when returning back from doc pages
  useEffect(() => {
    const onFocus = () => setDocStatus(getDocumentsStatus());
    // initial sync
    onFocus();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
      return () => window.removeEventListener('focus', onFocus);
    }
  }, []);

  const items = useMemo(
    () => [state.code_of_conduct, state.nda, state.internship_letter],
    [state.code_of_conduct, state.nda, state.internship_letter]
  );

  // Derive canContinue from documentsStatus store
  const allDone =
    docStatus.codeOfConduct === 'Completed' &&
    docStatus.nda === 'Completed' &&
    docStatus.offerLetter === 'Completed';

  const canContinue = allDone;

  const handleSubmit = async () => {
    setSubmitStatus('saving');
    saveAckState(state);

    // Build detailed payload from individual localStorage keys
    const nowIso = new Date().toISOString();

    // Code of Conduct data
    let codeOfConduct = null;
    try {
      const raw = window.localStorage.getItem('code_of_conduct_ack_v1');
      const data = raw ? JSON.parse(raw) : null;
      if (data) {
        codeOfConduct = {
          employeeName: data.name || '',
          signatureImage: data.signatureFileDataUrl || '',
          signatureFileName: data.signatureFileName || '',
          acceptedAt: state?.code_of_conduct?.acceptedAt || data.savedAt || nowIso,
          signatureName: state?.code_of_conduct?.signatureName || data.name || '',
        };
      }
    } catch { /* ignore */ }

    // NDA data
    let nda = null;
    try {
      const raw = window.localStorage.getItem('nda_agreement_form_v1');
      const data = raw ? JSON.parse(raw) : null;
      if (data) {
        nda = {
          consultantName: data.consultantName || '',
          consultantTitle: data.consultantTitle || '',
          consultantDate: data.consultantDate || '',
          signatureImage: data.sigDataUrl || '',
          signatureFileName: data.sigFileName || '',
          acceptedAt: state?.nda?.acceptedAt || data.savedAt || nowIso,
          signatureName: state?.nda?.signatureName || data.consultantName || '',
        };
      }
    } catch { /* ignore */ }

    // Offer Letter data
    let offerLetter = null;
    try {
      const raw = window.localStorage.getItem('offer_letter_signature_v1');
      const data = raw ? JSON.parse(raw) : null;
      if (data) {
        offerLetter = {
          signatureImage: data.sigDataUrl || '',
          signatureFileName: data.sigFileName || '',
          acceptedAt: state?.internship_letter?.acceptedAt || data.savedAt || nowIso,
          signatureName: state?.internship_letter?.signatureName || '',
        };
      }
    } catch { /* ignore */ }

    // Identify submitter from session
    let submittedBy = 'anonymous';
    try {
      const authRaw = window.localStorage.getItem('lms_auth');
      const auth = authRaw ? JSON.parse(authRaw) : null;
      submittedBy = auth?.user?.email || 'anonymous';
    } catch { /* ignore */ }

    // 1) Generate PDFs (Data URLs) using lightweight client-side approach for each applicable document.
    // We create small HTML snapshots and render them. If generation fails, fields remain undefined.
    let codeOfConductPdf = '';
    let ndaPdf = '';
    let offerLetterPdf = '';
    try {
      const { codeOfConductHtml, ndaHtml, offerHtml } = buildDocHtmlSnapshots();
      if (codeOfConductHtml) codeOfConductPdf = await renderPdfDataUrlFromHtml(codeOfConductHtml, 'Code_of_Conduct');
      if (ndaHtml) ndaPdf = await renderPdfDataUrlFromHtml(ndaHtml, 'NDA_Agreement');
      if (offerHtml) offerLetterPdf = await renderPdfDataUrlFromHtml(offerHtml, 'Offer_Letter');
    } catch {
      // ignore generation errors; PDFs are optional
    }

    // 2) Build inbox item per requested schema, including optional PDF data URLs.
    const inboxItem = {
      email: submittedBy || 'anonymous',
      submittedAt: new Date().toLocaleString(),
      codeOfConduct: docStatus.codeOfConduct === 'Completed',
      nda: docStatus.nda === 'Completed',
      offerLetter: docStatus.offerLetter === 'Completed',
      // Optional attachments (base64 data URLs)
      ...(codeOfConductPdf ? { codeOfConductPdf } : {}),
      ...(ndaPdf ? { ndaPdf } : {}),
      ...(offerLetterPdf ? { offerLetterPdf } : {}),
    };

    // 3) Persist to localStorage under admin_inbox_v2 (append)
    try {
      appendInboxItem(inboxItem);
    } catch {
      // ignore storage failures
    }

    // Keep existing local acknowledgement posting (no-op without API base)
    const payload = {
      userId: 'local-session',
      documents: [state.code_of_conduct, state.nda, state.internship_letter].map((d) => ({
        key: d.key,
        name: d.name,
        signatureName: d.signatureName,
        acceptedAt: d.acceptedAt,
      })),
    };
    await postAcknowledgements(payload);

    setSubmitStatus('saved');
    setTimeout(() => setSubmitStatus('idle'), 3000);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f9fafb',
        padding: 12, // reduced outer padding
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 12, // reduced gap between columns/sections
          width: '100%',
          flex: 1, // allow content to grow so footer sticks to bottom
        }}
      >
        <aside>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10, // slightly tighter radius
              padding: 0,
              boxShadow: '0 3px 8px rgba(0,0,0,0.04)', // slightly lighter shadow
              marginBottom: 8, // reduce bottom spacing
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                height: 36, // slightly shorter header band
                background: 'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(249,250,251,0.6))',
                borderBottom: '1px solid #e5e7eb',
              }}
            />
            <div style={{ padding: 12 }}>
              <h1 style={{ margin: 0, color: '#111827', fontSize: 20 }}>Onboarding Documents</h1>
              <p style={{ marginTop: 6, marginBottom: 0, color: '#6b7280', lineHeight: 1.4 }}>
                Read and acknowledge all required documents. Continue is enabled once Code of Conduct, NDA, and the Internship Letter are signed.
              </p>
            </div>
          </div>

          <DocumentList items={items} />
        </aside>

        {/* Right side content area reserved for future extensions */}
        <section aria-label="Content" style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          {/* Intentionally empty for now to remove top-right action bar */}
        </section>
      </div>

      {/* Sticky bottom action bar that does not overlap content */}
      <div
        role="region"
        aria-label="Document actions"
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 5,
          width: '100%',
          background: 'linear-gradient(to top, rgba(249,250,251,0.98), rgba(249,250,251,0.75))',
          borderTop: '1px solid #e5e7eb',
          padding: '8px 0', // reduced vertical padding for shorter bar
          marginTop: 10, // slightly tighter spacing from content
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 12px', // reduce side padding
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'flex-end',
          }}
        >
          {!canContinue && (
            <span role="note" aria-live="polite" style={{ color: '#6b7280', marginRight: 'auto', fontSize: 12 }}>
              Complete Code of Conduct, NDA, and Offer Letter to continue.
            </span>
          )}
          {submitStatus === 'saved' && canContinue && (
            <span role="status" style={{ color: '#10B981', marginRight: 'auto', fontSize: 12 }}>
              Saved locally. You can proceed.
            </span>
          )}
          <button
            disabled={!canContinue || submitStatus === 'saving'}
            onClick={handleSubmit}
            className="btn"
            style={{
              background: canContinue ? 'var(--primary)' : '#93C5FD',
              color: '#fff',
              borderRadius: 10,
              padding: '8px 12px', // reduced button padding to match shorter bar
              minWidth: 128, // slightly narrower while remaining accessible
              cursor: canContinue ? 'pointer' : 'not-allowed',
              boxShadow: canContinue ? '0 6px 18px rgba(37,99,235,0.25)' : 'none',
            }}
            aria-disabled={!canContinue || submitStatus === 'saving'}
            aria-label="Continue after acknowledging documents"
            title={canContinue ? 'Continue' : 'Finish all documents to enable'}
          >
            {submitStatus === 'saving' ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>

      <footer style={{ marginTop: 8, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
}
