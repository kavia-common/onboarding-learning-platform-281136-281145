import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';

/**
 * PUBLIC_INTERFACE
 * AdminDashboard
 * Admin-only dashboard. If not authenticated as admin, redirects to /admin/login.
 * Displays a simple local inbox (from localStorage) and current user info.
 */
export default function AdminDashboard() {
  const { user, currentUserIsAdmin } = useAuth();
  const [inbox, setInbox] = useState([]);

  // Hooks must be called unconditionally. Compute redirect flag after hooks.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('dt3_admin_inbox');
      const parsed = raw ? JSON.parse(raw) : [];
      setInbox(Array.isArray(parsed) ? parsed : []);
    } catch {
      setInbox([]);
    }
  }, []);

  const isAdmin = Boolean(user && (user.role === 'admin' || currentUserIsAdmin === true));
  const shouldRedirect = !user || !isAdmin;

  if (shouldRedirect) {
    return <Navigate to="/admin/login" replace />;
  }

  const empty = inbox.length === 0;

  return (
    <main style={{ padding: 20 }}>
      <section className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
        <h1 style={{ marginTop: 0 }}>Admin Dashboard</h1>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Welcome, {user.email}. You have admin access for this session.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn" to="/logout">Logout</Link>
          <Link className="btn" to="/">Home</Link>
        </div>
      </section>

      <section className="card" style={{ padding: 16, marginTop: 12 }}>
        <h2 style={{ marginTop: 0 }}>Inbox</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Local submissions stored under key "dt3_admin_inbox".
        </p>
        {empty ? (
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
                    const coc = entry.codeOfConduct;
                    const nda = entry.nda;
                    const offer = entry.offerLetter;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: 12 }}>{entry.submittedBy || 'Unknown'}</td>
                        <td style={{ padding: 12, color: 'var(--text-secondary)' }}>{ts}</td>
                        <td style={{ padding: 12 }}>
                          {coc ? 'Provided' : <span style={{ color: 'var(--text-secondary)' }}>No data</span>}
                        </td>
                        <td style={{ padding: 12 }}>
                          {nda ? 'Provided' : <span style={{ color: 'var(--text-secondary)' }}>No data</span>}
                        </td>
                        <td style={{ padding: 12 }}>
                          {offer ? 'Provided' : <span style={{ color: 'var(--text-secondary)' }}>No data</span>}
                        </td>
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
