import React, { useEffect, useMemo, useState } from 'react';
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

function safeOpenPdf(dataUrl) {
  try {
    const win = window.open(dataUrl, '_blank', 'noopener,noreferrer');
    return !!win;
  } catch {
    return false;
  }
}

function toFileName(prefix, email) {
  const safe = String(email || 'user').replace(/[^a-z0-9_-]+/gi, '_');
  return `${prefix}_${safe}.pdf`;
}

function OceanButton({ children, disabled, onClick, ariaLabel, title }) {
  const base = {
    textDecoration: 'none',
    background: ocean.primary,
    color: '#fff',
    border: '1px solid #1d4ed8',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 150ms ease, box-shadow 150ms ease',
    boxShadow: disabled ? 'none' : '0 1px 2px rgba(37, 99, 235, 0.25)',
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

function ViewPdfButton({ label, dataUrl, fallbackFileName }) {
  const disabled = !isPdfDataUrl(dataUrl);
  const handleClick = () => {
    if (!dataUrl) return;
    // Try new-tab open first
    const opened = safeOpenPdf(dataUrl);
    if (opened) return;

    // Fallback: force download via temporary anchor if popup blocked
    try {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fallbackFileName || 'document.pdf';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // ignore
    }
  };

  return (
    <OceanButton
      disabled={disabled}
      onClick={handleClick}
      ariaLabel={`${label}${disabled ? ' (not available)' : ''}`}
      title={disabled ? `${label} not available` : `View ${label} (opens in new tab)`}
    >
      {label}
    </OceanButton>
  );
}

// PUBLIC_INTERFACE
export default function AdminInbox() {
  /** Admin Inbox listing submissions from 'admin_inbox_v2', enabling inline PDF viewing with fallback download and accessible ocean-themed buttons. */
  const [items, setItems] = useState(() => getInboxItems());

  useEffect(() => {
    const unsub = subscribe((next) => setItems(next));
    // initial sync in case another tab updated before mount
    setItems(getInboxItems());
    return () => unsub();
  }, []);

  const rows = useMemo(() => {
    // Safe mapping to avoid breaking on malformed entries
    const safe = Array.isArray(items) ? items : [];
    return safe.slice().reverse();
  }, [items]);

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
                    <th style={{ padding: 8 }}>View</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const email = r?.email || 'anonymous';
                    const cocUrl = r?.codeOfConductPdf;
                    const ndaUrl = r?.ndaPdf;
                    const offerUrl = r?.offerLetterPdf;
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
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <ViewPdfButton
                              label="Code of Conduct"
                              dataUrl={cocUrl}
                              fallbackFileName={toFileName('Code_of_Conduct', email)}
                            />
                            <ViewPdfButton
                              label="NDA"
                              dataUrl={ndaUrl}
                              fallbackFileName={toFileName('NDA', email)}
                            />
                            <ViewPdfButton
                              label="Offer Letter"
                              dataUrl={offerUrl}
                              fallbackFileName={toFileName('Offer_Letter', email)}
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
    </AdminGate>
  );
}
