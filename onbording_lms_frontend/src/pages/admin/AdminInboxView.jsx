import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * AdminInboxView
 * Embedded PDF viewer for admin-provided documents.
 * Route param docType controls which PDF is shown.
 *
 * Supported docType: 'code-of-conduct' | 'nda' | 'offer-letter'
 */
const AdminInboxView = () => {
  const { docType } = useParams();
  const navigate = useNavigate();

  const mapping = useMemo(() => {
    return {
      'code-of-conduct': {
        title: 'Provided: Code of Conduct',
        file: '/assets/code-of-conduct.pdf',
      },
      nda: {
        title: 'Provided: NDA',
        file: '/assets/nda.pdf',
      },
      'offer-letter': {
        title: 'Provided: Offer Letter',
        file: '/assets/offer-letter.pdf',
      },
    };
  }, []);

  const meta = mapping[docType];

  // Theme tokens (Ocean Professional)
  const theme = {
    primary: '#2563EB',
    secondary: '#F59E0B',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
    gradient: 'linear-gradient(180deg, rgba(59,130,246,0.10), #f9fafb)',
  };

  if (!meta) {
    return (
      <main
        aria-labelledby="admin-inbox-view-title"
        style={{
          background: theme.background,
          minHeight: '100%',
          padding: '1rem',
        }}
      >
        <section
          style={{
            maxWidth: 960,
            margin: '0 auto',
            background: theme.surface,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(17,24,39,0.06)',
            padding: '1rem',
          }}
        >
          <h1 id="admin-inbox-view-title" style={{ marginTop: 0 }}>
            Document not found
          </h1>
          <p role="status">The requested document type is not recognized.</p>
          <button
            type="button"
            onClick={() => navigate('/admin/inbox')}
            style={{
              background: theme.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.6rem 0.9rem',
              cursor: 'pointer',
            }}
          >
            Back to Admin Inbox
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      aria-labelledby="admin-inbox-view-title"
      style={{
        background: theme.background,
        minHeight: '100%',
        padding: '1rem',
      }}
    >
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: theme.surface,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(17,24,39,0.06)',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            padding: '1.25rem 1.25rem 0.75rem',
            background: theme.gradient,
            borderBottom: '1px solid rgba(17,24,39,0.06)',
          }}
        >
          <h1
            id="admin-inbox-view-title"
            style={{
              margin: 0,
              color: theme.text,
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {meta.title}
          </h1>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/inbox')}
              aria-label="Back to Admin Inbox"
              style={{
                background: '#fff',
                color: theme.text,
                border: '1px solid rgba(17,24,39,0.12)',
                borderRadius: 8,
                padding: '0.5rem 0.8rem',
                cursor: 'pointer',
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ← Back
            </button>
            <a
              href={meta.file}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: theme.primary,
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 8,
                padding: '0.5rem 0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              aria-label="Open in new tab"
            >
              <span aria-hidden="true">🔗</span>
              Open in new tab
            </a>
            <Link
              to={meta.file}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: theme.secondary,
                color: '#111827',
                textDecoration: 'none',
                borderRadius: 8,
                padding: '0.5rem 0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              aria-label="Download PDF"
              download
            >
              <span aria-hidden="true">⬇️</span>
              Download
            </Link>
          </div>
        </header>

        <div
          style={{
            position: 'relative',
            height: '78vh',
            minHeight: 420,
            background: '#f3f4f6',
          }}
        >
          <object
            data={meta.file}
            type="application/pdf"
            aria-label={`${meta.title} PDF viewer`}
            role="document"
            width="100%"
            height="100%"
          >
            <iframe
              title={`${meta.title} PDF iframe fallback`}
              src={meta.file}
              width="100%"
              height="100%"
              style={{ border: 0 }}
            />
            <p style={{ padding: '1rem' }}>
              Your browser cannot display the PDF. Please{' '}
              <a href={meta.file} target="_blank" rel="noopener noreferrer">
                open it in a new tab
              </a>
              .
            </p>
          </object>
        </div>
      </section>
    </main>
  );
};

export default AdminInboxView;
