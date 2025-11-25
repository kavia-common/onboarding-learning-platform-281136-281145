import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';
import Documents from './routes/Documents';
import { useAuth } from './store/authStore';
import { FeatureFlagsProvider } from './store/featureFlags';
import { ToastProvider, useToast } from './components/ui/Toast';
import { AuthProvider } from './store/authStore';
import { CoursesProvider } from './store/courseStore';
import { ProgressProvider } from './store/progressStore';
import CodeOfConduct from './pages/CodeOfConduct.jsx';
import NDAAgreement from './pages/NDAAgreement.jsx';
import OfferLetter from './pages/OfferLetter.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import Profile from './pages/Profile.jsx';

const PREVIEW_ONLY = String(process.env.REACT_APP_PREVIEW_DOCUMENTS_ONLY || '').toLowerCase() === 'true';

function Sidebar() {
  if (PREVIEW_ONLY) return null;
  return (
    <aside
      aria-label="Sidebar"
      className="card"
      style={{ padding: 16, position: 'sticky', top: 64, alignSelf: 'start' }}
    >
      <h3 style={{ marginTop: 0 }}>Quick Links</h3>
      <ul style={{ lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
        {/* No direct document links in sidebar */}
      </ul>
    </aside>
  );
}

function Footer() {
  return (
    <footer style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, padding: 16 }}>
      Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
    </footer>
  );
}

