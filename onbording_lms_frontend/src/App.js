import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Documents from './routes/Documents';
import { useAuth } from './store/authStore';
import { FeatureFlagsProvider, useFeatureFlags } from './store/featureFlags';
import { ToastProvider, useToast } from './components/ui/Toast';
import ProtectedRoute from './components/routing/ProtectedRoute';
import { AuthProvider } from './store/authStore';
import { CoursesProvider, useCourses } from './store/courseStore';
import { ProgressProvider, useProgress } from './store/progressStore';
// Ensure CodeOfConduct is imported from the pages directory for the /code-of-conduct route
import CodeOfConduct from './pages/CodeOfConduct.jsx';
import NDAAgreement from './pages/NDAAgreement.jsx';
import OfferLetter from './pages/OfferLetter.jsx';

// Read preview flag once at module scope to avoid re-renders
const PREVIEW_ONLY = String(process.env.REACT_APP_PREVIEW_DOCUMENTS_ONLY || '').toLowerCase() === 'true';

// Layout components
function NavBar() {
  const { user } = useAuth();
  const { flags } = useFeatureFlags();

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to={PREVIEW_ONLY ? '/documents' : '/'} style={{ fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none' }}>
          Onboarding LMS
        </Link>
        {/* Catalog removed */}
        <Link className="btn" to="/documents" aria-label="Go to documents" style={{ textDecoration: 'none' }}>
          Documents
        </Link>
        <Link className="btn" to="/code-of-conduct" aria-label="Go to code of conduct" style={{ textDecoration: 'none' }}>
          Code of Conduct
        </Link>
        <Link className="btn" to="/nda" aria-label="Go to NDA" style={{ textDecoration: 'none' }}>
          NDA
        </Link>
        <Link className="btn" to="/offer-letter" aria-label="Go to Offer Letter" style={{ textDecoration: 'none' }}>
          Offer Letter
        </Link>
        {!PREVIEW_ONLY && flags.onboarding && (
          <Link className="btn" to="/onboarding" aria-label="Go to onboarding" style={{ textDecoration: 'none' }}>
            Onboarding
          </Link>
        )}
        {/* Dashboard removed */}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!PREVIEW_ONLY && user ? (
          <>
            <span aria-live="polite" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {user.email}
            </span>
            <Link className="btn" to="/logout" aria-label="Logout" style={{ textDecoration: 'none' }}>
              Logout
            </Link>
          </>
        ) : (
          !PREVIEW_ONLY && (
            <>
              <Link className="btn" to="/login" aria-label="Login" style={{ textDecoration: 'none' }}>
                Login
              </Link>
              <Link className="btn" to="/register" aria-label="Register" style={{ textDecoration: 'none' }}>
                Register
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}

function Sidebar() {
  if (PREVIEW_ONLY) return null;
  return (
    <aside
      role="complementary"
      aria-label="Sidebar"
      className="card"
      style={{ padding: 16, position: 'sticky', top: 64, alignSelf: 'start' }}
    >
      <h3 style={{ marginTop: 0 }}>Quick Links</h3>
      <ul style={{ lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
        <li><Link to="/documents">Onboarding Docs</Link></li>
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
  // Hooks must always be called
  const { login } = useAuth();
  const { push } = useToast();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/documents';
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  // Perform redirect afterwards if preview mode
  if (PREVIEW_ONLY) return <Navigate to="/documents" replace />;

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
        <button
          className="btn"
          onClick={async ()=>{
            const ok = await login(email, pwd);
            if (ok) {
              push({ type:'success', message:'Logged in' });
              window.location.replace(from);
            } else {
              push({ type:'error', message:'Invalid credentials' });
            }
          }}
        >
          Sign in
        </button>
      </section>
    </main>
  );
}

function Register() {
  // Hooks first
  const { register } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (PREVIEW_ONLY) return <Navigate to="/documents" replace />;

  const validate = () => {
    const trimmedEmail = String(email || '').trim();
    const trimmedPwd = String(pwd || '').trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      push({ type: 'error', message: 'Please enter a valid email address.' });
      return false;
    }
    if (trimmedPwd.length < 6) {
      push({ type: 'error', message: 'Password must be at least 6 characters.' });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await register(email.trim(), pwd.trim());
      if (result === true) {
        push({ type: 'success', message: 'Registration successful' });
        window.location.replace('/documents');
      } else if (result && result.errorCode === 409) {
        push({ type: 'error', message: 'Email already registered. Try logging in.' });
      } else if (result && result.message) {
        push({ type: 'error', message: result.message });
      } else {
        push({ type: 'error', message: 'Registration failed. Please try again.' });
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
                  <NavBar />
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
                    {/* Default route changes under preview: redirect / to /documents */}
                    <Route path="/" element={PREVIEW_ONLY ? <Navigate to="/documents" replace /> : <Home />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/code-of-conduct" element={<CodeOfConduct />} />
                    <Route path="/nda" element={<NDAAgreement />} />
                    <Route path="/offer-letter" element={<OfferLetter />} />

                    {/* Other routes are either enabled or redirected to /documents in preview mode */}
                    <Route path="/onboarding" element={PREVIEW_ONLY ? <Navigate to="/documents" replace /> : <OnboardingWizard />} />
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
