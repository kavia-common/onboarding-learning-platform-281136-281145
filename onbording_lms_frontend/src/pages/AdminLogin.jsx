import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';

/**
 * PUBLIC_INTERFACE
 * AdminLogin
 * Simple admin login form that authenticates against localStorage users.
 * On success, redirects to /admin (or the intended location).
 * Demo-only: credentials are seeded locally; no external services are used.
 */
export default function AdminLogin() {
  const { login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  // if already admin, redirect from here will be handled by /admin route guard, so we keep page visible

  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');
    try {
      const result = await login(email, pwd);
      if (result === true) {
        window.location.replace(from);
        return;
      }
      setErrorText('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

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
            />
          </label>
          {errorText ? (
            <div role="alert" style={{ color: 'var(--error)' }}>
              {errorText}
            </div>
          ) : null}
          <button className="btn" type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          Tip: This is a demo-only local login. No external services are used.
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
