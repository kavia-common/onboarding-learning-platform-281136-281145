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

function DownloadButton({ label, dataUrl, fileName }) {
  if (!dataUrl) return <span style={{ color: '#6b7280' }}>—</span>;
  return (
    <a
      href={dataUrl}
      download={fileName}
      className="btn"
      style={{
        textDecoration: 'none',
        background: ocean.primary,
        color: '#fff',
        border: '1px solid #1d4ed8',
        padding: '6px 10px',
        borderRadius: 8,
      }}
    >
      {label}
    </a>
  );
}

// PUBLIC_INTERFACE
export default function AdminInbox() {
  /** Admin Inbox listing submissions stored under admin_inbox_v2, with download links for attached PDFs. */
  const [items, setItems] = useState(() => getInboxItems());

  useEffect(() => {
    const unsub = subscribe((next) => setItems(next));
    // initial sync if changed from another tab before mount
    setItems(getInboxItems());
    return () => unsub();
  }, []);

  const rows = useMemo(() => {
    return (items || []).slice().reverse(); // newest first
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
                    <th style={{ padding: 8 }}>Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={`row-${idx}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 8 }}>{r.email || 'anonymous'}</td>
                      <td style={{ padding: 8 }}>{r.submittedAt || '—'}</td>
                      <td style={{ padding: 8 }}>
                        <span
                          style={{
                            background: r.codeOfConduct ? '#ecfeff' : '#fef3c7',
                            color: r.codeOfConduct ? '#0e7490' : ocean.secondary,
                            padding: '2px 8px',
                            borderRadius: 999,
                          }}
                        >
                          {r.codeOfConduct ? 'Provided' : 'Missing'}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <span
                          style={{
                            background: r.nda ? '#ecfeff' : '#fef3c7',
                            color: r.nda ? '#0e7490' : ocean.secondary,
                            padding: '2px 8px',
                            borderRadius: 999,
                          }}
                        >
                          {r.nda ? 'Provided' : 'Missing'}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <span
                          style={{
                            background: r.offerLetter ? '#ecfeff' : '#fef3c7',
                            color: r.offerLetter ? '#0e7490' : ocean.secondary,
                            padding: '2px 8px',
                            borderRadius: 999,
                          }}
                        >
                          {r.offerLetter ? 'Provided' : 'Missing'}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <DownloadButton
                            label="Code of Conduct"
                            dataUrl={r.codeOfConductPdf}
                            fileName={`Code_of_Conduct_${(r.email || 'user').replace(/[^a-z0-9_-]+/gi, '_')}.pdf`}
                          />
                          <DownloadButton
                            label="NDA"
                            dataUrl={r.ndaPdf}
                            fileName={`NDA_${(r.email || 'user').replace(/[^a-z0-9_-]+/gi, '_')}.pdf`}
                          />
                          <DownloadButton
                            label="Offer Letter"
                            dataUrl={r.offerLetterPdf}
                            fileName={`Offer_Letter_${(r.email || 'user').replace(/[^a-z0-9_-]+/gi, '_')}.pdf`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
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
