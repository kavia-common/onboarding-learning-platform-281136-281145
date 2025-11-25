import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminGate from '../../components/AdminGate.jsx';

// Utilities to validate/normalize and decode PDF data URLs safely
function isPdfDataUrl(maybe) {
  return typeof maybe === 'string' && maybe.startsWith('data:application/pdf');
}

function ensurePdfPrefix(maybe) {
  if (!maybe) return '';
  if (maybe.startsWith('data:application/pdf')) return maybe;
  // Heuristic: if it's plausibly base64
  if (/^[A-Za-z0-9+/=\n\r]+$/.test(String(maybe).slice(0, 200))) {
    return `data:application/pdf;base64,${maybe}`;
  }
  return maybe;
}

function base64ToUint8Array(b64) {
  try {
    const clean = b64.replace(/^data:application\/pdf(?:;charset=[^;]+)?;base64,/, '');
    const bin = atob(clean);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function makeBlobUrlFromPdfDataUrl(dataUrl) {
  try {
    const bytes = base64ToUint8Array(dataUrl);
    if (!bytes) return '';
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
}

const ocean = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  surface: '#ffffff',
  background: '#f9fafb',
  text: '#111827',
  error: '#EF4444',
};

// PUBLIC_INTERFACE
export default function AdminInboxPreview() {
  /**
   * PUBLIC_INTERFACE
   * AdminInboxPreview
   * Static in-app SPA route to render an inline PDF preview for Admin Inbox item.
   * No window.open, no target=_blank. Uses iframe with either the data URL or a Blob object URL for large payloads.
   * Shows friendly error messages for malformed input and provides a download anchor fallback.
   */
  const { id, doc } = useParams();
  const navigate = useNavigate();
  const [src, setSrc] = useState('');
  const [err, setErr] = useState('');

  // Read inbox from localStorage
  const inboxItem = useMemo(() => {
    try {
      const raw = window.localStorage.getItem('admin_inbox_v2');
      const list = raw ? JSON.parse(raw) : [];
      const idx = Number(id);
      if (Number.isInteger(idx) && list[idx]) return list[idx];
      // also attempt by matching email
      return Array.isArray(list) ? list.find((it) => String(it?.email) === id) : null;
    } catch {
      return null;
    }
  }, [id]);

  const title = useMemo(() => {
    const label = (doc || '').toLowerCase();
    const email = inboxItem?.email || 'user';
    if (label === 'coc' || label === 'code' || label === 'codeofconduct') return `Code of Conduct — ${email}`;
    if (label === 'nda') return `NDA — ${email}`;
    if (label === 'offer' || label === 'offerletter') return `Offer Letter — ${email}`;
    return `Document — ${email}`;
  }, [doc, inboxItem]);

  const dataUrl = useMemo(() => {
    if (!inboxItem) return '';
    const label = (doc || '').toLowerCase();
    let url = '';
    if (label === 'coc' || label === 'code' || label === 'codeofconduct') url = inboxItem.codeOfConductPdf || '';
    else if (label === 'nda') url = inboxItem.ndaPdf || '';
    else if (label === 'offer' || label === 'offerletter') url = inboxItem.offerLetterPdf || '';
    return ensurePdfPrefix(url || '');
  }, [doc, inboxItem]);

  const downloadName = useMemo(() => {
    const email = (inboxItem?.email || 'user').replace(/[^a-z0-9@._-]+/gi, '_');
    const label = (doc || 'document').replace(/[^a-z0-9._-]+/gi, '_');
    return `${label}_${email}.pdf`;
  }, [doc, inboxItem]);

  useEffect(() => {
    let revoker = null;
    if (!dataUrl) {
      setErr('No PDF available for this item.');
      setSrc('');
      return () => {};
    }
    if (!isPdfDataUrl(dataUrl)) {
      setErr('Malformed document data. Expected a PDF data URL.');
      setSrc('');
      return () => {};
    }
    try {
      const approxLen = dataUrl.length;
      if (approxLen > 500_000) {
        const blobUrl = makeBlobUrlFromPdfDataUrl(dataUrl);
        if (blobUrl) {
          setSrc(blobUrl);
          revoker = () => { try { URL.revokeObjectURL(blobUrl); } catch {} };
          return () => { if (revoker) revoker(); };
        }
      }
      // Even when using dataUrl, ensure previous blob (if any) is revoked on re-run
      setSrc(dataUrl);
    } catch (e) {
      setErr('Failed to prepare the PDF preview.');
      setSrc('');
    }
    return () => { if (revoker) revoker(); };
  }, [dataUrl]);

  const onBack = () => navigate('/admin/inbox', { replace: true });

  return (
    <AdminGate>
      <main style={{ padding: 24, background: ocean.background, minHeight: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: ocean.text }}>{title}</h2>
          <button
            onClick={onBack}
            style={{ background: 'transparent', color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
            aria-label="Back to Inbox"
            title="Back to Inbox"
          >
            ← Back to Inbox
          </button>
        </div>

        {!inboxItem ? (
          <div style={{ padding: 16, border: '1px solid #fecaca', background: '#fef2f2', color: ocean.error, borderRadius: 12 }}>
            Inbox item not found. It may have been removed.
          </div>
        ) : err ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: 16, border: '1px solid #fecaca', background: '#fef2f2', color: ocean.error, borderRadius: 12 }}>
              {err}
            </div>
            {/* Provide a safe download fallback if we still have dataUrl */}
            {isPdfDataUrl(dataUrl) && (
              <a
                href={dataUrl}
                download={downloadName}
                style={{ color: ocean.primary, textDecoration: 'none', border: '1px solid #c7d2fe', padding: '8px 10px', borderRadius: 8, alignSelf: 'start' }}
                aria-label={`Download ${downloadName}`}
                title={`Download ${downloadName}`}
              >
                Download PDF
              </a>
            )}
          </div>
        ) : (
          <section style={{ display: 'grid', gap: 12 }}>
            <div style={{ background: ocean.surface, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
              {/* Inline iframe render; src is either the original data URL or a Blob object URL.
                  No sandbox attribute is set to avoid blocking inline PDF display under typical CSP.
                  We do not call window.open and we do not set target attributes. */}
              <iframe
                title="PDF preview"
                src={src}
                style={{ width: '100%', height: '80vh', border: 'none', background: '#111827', borderRadius: 8 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Download fallback; use original data URL when available, else use src (blob) */}
              <a
                href={isPdfDataUrl(dataUrl) ? dataUrl : src}
                download={downloadName}
                style={{ color: ocean.primary, textDecoration: 'none', border: '1px solid #c7d2fe', padding: '8px 10px', borderRadius: 8 }}
                aria-label={`Download ${downloadName}`}
                title={`Download ${downloadName}`}
              >
                Download
              </a>
              <button
                onClick={onBack}
                style={{ background: 'transparent', color: ocean.primary, border: '1px solid #c7d2fe', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}
                aria-label="Back"
                title="Back"
              >
                Back
              </button>
            </div>
          </section>
        )}
      </main>
    </AdminGate>
  );
}
