import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminGate from '../../components/AdminGate.jsx';
import { getInboxItems, subscribe } from '../../utils/adminInbox';
import { isPdfDataUrl, normalizePdfInput, base64PdfToBlobUrl } from '../../utils/pdfUtils';

// Ocean Professional palette
const ocean = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  surface: '#ffffff',
  background: '#f9fafb',
  text: '#111827',
  error: '#EF4444',
};

/**
 * Utils are imported from pdfUtils: isPdfDataUrl, normalizePdfInput, base64PdfToBlobUrl
 */
function toFileName(prefix, email) {
  const safe = String(email || 'user').replace(/[^a-z0-9_-]+/gi, '_');
  return `${prefix}_${safe}.pdf`;
}

// Toolbar-ready viewer stateful component
function InlinePdfViewer({ dataUrl, title, onClose }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const iframeRef = useRef(null);
  const printFrameRef = useRef(null);

  // Prepare Blob URL (revoke on unmount/close)
  useEffect(() => {
    let current = '';
    if (!dataUrl) {
      setError('No PDF provided.');
      return () => {};
    }
    const normalized = normalizePdfInput(dataUrl);
    if (!isPdfDataUrl(normalized)) {
      setError('Invalid PDF source. Expected application/pdf base64 data URL.');
      return () => {};
    }
    try {
      const { url, error: decodeErr } = base64PdfToBlobUrl(normalized);
      if (!url) {
        const messageMap = {
          'invalid-prefix': 'Malformed PDF data (invalid prefix).',
          'missing-comma': 'Malformed PDF data (missing comma).',
          'too-small': 'PDF appears to be empty or truncated.',
          'empty-bin': 'Failed to decode PDF (empty binary).',
          'zero-size': 'Decoded PDF has zero size.',
          'exception': 'Unexpected error while preparing PDF.',
        };
        setError(messageMap[decodeErr] || 'Failed to decode PDF.');
        return () => {};
      }
      current = url;
      setBlobUrl(current);
      setError('');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('InlinePdfViewer error:', e);
      setError('Unable to prepare PDF for viewing.');
    }
    return () => {
      if (current) {
        try { URL.revokeObjectURL(current); } catch {}
      }
    };
  }, [dataUrl]);

  // Zoom handlers
  const zoomIn = () => setScale((s) => Math.min(3, Math.round((s + 0.1) * 10) / 10));
  const zoomOut = () => setScale((s) => Math.max(0.5, Math.round((s - 0.1) * 10) / 10));
  const resetZoom = () => setScale(1);

  // Rotate handler
  const rotate = () => setRotation((r) => (r + 90) % 360);

  // Print using hidden iframe with the blob URL (no popups, no window.open)
  const handlePrint = () => {
    if (!blobUrl) return;
    try {
      const frame = printFrameRef.current;
      if (!frame) return;
      frame.src = blobUrl;
      // Wait a tick for load then print
      const doPrint = () => {
        try {
          frame.contentWindow?.focus?.();
          frame.contentWindow?.print?.();
        } catch {
          // ignore
        }
      };
      setTimeout(doPrint, 300);
    } catch {
      // ignore
    }
  };

  const downloadName = (title || 'document').replace(/\s+/g, '_') + '.pdf';

  return (
    <div
      className="card"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        background: ocean.surface,
        boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: 8,
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(90deg, rgba(37,99,235,0.06), rgba(249,250,251,1))',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: ocean.text }}>
          <strong>{title || 'Document'}</strong>
          <span style={{ color: '#6b7280', fontSize: 12 }}>(Zoom {Math.round(scale * 100)}%, Rotate {rotation}°)</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={zoomOut}
            title="Zoom out"
            aria-label="Zoom out"
            style={{ background: 'transparent', color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
          >
            −
          </button>
          <button
            type="button"
            onClick={zoomIn}
            title="Zoom in"
            aria-label="Zoom in"
            style={{ background: ocean.primary, color: '#fff', border: '1px solid #1d4ed8', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
          >
            +
          </button>
          <button
            type="button"
            onClick={resetZoom}
            title="Reset zoom"
            aria-label="Reset zoom"
            style={{ background: 'transparent', color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
          >
            100%
          </button>
          <button
            type="button"
            onClick={rotate}
            title="Rotate"
            aria-label="Rotate"
            style={{ background: 'transparent', color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
          >
            ⟳
          </button>
          <a
            href={blobUrl || '#'}
            download={downloadName}
            role="button"
            title="Download"
            aria-label="Download"
            style={{ color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, textDecoration: 'none' }}
            onClick={(e) => { if (!blobUrl) e.preventDefault(); }}
          >
            Download
          </a>
          <a
            href={isPdfDataUrl(dataUrl) ? dataUrl : '#'}
            download={(title || 'document').replace(/\s+/g, '_') + '.original.pdf'}
            role="button"
            title="Download original data"
            aria-label="Download original data"
            style={{ color: ocean.secondary, border: '1px solid #fcd34d', padding: '6px 10px', borderRadius: 8, textDecoration: 'none', marginLeft: 4 }}
            onClick={(e) => { if (!isPdfDataUrl(dataUrl)) e.preventDefault(); }}
          >
            Download original
          </a>
          <button
            type="button"
            onClick={handlePrint}
            title="Print"
            aria-label="Print"
            style={{ background: 'transparent', color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
          >
            🖨 Print
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
            style={{ background: 'transparent', color: ocean.error, border: '1px solid #fecaca', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
          >
            Close
          </button>
          {/* hidden iframe for print to avoid popups */}
          <iframe ref={printFrameRef} title="print-frame" style={{ display: 'none' }} />
        </div>
      </div>

      {/* Viewer area */}
      <div
        style={{
          background: '#111827',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {error ? (
          <div
            role="alert"
            style={{
              margin: 16,
              padding: 16,
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: ocean.error,
              borderRadius: 12,
            }}
          >
            {error}
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '75vh',
              display: 'grid',
              placeItems: 'center',
              padding: 8,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 120ms ease',
              }}
            >
              <iframe
                ref={iframeRef}
                title={title || 'PDF viewer'}
                src={blobUrl || (isPdfDataUrl(dataUrl) ? dataUrl : '')}
                style={{ width: '100%', height: '100%', border: 'none', background: '#111827' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OceanTag({ ok }) {
  return (
    <span
      style={{
        background: ok ? '#ecfeff' : '#fef3c7',
        color: ok ? '#0e7490' : ocean.secondary,
        padding: '2px 8px',
        borderRadius: 999,
      }}
    >
      {ok ? 'Provided' : 'Missing'}
    </span>
  );
}

function ActionButtons({ label, dataUrl, onView }) {
  const normalized = normalizePdfInput(dataUrl);
  const disabled = !isPdfDataUrl(normalized);
  return (
    <div style={{ display: 'inline-flex', gap: 8 }}>
      <button
        type="button"
        className="btn"
        onClick={() => !disabled && onView(normalized, label)}
        disabled={disabled}
        title={disabled ? `${label} not available` : `View ${label}`}
        aria-label={`View ${label}`}
        style={{
          background: ocean.primary,
          color: '#fff',
          border: '1px solid #1d4ed8',
          padding: '6px 10px',
          borderRadius: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        View
      </button>
      <a
        href={disabled ? undefined : normalized}
        download={`${label.replace(/\s+/g, '_')}.pdf`}
        onClick={(e)=> { if (disabled) e.preventDefault(); }}
        style={{
          color: disabled ? '#9ca3af' : ocean.primary,
          border: '1px solid #c7d2fe',
          padding: '6px 10px',
          borderRadius: 8,
          textDecoration: 'none',
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        Download
      </a>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function AdminInbox() {
  /**
   * Inline Admin Inbox with embedded in-page PDF viewer and toolbar.
   * No route change on View. Keeps preview route intact but not used here.
   */
  const [items, setItems] = useState(() => getInboxItems());
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerSrc, setViewerSrc] = useState('');

  useEffect(() => {
    const unsub = subscribe((next) => setItems(next));
    setItems(getInboxItems());
    return () => unsub();
  }, []);

  const rows = useMemo(() => (Array.isArray(items) ? items.slice().reverse() : []), [items]);

  const handleView = (src, title) => {
    const normalized = normalizePdfInput(src);
    if (!isPdfDataUrl(normalized)) {
      alert('Unable to preview document. The generated PDF appears to be malformed.');
      return;
    }
    setViewerSrc(normalized);
    setViewerTitle(title || 'Document');
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    // Let InlinePdfViewer revoke URL; also clear local state shortly after close
    setTimeout(() => {
      setViewerSrc('');
      setViewerTitle('');
    }, 0);
  };

  // Verify decoding with a tiny 1-page blank PDF sample (known-good)
  const handleVerify = () => {
    // Minimal blank PDF (base64) produced by jsPDF for verification
    const sample = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHMgWyAzIDAgUiBdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveCBbMCAwIDU5NSAODQldL1Jlc291cmNlcyA8PC9Qcm9jU2V0Wy9QREZdPj4vQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggMTAgPj4Kc3RyZWFtCkJUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDUzIDAwMDAwIG4gCjAwMDAwMDAxMzAgMDAwMDAgbiAKMDAwMDAwMDA5NSAwMDAwMCBuIAowMDAwMDAwMjM3IDAwMDAwIG4gCnRyYWlsZXIKPDwvUm9vdCAxIDAgUi9TaXplIDY+PgpzdGFydHhyZWYKMjU0CiUlRU9G';
    try {
      const commaIdx = sample.indexOf(',');
      const base64Part = commaIdx > -1 ? sample.slice(commaIdx + 1) : '';
      // eslint-disable-next-line no-console
      console.log('[Verify] sample size base64 chars:', base64Part.length);
      const normalized = normalizePdfInput(sample);
      const { url, error } = base64PdfToBlobUrl(normalized);
      // eslint-disable-next-line no-console
      console.log('[Verify] blob url created?', !!url, 'error:', error);
      if (!url) {
        alert('Verification failed: cannot decode sample PDF.');
      } else {
        alert('Verification passed: sample PDF decoded.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Verify failed:', e);
      alert('Verification failed: exception occurred.');
    }
  };

  return (
    <AdminGate>
      <main style={{ padding: 24, background: ocean.background, minHeight: '100%' }}>
        <section
          className="card"
          style={{
            background: ocean.surface,
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ marginTop: 0, color: ocean.text, marginBottom: 0 }}>Inbox</h2>
            <button
              type="button"
              onClick={handleVerify}
              title="Verify PDF decoding"
              aria-label="Verify PDF decoding"
              style={{ background: 'transparent', color: ocean.secondary, border: '1px solid #fcd34d', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
            >
              Verify PDF decoder
            </button>
          </div>
          <p style={{ color: '#6b7280', marginTop: 4 }}>
            Submissions arrive here when a user clicks Continue on the Documents page.
          </p>

          {rows.length === 0 ? (
            <div
              style={{
                marginTop: 8,
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 16,
                textAlign: 'center',
              }}
            >
              No submissions yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Admin inbox table">
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Submitted</th>
                    <th style={{ padding: 8 }}>Code of Conduct</th>
                    <th style={{ padding: 8 }}>NDA</th>
                    <th style={{ padding: 8 }}>Offer Letter</th>
                    <th style={{ padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const email = r?.email || 'anonymous';
                    const cocUrl = normalizePdfInput(r?.codeOfConductPdf);
                    const ndaUrl = normalizePdfInput(r?.ndaPdf);
                    const offerUrl = normalizePdfInput(r?.offerLetterPdf);
                    return (
                      <tr key={`row-${idx}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: 8 }}>{email}</td>
                        <td style={{ padding: 8 }}>{r?.submittedAt || '—'}</td>
                        <td style={{ padding: 8 }}><OceanTag ok={!!r?.codeOfConduct} /></td>
                        <td style={{ padding: 8 }}><OceanTag ok={!!r?.nda} /></td>
                        <td style={{ padding: 8 }}><OceanTag ok={!!r?.offerLetter} /></td>
                        <td style={{ padding: 8 }}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <ActionButtons label="Code of Conduct" dataUrl={cocUrl} onView={(src)=> handleView(src, `Code of Conduct — ${email}`)} />
                            <ActionButtons label="NDA" dataUrl={ndaUrl} onView={(src)=> handleView(src, `NDA — ${email}`)} />
                            <ActionButtons label="Offer Letter" dataUrl={offerUrl} onView={(src)=> handleView(src, `Offer Letter — ${email}`)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Inline PDF viewer panel appears below the table when opened */}
        {viewerOpen && (
          <section style={{ marginTop: 16 }}>
            <InlinePdfViewer dataUrl={viewerSrc} title={viewerTitle} onClose={handleCloseViewer} />
          </section>
        )}

        <footer style={{ marginTop: 24, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
          Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
        </footer>
      </main>
    </AdminGate>
  );
}
