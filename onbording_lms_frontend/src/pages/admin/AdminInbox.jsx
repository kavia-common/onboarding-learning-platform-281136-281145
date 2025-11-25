import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminGate from '../../components/AdminGate.jsx';
import { getInboxItems, subscribe } from '../../utils/adminInbox';

const ocean = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  surface: '#ffffff',
  background: '#f9fafb',
  text: '#111827',
  error: '#EF4444',
};

function isPdfDataUrl(maybe) {
  if (!maybe || typeof maybe !== 'string') return false;
  // Accept both with or without ;base64 and with charset; Documents.js creates data:application/pdf;base64,...
  return maybe.startsWith('data:application/pdf');
}

function ensurePdfPrefix(maybe) {
  // Some sources may store only base64; ensure correct data URL prefix.
  if (!maybe) return '';
  if (maybe.startsWith('data:application/pdf')) return maybe;
  // Heuristic: looks like base64 without prefix
  if (/^[A-Za-z0-9+/=\n\r]+$/.test(maybe.slice(0, 200))) {
    return `data:application/pdf;base64,${maybe}`;
  }
  return maybe;
}

function toFileName(prefix, email) {
  const safe = String(email || 'user').replace(/[^a-z0-9_-]+/gi, '_');
  return `${prefix}_${safe}.pdf`;
}

function OceanButton({ children, disabled, onClick, ariaLabel, title, variant = 'primary' }) {
  const stylesByVariant = {
    primary: {
      background: ocean.primary,
      color: '#fff',
      border: '1px solid #1d4ed8',
    },
    subtle: {
      background: 'transparent',
      color: ocean.primary,
      border: '1px solid #c7d2fe',
    },
    danger: {
      background: 'transparent',
      color: ocean.error,
      border: '1px solid #fecaca',
    },
  };
  const base = {
    textDecoration: 'none',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 150ms ease, box-shadow 150ms ease',
    boxShadow: disabled ? 'none' : '0 1px 2px rgba(37, 99, 235, 0.25)',
    ...stylesByVariant[variant],
  };
  return (
    <button
      type="button"
      className="btn"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      style={base}
    >
      {children}
    </button>
  );
}

function DownloadLink({ dataUrl, filename, disabled }) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Download not available"
        style={{ color: '#9ca3af', border: '1px dashed #d1d5db', padding: '6px 10px', borderRadius: 8 }}
      >
        Download
      </span>
    );
  }
  return (
    <a
      href={dataUrl}
      download={filename}
      aria-label={`Download ${filename}`}
      title={`Download ${filename}`}
      style={{ color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, textDecoration: 'none' }}
    >
      Download
    </a>
  );
}

function PdfModal({ open, onClose, src, title, initialFocusRef }) {
  // Accessible modal with focus trap and escape handling
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      } else if (e.key === 'Tab') {
        // rudimentary focus trap among focusable elements in dialog
        const node = dialogRef.current;
        if (!node) return;
        const focusable = node.querySelectorAll('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey, true);
    // focus initial element
    setTimeout(() => {
      (initialFocusRef?.current || dialogRef.current)?.focus?.();
    }, 0);
    return () => {
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'PDF preview'}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,0.5)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={(e) => {
        // close when clicking backdrop only
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        style={{
          width: 'min(100%, 980px)',
          maxWidth: '98vw',
          height: '85vh',
          background: ocean.surface,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          overflow: 'hidden',
        }}
      >
        <header style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ color: ocean.text }}>{title || 'Document'}</strong>
          <OceanButton
            variant="subtle"
            onClick={onClose}
            ariaLabel="Close preview"
            title="Close preview"
          >
            Close
          </OceanButton>
        </header>
        <div style={{ background: '#111827', display: 'grid' }}>
          {/* Using iframe for broader PDF support; fall back to <object> if needed */}
          <iframe
            title={title || 'PDF viewer'}
            src={src}
            style={{ width: '100%', height: '100%', border: 'none', background: '#111827' }}
          />
        </div>
        <footer style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <DownloadLink dataUrl={src} filename={(title || 'document').replace(/\s+/g, '_') + '.pdf'} />
          <OceanButton variant="subtle" onClick={onClose} ariaLabel="Close" title="Close">
            Done
          </OceanButton>
        </footer>
      </div>
    </div>
  );
}

function ViewPdfInlineButton({ label, dataUrl, onOpen }) {
  const disabled = !isPdfDataUrl(ensurePdfPrefix(dataUrl));
  return (
    <OceanButton
      disabled={disabled}
      onClick={() => onOpen?.(ensurePdfPrefix(dataUrl), label)}
      ariaLabel={`${label}${disabled ? ' (not available)' : ''}`}
      title={disabled ? `${label} not available` : `View ${label}`}
    >
      View
    </OceanButton>
  );
}

