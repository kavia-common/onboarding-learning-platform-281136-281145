import React, { useEffect, useMemo, useState } from 'react';
import DocumentList from '../components/documents/DocumentList';

import { loadAckState, saveAckState } from '../store/documentsStore';
import { getDocumentsStatus } from '../utils/documentsStatus';
import { postAcknowledgements } from '../utils/api';
import { appendInboxItem } from '../utils/adminInbox';

// Lightweight, client-only PDF generation using CDN libs (no hard deps).
// We attempt to render small HTML snippets for each document into a canvas and embed into a PDF via jsPDF.
// If libraries fail to load, we gracefully fall back to a minimal text-only PDF using jsPDF if available.
// Limitations: client-side rasterization can slightly change fonts/layout. This is acceptable for preview and archival.
// Guard for SSR by checking for 'window' before DOM access.
async function ensurePdfLibs() {
  if (typeof window === 'undefined') return { html2canvas: null, jsPDF: null };
  try {
    await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
  } catch { /* ignore */ }
  try {
    await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
  } catch { /* ignore */ }
  const html2canvas = window.html2canvas || null;
  const jsPDF = window.jspdf ? (window.jspdf.jsPDF || window.jspdf?.default?.jsPDF) : null;
  return { html2canvas, jsPDF };
}

/**
 * INTERNAL: Ensure the pdf output is a valid data URL and not truncated/empty.
 */
function normalizePdfDataUrl(maybe) {
  if (!maybe || typeof maybe !== 'string') return '';
  // jsPDF may produce data:application/pdf;filename=...;base64,....
  if (maybe.startsWith('data:application/pdf')) {
    // basic sanity: ensure there is a comma and there is base64 data after
    const idx = maybe.indexOf(',');
    if (idx > -1 && maybe.length - idx > 32) {
      return maybe;
    }
  }
  return '';
}

// PUBLIC_INTERFACE
async function renderPdfDataUrlFromHtml(html, fileBaseName = 'document') {
  /** Renders given HTML string into a PDF and returns a data URL (base64). Returns '' on failure. */
  if (typeof window === 'undefined') return '';
  const { html2canvas, jsPDF } = await ensurePdfLibs();
  try {
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px';
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

      // Ensure we get a data URL string. Prefer datauristring.
      const out = pdf.output('datauristring');
      dataUrl = normalizePdfDataUrl(out);
      if (!dataUrl) {
        // As a fallback try blob and convert to data URL
        const blob = pdf.output('blob');
        dataUrl = await new Promise((resolve) => {
          const fr = new FileReader();
          fr.onloadend = () => resolve(typeof fr.result === 'string' ? normalizePdfDataUrl(fr.result) : '');
          fr.onerror = () => resolve('');
          fr.readAsDataURL(blob);
        });
      }
    } else if (jsPDF) {
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      pdf.setFontSize(12);
      const margin = 24;
      const lines = pdf.splitTextToSize(html.replace(/<[^>]+>/g, ''), pdf.internal.pageSize.getWidth() - margin * 2);
      pdf.text(lines, margin, margin + 12);
      const out = pdf.output('datauristring');
      dataUrl = normalizePdfDataUrl(out);
    }

    // Cleanup
    document.body.removeChild(container);

    // Final size check to avoid storing tiny/truncated payloads
    if (!dataUrl) return '';
    const commaIdx = dataUrl.indexOf(',');
    const b64Len = commaIdx > -1 ? dataUrl.length - (commaIdx + 1) : 0;
    // Require at least ~1KB of base64 to be considered valid
    if (b64Len < 1024) return '';

    return dataUrl;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('renderPdfDataUrlFromHtml failed:', e);
    return '';
  }
}

