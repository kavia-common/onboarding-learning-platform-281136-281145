import React, { useState } from 'react';
import { useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

/**
 * PUBLIC_INTERFACE
 * AdminLogin
 * Simple admin login form that authenticates against localStorage users.
 * On success, navigates to /admin (or the intended location) using react-router v6 navigation.
 * Demo-only: credentials are seeded locally; no external services are used.
 */
export default function AdminLogin() {
  const { login, loading, setCurrentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('abburi@kavia.com');
  const [pwd, setPwd] = useState('Pallavi@123');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [redirect, setRedirect] = useState(false); // fallback flag for <Navigate />

  // Respect intended redirect path if present
  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e) => {
    e.preventDefault(); // ensure no full page reload
    if (loading || submitting) {
      console.warn('[AdminLogin] Prevented submit while loading/submitting');
      return; // prevent submit before seed/restore completed
    }
    setSubmitting(true);
    setErrorText('');
    try {
      const inEmail = String(email || '').trim().toLowerCase();
      const inPwd = String(pwd || '');

      // DEMO-ONLY bypass: direct admin session without relying on seeded users.
      // Do NOT use in production. This is for local demos/tests only.
      const DEMO_ADMIN_EMAIL = 'abburi@kavia.com';
      const DEMO_ADMIN_PASSWORD = 'Pallavi@123';

      if (inEmail === DEMO_ADMIN_EMAIL && inPwd === DEMO_ADMIN_PASSWORD) {
        console.warn('[AdminLogin] DEMO-ONLY admin bypass in effect. Setting admin session directly.');
        const demoAdmin = {
          id: 'seed-admin',
          name: 'Admin',
          email: DEMO_ADMIN_EMAIL,
          role: 'admin',
          status: 'active',
        };
        // Persist using the same key/shape as auth store
        setCurrentUser(demoAdmin);
        try {
          navigate('/admin', { replace: true });
        } catch (navErr) {
          console.warn('[AdminLogin] navigate() threw, falling back to <Navigate />:', navErr);
          setRedirect(true);
        }
        return;
      }

      // Fallback to normal local login for other users
      const result = await login(inEmail, inPwd);
      console.debug('[AdminLogin] login result:', result);
      if (result === true) {
        // Log right before navigate for tracing
        console.log('[AdminLogin] Successful login. Navigating to', from);
        try {
          navigate(from, { replace: true });
        } catch (navErr) {
          console.warn('[AdminLogin] navigate() threw, falling back to <Navigate />:', navErr);
          setRedirect(true);
        }
        return;
      }
      // Handle structured error or generic failure
      const message =
        (result && result.ok === false && result.message) ? result.message : 'Invalid email or password.';
      console.error('[AdminLogin] Login failed:', message);
      setErrorText(message);
    } catch (err) {
      const msg = (err && err.message) || 'Unexpected error during login.';
      console.error('[AdminLogin] Exception:', err);
      setErrorText(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Fallback rendering if router context was incorrect and navigate() didn't take effect
  if (redirect) {
    return <Navigate to={from} replace />;
  }

  return (
    <main style={{ padding: 20 }}>
      <section
        className="card"
        style={{
          maxWidth: 480,
          margin: '24px auto',
          padding: 20,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 12,
        }}
      >
        <h1 style={{ marginTop: 0 }}>Admin Login</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Use your admin account to access the dashboard.
        </p>

        {loading ? (
          <div role="status" aria-live="polite" style={{ marginBottom: 12 }}>
            Initializing authentication…
          </div>
        ) : null}

        <form onSubmit={handleLogin} noValidate style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
              aria-required="true"
              disabled={loading || submitting}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Password</span>
            <input
              type="password"
              value={pwd}
              onChange={(e)=>setPwd(e.target.value)}
              placeholder="Enter your password"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
              aria-required="true"
              disabled={loading || submitting}
            />
          </label>
          {errorText ? (
            <div role="alert" style={{ color: 'var(--error)' }}>
              {errorText}
            </div>
          ) : null}
          <button className="btn" type="submit" disabled={loading || submitting} aria-busy={submitting || loading}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          Tip: This is a demo-only local login. Admin access: abburi@kavia.com / Pallavi@123. No external services are used.
        </div>

        <div style={{ marginTop: 12 }}>
          <Link to="/" className="btn" style={{ textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </section>
      <footer style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
}
