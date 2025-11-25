import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

/**
 * PUBLIC_INTERFACE
 * AdminDashboard
 * Admin-only dashboard. If not authenticated as admin, redirects to /admin/login.
 * Displays navigation cards to Users, Documents, and Settings.
 */
export default function AdminDashboard() {
  const { user, currentUserIsAdmin, loading } = useAuth();
  const [inbox, setInbox] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('dt3_admin_inbox');
      const parsed = raw ? JSON.parse(raw) : [];
      setInbox(Array.isArray(parsed) ? parsed : []);
    } catch {
      setInbox([]);
    }
  }, []);

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading authentication…</div>;
  }

  const isAdmin = Boolean(user && (user.role === 'admin' || currentUserIsAdmin === true));
  const shouldRedirect = !user || !isAdmin;

  if (shouldRedirect) {
    return <Navigate to="/admin/login" replace />;
  }

  const ocean = {
    primary: '#2563EB',
    secondary: '#F59E0B',
    surface: '#ffffff',
    background: '#f9fafb',
    text: '#111827',
  };

  return (
    <main style={{ padding: 20, background: ocean.background, minHeight: '100%' }}>
      <style>{`
        .card:focus-visible {
          outline: 2px solid #2563EB;
          outline-offset: 2px;
        }
        .card:hover {
          box-shadow: 0 6px 14px rgba(37,99,235,0.08), 0 2px 4px rgba(0,0,0,0.04);
          border-color: #c7d2fe;
          transform: translateY(-1px);
        }
      `}</style>
      <section className="card" style={{ padding: 16, display: 'grid', gap: 8, background: ocean.surface, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h1 style={{ marginTop: 0, color: ocean.text }}>Admin Dashboard</h1>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          Welcome, {user?.email}. Use the admin tools below.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn" to="/logout">Logout</Link>
          <Link className="btn" to="/">Home</Link>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {/* Users Card as a semantic button */}
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            aria-label="Go to Admin Users"
            className="card"
            style={{
              textAlign: 'left',
              background: ocean.surface,
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/admin/users');
              }
            }}
          >
            <h3 style={{ margin: 0, color: ocean.text }}>Users</h3>
            <p style={{ color: '#6b7280', marginTop: 6 }}>Create, edit, and remove application users.</p>
            <span
              role="img"
              aria-label="Go to Users"
              style={{
                display: 'inline-block',
                marginTop: 8,
                background: ocean.primary,
                color: '#fff',
                border: '1px solid #1d4ed8',
                padding: '8px 12px',
                borderRadius: 10
              }}
            >
              Go to Users →
            </span>
          </button>

          {/* Documents Card as a semantic button */}
          <button
            type="button"
            onClick={() => navigate('/admin/documents')}
            aria-label="Go to Admin Documents"
            className="card"
            style={{
              textAlign: 'left',
              background: ocean.surface,
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/admin/documents');
              }
            }}
          >
            <h3 style={{ margin: 0, color: ocean.text }}>Documents</h3>
            <p style={{ color: '#6b7280', marginTop: 6 }}>Manage document metadata and links.</p>
            <span
              role="img"
              aria-label="Go to Documents"
              style={{
                display: 'inline-block',
                marginTop: 8,
                background: ocean.primary,
                color: '#fff',
                border: '1px solid #1d4ed8',
                padding: '8px 12px',
                borderRadius: 10
              }}
            >
              Go to Documents →
            </span>
          </button>

          {/* Settings Card as a semantic button */}
          <button
            type="button"
            onClick={() => navigate('/admin/settings')}
            aria-label="Go to Admin Settings"
            className="card"
            style={{
              textAlign: 'left',
              background: ocean.surface,
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/admin/settings');
              }
            }}
          >
            <h3 style={{ margin: 0, color: ocean.text }}>Settings</h3>
            <p style={{ color: '#6b7280', marginTop: 6 }}>Configure site title, theme, and feature flags.</p>
            <span
              role="img"
              aria-label="Go to Settings"
              style={{
                display: 'inline-block',
                marginTop: 8,
                background: ocean.secondary,
                color: '#111827',
                border: '1px solid #d97706',
                padding: '8px 12px',
                borderRadius: 10
              }}
            >
              Go to Settings →
            </span>
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: 16, marginTop: 16, background: ocean.surface, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0, color: ocean.text }}>Inbox</h2>
        <p style={{ color: '#6b7280', marginTop: 0 }}>
          Local submissions stored under key "dt3_admin_inbox".
        </p>
        {inbox.length === 0 ? (
          <div className="card" role="status" style={{ padding: 12 }}>
            No submissions yet.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(249,250,251,0.6))' }}>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Submitted By</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Submitted At</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Code of Conduct</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>NDA</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Offer Letter</th>
                  </tr>
                </thead>
                <tbody>
                  {inbox.map((entry, idx) => {
                    const ts = entry.submittedAt ? new Date(entry.submittedAt).toLocaleString() : '—';
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: 12 }}>{entry.submittedBy || 'Unknown'}</td>
                        <td style={{ padding: 12, color: 'var(--text-secondary)' }}>{ts}</td>
                        <td style={{ padding: 12 }}>{entry.codeOfConduct ? 'Provided' : <span style={{ color: 'var(--text-secondary)' }}>No data</span>}</td>
                        <td style={{ padding: 12 }}>{entry.nda ? 'Provided' : <span style={{ color: 'var(--text-secondary)' }}>No data</span>}</td>
                        <td style={{ padding: 12 }}>{entry.offerLetter ? 'Provided' : <span style={{ color: 'var(--text-secondary)' }}>No data</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <footer style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
}