// Build minimal HTML snapshots from localStorage data to keep generation fast and robust.
// PUBLIC_INTERFACE
function buildDocHtmlSnapshots() {
  /**
   * Returns an object with optional HTML strings for each document:
   * { codeOfConductHtml?, ndaHtml?, offerHtml? }
   * These are compact, branded snapshots sufficient for record-keeping and preview.
   */
  if (typeof window === 'undefined') return { codeOfConductHtml: null, ndaHtml: null, offerHtml: null };
  const now = new Date().toLocaleString();

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

/**
 * PUBLIC_INTERFACE
 * Quick PDF data URL verifier for debugging. Logs diagnostics to console.
 */
export function verifyPdfDataUrl(sample) {
  try {
    const val = typeof sample === 'string' ? sample : '';
    const okPrefix = val.startsWith('data:application/pdf');
    const comma = val.indexOf(',');
    const b64 = comma > -1 ? val.slice(comma + 1) : '';
    const approxBytes = Math.floor(b64.length * 0.75);
    // eslint-disable-next-line no-console
    console.log('[PDF Verify]', { okPrefix, length: val.length, base64Bytes: approxBytes, commaIndex: comma });
    return okPrefix && approxBytes > 1024;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[PDF Verify] failed:', e);
    return false;
  }
}

// PUBLIC_INTERFACE
export default function Documents() {
  /** Documents onboarding page simplified to list and action only, with PDF export to Admin Inbox (v2). */
  const [state] = useState(() => loadAckState());
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | saving | saved
  const [docStatus, setDocStatus] = useState(() => getDocumentsStatus());

  useEffect(() => {
    const onFocus = () => setDocStatus(getDocumentsStatus());
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

  const allDone =
    docStatus.codeOfConduct === 'Completed' &&
    docStatus.nda === 'Completed' &&
    docStatus.offerLetter === 'Completed';

  const canContinue = allDone;

  const handleSubmit = async () => {
    setSubmitStatus('saving');
    saveAckState(state);

    const nowIso = new Date().toISOString();

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

    let submittedBy = 'anonymous';
    try {
      const authRaw = window.localStorage.getItem('lms_auth');
      const auth = authRaw ? JSON.parse(authRaw) : null;
      submittedBy = auth?.user?.email || 'anonymous';
    } catch { /* ignore */ }

    let codeOfConductPdf = '';
    let ndaPdf = '';
    let offerLetterPdf = '';
    try {
      const { codeOfConductHtml, ndaHtml, offerHtml } = buildDocHtmlSnapshots();
      if (codeOfConductHtml) codeOfConductPdf = await renderPdfDataUrlFromHtml(codeOfConductHtml, 'Code_of_Conduct');
      if (ndaHtml) ndaPdf = await renderPdfDataUrlFromHtml(ndaHtml, 'NDA_Agreement');
      if (offerHtml) offerLetterPdf = await renderPdfDataUrlFromHtml(offerHtml, 'Offer_Letter');
    } catch { /* ignore */ }

    const inboxItem = {
      email: submittedBy || 'anonymous',
      submittedAt: new Date().toLocaleString(),
      codeOfConduct: docStatus.codeOfConduct === 'Completed',
      nda: docStatus.nda === 'Completed',
      offerLetter: docStatus.offerLetter === 'Completed',
      ...(codeOfConductPdf ? { codeOfConductPdf } : {}),
      ...(ndaPdf ? { ndaPdf } : {}),
      ...(offerLetterPdf ? { offerLetterPdf } : {}),
    };

    try {
      appendInboxItem(inboxItem);
    } catch { /* ignore */ }

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
        padding: 12,
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
          gap: 12,
          width: '100%',
          flex: 1,
        }}
      >
        <aside>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: 0,
              boxShadow: '0 3px 8px rgba(0,0,0,0.04)',
              marginBottom: 8,
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                height: 36,
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

        <section aria-label="Content" style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
        </section>
      </div>

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
          padding: '8px 0',
          marginTop: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 12px',
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
              padding: '8px 12px',
              minWidth: 128,
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