// PUBLIC_INTERFACE
export default function AdminInbox() {
  /**
   * Admin Inbox listing submissions from 'admin_inbox_v2', enabling inline PDF viewing in a modal
   * with download fallback. Avoids window.open to prevent ERR_BLOCKED_BY_CLIENT by extensions.
   */
  const [items, setItems] = useState(() => getInboxItems());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const closeBtnRef = useRef(null);

  useEffect(() => {
    const unsub = subscribe((next) => setItems(next));
    // initial sync in case another tab updated before mount
    setItems(getInboxItems());
    return () => unsub();
  }, []);

  const rows = useMemo(() => {
    const safe = Array.isArray(items) ? items : [];
    return safe.slice().reverse();
  }, [items]);

  const openModal = (src, title) => {
    // do not store long data URLs in React state beyond what's necessary;
    // here we only hold while modal is open
    setModalSrc(src);
    setModalTitle(title || 'Document');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // release references quickly
    setTimeout(() => {
      setModalSrc('');
      setModalTitle('');
    }, 0);
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
          <h2 style={{ marginTop: 0, color: ocean.text }}>Inbox</h2>
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
                    const cocUrl = ensurePdfPrefix(r?.codeOfConductPdf);
                    const ndaUrl = ensurePdfPrefix(r?.ndaPdf);
                    const offerUrl = ensurePdfPrefix(r?.offerLetterPdf);
                    const cocMissing = !isPdfDataUrl(cocUrl);
                    const ndaMissing = !isPdfDataUrl(ndaUrl);
                    const offerMissing = !isPdfDataUrl(offerUrl);
                    return (
                      <tr key={`row-${idx}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: 8 }}>{email}</td>
                        <td style={{ padding: 8 }}>{r?.submittedAt || '—'}</td>
                        <td style={{ padding: 8 }}>
                          <span
                            style={{
                              background: r?.codeOfConduct ? '#ecfeff' : '#fef3c7',
                              color: r?.codeOfConduct ? '#0e7490' : ocean.secondary,
                              padding: '2px 8px',
                              borderRadius: 999,
                            }}
                          >
                            {r?.codeOfConduct ? 'Provided' : 'Missing'}
                          </span>
                        </td>
                        <td style={{ padding: 8 }}>
                          <span
                            style={{
                              background: r?.nda ? '#ecfeff' : '#fef3c7',
                              color: r?.nda ? '#0e7490' : ocean.secondary,
                              padding: '2px 8px',
                              borderRadius: 999,
                            }}
                          >
                            {r?.nda ? 'Provided' : 'Missing'}
                          </span>
                        </td>
                        <td style={{ padding: 8 }}>
                          <span
                            style={{
                              background: r?.offerLetter ? '#ecfeff' : '#fef3c7',
                              color: r?.offerLetter ? '#0e7490' : ocean.secondary,
                              padding: '2px 8px',
                              borderRadius: 999,
                            }}
                          >
                            {r?.offerLetter ? 'Provided' : 'Missing'}
                          </span>
                        </td>
                        <td style={{ padding: 8 }}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <ViewPdfInlineButton
                              label="Code of Conduct"
                              dataUrl={cocUrl}
                              onOpen={(src) => openModal(src, `Code of Conduct — ${email}`)}
                            />
                            <DownloadLink
                              dataUrl={cocUrl}
                              filename={toFileName('Code_of_Conduct', email)}
                              disabled={cocMissing}
                            />

                            <ViewPdfInlineButton
                              label="NDA"
                              dataUrl={ndaUrl}
                              onOpen={(src) => openModal(src, `NDA — ${email}`)}
                            />
                            <DownloadLink
                              dataUrl={ndaUrl}
                              filename={toFileName('NDA', email)}
                              disabled={ndaMissing}
                            />

                            <ViewPdfInlineButton
                              label="Offer Letter"
                              dataUrl={offerUrl}
                              onOpen={(src) => openModal(src, `Offer Letter — ${email}`)}
                            />
                            <DownloadLink
                              dataUrl={offerUrl}
                              filename={toFileName('Offer_Letter', email)}
                              disabled={offerMissing}
                            />
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
        <footer style={{ marginTop: 24, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
          Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
        </footer>
      </main>

      <PdfModal
        open={modalOpen}
        onClose={closeModal}
        src={modalSrc}
        title={modalTitle}
        initialFocusRef={closeBtnRef}
      />
    </AdminGate>
  );
}
