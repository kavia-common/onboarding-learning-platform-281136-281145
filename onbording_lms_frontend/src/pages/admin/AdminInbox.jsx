import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * AdminInbox
 * A simple inbox-like view for Admins to access pre-provided PDFs.
 * Lists three accessible buttons that navigate to the embedded PDF viewer.
 */
const AdminInbox = () => {
  const navigate = useNavigate();

  const items = [
    {
      key: 'code-of-conduct',
      label: 'Provided: Code of Conduct',
      description: 'View the organization code of conduct PDF.',
    },
    {
      key: 'nda',
      label: 'Provided: NDA',
      description: 'View the Non-Disclosure Agreement PDF.',
    },
    {
      key: 'offer-letter',
      label: 'Provided: Offer Letter',
      description: 'View the standard offer letter PDF.',
    },
  ];

  // Theme tokens (Ocean Professional)
  const theme = {
    primary: '#2563EB',
    secondary: '#F59E0B',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
    gradient: 'linear-gradient(180deg, rgba(59,130,246,0.10), #f9fafb)',
  };

  return (
    <main
      aria-labelledby="admin-inbox-title"
      style={{
        background: theme.background,
        minHeight: '100%',
        padding: '1rem',
      }}
    >
      <section
        role="region"
        aria-label="Admin Inbox Provided Documents"
        style={{
          maxWidth: 960,
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
            id="admin-inbox-title"
            style={{
              margin: 0,
              color: theme.text,
              fontSize: '1.375rem',
              fontWeight: 700,
            }}
          >
            Admin Inbox
          </h1>
          <p
            style={{
              margin: '0.375rem 0 1rem',
              color: '#374151',
            }}
          >
            Access provided onboarding documents below.
          </p>
        </header>

        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {items.map((item) => (
            <li key={item.key}>
              <div
                style={{
                  border: '1px solid rgba(17,24,39,0.06)',
                  borderRadius: 10,
                  background: '#fff',
                  padding: '1rem',
                  height: '100%',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    color: theme.text,
                  }}
                >
                  {item.label}
                </h2>
                <p
                  style={{
                    margin: '0.5rem 0 1rem',
                    color: '#4B5563',
                    fontSize: '0.9rem',
                  }}
                >
                  {item.description}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/inbox/${item.key}`)}
                  aria-label={`${item.label} - Open`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: theme.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                    transition: 'transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#1D4ED8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 18px rgba(29,78,216,0.28)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 14px rgba(37,99,235,0.25)';
                  }}
                >
                  <span aria-hidden="true">📄</span>
                  Open
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default AdminInbox;