function Home() {
  if (PREVIEW_ONLY) {
    return <Navigate to="/documents" replace />;
  }
  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <Sidebar />
        <section className="card" aria-label="Welcome" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>Welcome to the Onboarding LMS</h1>
          <p>
            Use the Documents section to review and electronically sign required policies.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Link className="btn" to="/documents" aria-label="Open Documents onboarding" style={{ textDecoration: 'none' }}>
              Go to Documents
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

// Auth pages
function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/documents';
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  if (PREVIEW_ONLY) return <Navigate to="/documents" replace />;

  const handleLogin = async () => {
    setSubmitting(true);
    setErrorText('');
    try {
      const result = await login(email, pwd);
      if (result === true) {
        push({ type: 'success', message: 'Logged in' });
        window.location.replace(from);
      } else if (result && result.ok === false && result.message) {
        // Supabase-style error surfaced
        setErrorText(result.message);
        push({ type: 'error', message: result.message });
      } else {
        setErrorText('Invalid credentials');
        push({ type: 'error', message: 'Invalid credentials' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <section className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Login</h1>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <span>Password</span>
          <input
            type="password"
            value={pwd}
            onChange={(e)=>setPwd(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
          />
        </label>
        {errorText ? (
          <div role="alert" style={{ color: 'var(--error)', marginBottom: 8 }}>{errorText}</div>
        ) : null}
        <button
          className="btn"
          onClick={handleLogin}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </section>
    </main>
  );
}

function Register() {
  const { register } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  if (PREVIEW_ONLY) return <Navigate to="/documents" replace />;

  const validate = () => {
    const trimmedEmail = String(email || '').trim();
    const trimmedPwd = String(pwd || '').trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      const msg = 'Please enter a valid email address.';
      setErrorText(msg);
      push({ type: 'error', message: msg });
      return false;
    }
    if (trimmedPwd.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setErrorText(msg);
      push({ type: 'error', message: msg });
      return false;
    }
    setErrorText('');
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrorText('');
    try {
      const result = await register(email.trim(), pwd.trim());
      if (result === true) {
        push({ type: 'success', message: 'Registration successful' });
        window.location.replace('/documents');
      } else if (result && result.errorCode === 409) {
        const msg = 'Email already registered. Try logging in.';
        setErrorText(msg);
        push({ type: 'error', message: msg });
      } else if (result && result.message) {
        setErrorText(result.message);
        push({ type: 'error', message: result.message });
      } else {
        const msg = 'Registration failed. Please try again.';
        setErrorText(msg);
        push({ type: 'error', message: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <section className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Register</h1>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
            aria-invalid={!email || !email.includes('@')}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <span>Password</span>
          <input
            type="password"
            value={pwd}
            onChange={(e)=>setPwd(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
            aria-invalid={pwd.length > 0 && pwd.length < 6}
          />
        </label>
        {errorText ? (
          <div role="alert" style={{ color: 'var(--error)', marginBottom: 8 }}>{errorText}</div>
        ) : null}
        <button
          className="btn"
          onClick={handleRegister}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Creating...' : 'Create account'}
        </button>
      </section>
    </main>
  );
}

function Logout() {
  const { logout } = useAuth();

  // Always call hooks, then handle side-effects/redirects
  useEffect(() => {
    if (PREVIEW_ONLY) {
      // In preview mode, send to /documents
      window.location.replace('/documents');
      return;
    }
    logout();
    window.location.replace('/');
  }, [logout]);

  return <main style={{ padding: 20 }} aria-live="polite">Logging out…</main>;
}

/* Catalog, Course, and Dashboard components removed */

// Onboarding wizard integrating Documents step
function OnboardingWizard() {
  const [step, setStep] = useState(0);
  if (PREVIEW_ONLY) return <Navigate to="/documents" replace />;
  const steps = [
    { key: 'welcome', title: 'Welcome', content: (
      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Welcome to your onboarding</h2>
        <p>Please go through the steps to complete your onboarding process.</p>
      </div>
    )},
    { key: 'documents', title: 'Documents', content: <Documents /> },
    { key: 'next', title: 'Next Steps', content: (
      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Next Steps</h2>
        <p>Complete all required onboarding documents.</p>
      </div>
    )},
  ];
  const canPrev = step > 0;
  const canNext = step < steps.length - 1;
  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Onboarding</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {steps.map((s, i)=>(
          <button
            key={s.key}
            className="btn"
            aria-pressed={i === step}
            onClick={()=> setStep(i)}
            style={{ background: i===step ? 'var(--primary)' : 'transparent', color: i===step ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <section aria-live="polite" style={{ display: 'grid', gap: 12 }}>
        {steps[step].content}
      </section>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <button className="btn" disabled={!canPrev} onClick={()=> setStep(s => Math.max(0, s-1))}>Back</button>
        <button className="btn" disabled={!canNext} onClick={()=> setStep(s => Math.min(steps.length-1, s+1))}>Next</button>
      </div>
      <Footer />
    </main>
  );
}

function AdminRouteGuard({ children }) {
  // PUBLIC_INTERFACE
  /** Guard that allows only admin users */
  const { user, currentUserIsAdmin } = useAuth();
  if (!user || (user.role !== 'admin' && currentUserIsAdmin !== true)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// PUBLIC_INTERFACE
function AdminPage() {
  /** Admin page including Role Management and inbox view */
  const { user, updateCurrentUserRole, getCurrentUserRole } = useAuth();
  const { push } = useToast();
  const [inbox, setInbox] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState(user?.role || 'user');

  useEffect(() => {
    // Load inbox
    try {
      const raw = window.localStorage.getItem('dt3_admin_inbox');
      const parsed = raw ? JSON.parse(raw) : [];
      setInbox(Array.isArray(parsed) ? parsed : []);
    } catch {
      setInbox([]);
    }
  }, []);

  useEffect(() => {
    // Refresh role from Supabase metadata (if available)
    let alive = true;
    (async () => {
      try {
        const r = await getCurrentUserRole();
        if (alive) setCurrentRole(r);
      } catch {
        // ignore
      }
    })();
    return () => { alive = false; };
  }, [getCurrentUserRole]);

  const onChangeRole = async (e) => {
    const newRole = e.target.value === 'admin' ? 'admin' : 'user';
    setRoleLoading(true);
    try {
      const res = await updateCurrentUserRole(newRole);
      if (res?.ok) {
        setCurrentRole(newRole);
        push({ type: 'success', message: `Role updated to ${newRole}` });
      } else {
        push({ type: 'error', message: res?.message || 'Failed to update role' });
      }
    } finally {
      setRoleLoading(false);
    }
  };

  const empty = inbox.length === 0;

  return (
    <main style={{ padding: 20, display: 'grid', gap: 12 }}>
      <section className="card" aria-label="Role Management" style={{ padding: 16, display: 'grid', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Admin</h1>
        <div style={{ color: 'var(--text-secondary)' }}>
          Manage your role via Supabase user metadata. In frontend-only mode, this updates the local session.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Signed in as</div>
            <div style={{ fontWeight: 600 }}>{user?.email}</div>
          </div>
          <div aria-hidden="true" style={{ height: 24, width: 1, background: 'var(--border-color)' }} />
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Current role</span>
            <select
              value={currentRole}
              onChange={onChangeRole}
              disabled={roleLoading}
              aria-label="Select role for current user"
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                minWidth: 160,
              }}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
        </div>
        <div role="note" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Admin-only access to this page is enforced by route guard (app_role === 'admin').
        </div>
      </section>

      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Admin Inbox</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Showing latest submissions from employees. Data is stored locally in your browser under key "dt3_admin_inbox".
        </p>
      </div>

      {empty ? (
        <div className="card" role="status" style={{ padding: 16 }}>
          No submissions yet.
        </div>
      ) : (
        <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                        <DocPreview doc={coc} title="Code of Conduct" />
                      </td>
                      <td style={{ padding: 12 }}>
                        <DocPreview doc={nda} title="NDA" />
                      </td>
                      <td style={{ padding: 12 }}>
                        <DocPreview doc={offer} title="Offer Letter" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

// Helper to present a doc block with signature info and optional image
function DocPreview({ doc, title }) {
  if (!doc) return <span style={{ color: 'var(--text-secondary)' }}>No data</span>;
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {doc.signatureName && <div>Signed by: {doc.signatureName}</div>}
      {doc.acceptedAt && <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Accepted: {new Date(doc.acceptedAt).toLocaleString()}</div>}
      {/* Signature images if present */}
      {doc.signatureImage && (
        <img
          src={doc.signatureImage}
          alt={`${title} signature`}
          style={{ maxHeight: 70, border: '1px solid var(--border-color)', borderRadius: 8, padding: 2, background: 'var(--bg-secondary)' }}
        />
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** App entry with Router and providers */
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Banner for preview-only mode
  // helper: detect mock flag without importing store internals
  const isMockEnabled = (() => {
    try {
      const raw = process.env.REACT_APP_FEATURE_FLAGS || '';
      if (!raw) return false;
      const t = raw.trim();
      if (t.startsWith('{') || t.startsWith('[')) {
        const data = JSON.parse(t);
        if (Array.isArray(data)) return data.includes('mockApi');
        return Boolean(data.mockApi);
      }
      return raw.split(',').map(s => s.trim()).includes('mockApi');
    } catch {
      return false;
    }
  })();

  const previewBanner = PREVIEW_ONLY ? (
    <div
      role="note"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 52,
        zIndex: 11,
        margin: '8px 16px',
        background: '#EFF6FF',
        color: '#1E3A8A',
        border: '1px solid #93C5FD',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13
      }}
    >
      Preview mode: Documents only
    </div>
  ) : null;

  const mockBanner = isMockEnabled ? (
    <div
      role="note"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: PREVIEW_ONLY ? 92 : 52,
        zIndex: 11,
        margin: '8px 16px',
        background: '#FFFBEB',
        color: '#92400E',
        border: '1px solid #F59E0B',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13
      }}
    >
      Mock API mode is active: login and registration are simulated.
    </div>
  ) : null;

  return (
    <FeatureFlagsProvider>
      <ToastProvider>
        <AuthProvider>
          <CoursesProvider>
            <ProgressProvider>
              <div className="App" style={{ textAlign: 'initial' }}>
                <Router>
                  <Navbar />
                  {previewBanner}
                  {mockBanner}
                  <button
                    className="theme-toggle"
                    onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                  <Routes>
                    <Route path="/" element={PREVIEW_ONLY ? <Navigate to="/documents" replace /> : <Dashboard />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/code-of-conduct" element={<CodeOfConduct />} />
                    <Route path="/nda" element={<NDAAgreement />} />
                    <Route path="/offer-letter" element={<OfferLetter />} />
                    <Route
                      path="/admin"
                      element={
                        <AdminRouteGuard>
                          <AdminPage />
                        </AdminRouteGuard>
                      }
                    />
                    <Route path="/onboarding" element={PREVIEW_ONLY ? <Navigate to="/documents" replace /> : <OnboardingWizard />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:courseId" element={<CourseDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={PREVIEW_ONLY ? <Navigate to="/documents" replace /> : <Login />} />
                    <Route path="/register" element={PREVIEW_ONLY ? <Navigate to="/documents" replace /> : <Register />} />
                    <Route path="/logout" element={PREVIEW_ONLY ? <Navigate to="/documents" replace /> : <Logout />} />
                    <Route path="*" element={<Navigate to={PREVIEW_ONLY ? '/documents' : '/'} replace />} />
                  </Routes>
                </Router>
              </div>
            </ProgressProvider>
          </CoursesProvider>
        </AuthProvider>
      </ToastProvider>
    </FeatureFlagsProvider>
  );
}

export default App;
