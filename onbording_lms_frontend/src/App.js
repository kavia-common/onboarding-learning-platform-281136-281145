import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';
import Documents from './routes/Documents';
import { useAuth } from './store/authStore';
import { FeatureFlagsProvider, useFeatureFlags } from './store/featureFlags';
import { ToastProvider, useToast } from './components/ui/Toast';
import ProtectedRoute from './components/routing/ProtectedRoute';
import { AuthProvider } from './store/authStore';
import { CoursesProvider, useCourses } from './store/courseStore';
import { ProgressProvider, useProgress } from './store/progressStore';

// Layout components
function NavBar() {
  const { user, logout } = useAuth();
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
        <Link to="/" style={{ fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none' }}>
          Onboarding LMS
        </Link>
        <Link className="btn" to="/catalog" aria-label="Go to catalog" style={{ textDecoration: 'none' }}>
          Catalog
        </Link>
        <Link className="btn" to="/documents" aria-label="Go to documents" style={{ textDecoration: 'none' }}>
          Documents
        </Link>
        {flags.onboarding && (
          <Link className="btn" to="/onboarding" aria-label="Go to onboarding" style={{ textDecoration: 'none' }}>
            Onboarding
          </Link>
        )}
        {user && (
          <Link className="btn" to="/dashboard" aria-label="Go to dashboard" style={{ textDecoration: 'none' }}>
            Dashboard
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {user ? (
          <>
            <span aria-live="polite" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {user.email}
            </span>
            <Link className="btn" to="/logout" aria-label="Logout" style={{ textDecoration: 'none' }}>
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link className="btn" to="/login" aria-label="Login" style={{ textDecoration: 'none' }}>
              Login
            </Link>
            <Link className="btn" to="/register" aria-label="Register" style={{ textDecoration: 'none' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Sidebar() {
  return (
    <aside
      role="complementary"
      aria-label="Sidebar"
      className="card"
      style={{ padding: 16, position: 'sticky', top: 64, alignSelf: 'start' }}
    >
      <h3 style={{ marginTop: 0 }}>Quick Links</h3>
      <ul style={{ lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
        <li><Link to="/catalog">Course Catalog</Link></li>
        <li><Link to="/documents">Onboarding Docs</Link></li>
        <li><Link to="/dashboard">My Dashboard</Link></li>
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
  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <Sidebar />
        <section className="card" aria-label="Welcome" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>Welcome to the Onboarding LMS</h1>
          <p>
            Use the Documents section to review and electronically sign required policies. Explore the Catalog to
            find courses, or head to your Dashboard to track progress.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Link className="btn" to="/documents" aria-label="Open Documents onboarding" style={{ textDecoration: 'none' }}>
              Go to Documents
            </Link>
            <Link className="btn" to="/catalog" aria-label="Open Catalog" style={{ textDecoration: 'none' }}>
              Browse Catalog
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
  const from = location.state?.from?.pathname || '/dashboard';
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
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
  const { register } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
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
            const ok = await register(email, pwd);
            if (ok) {
              push({ type:'success', message:'Registration successful' });
              window.location.replace('/dashboard');
            } else {
              push({ type:'error', message:'Registration failed' });
            }
          }}
        >
          Create account
        </button>
      </section>
    </main>
  );
}

function Logout() {
  const { logout } = useAuth();
  useEffect(()=>{
    logout();
    // redirect to home after logout
    window.location.replace('/');
  },[logout]);
  return <main style={{ padding: 20 }} aria-live="polite">Logging out…</main>;
}

// Course catalog and course page (basic mock)
function Catalog() {
  const { courses } = useCourses();
  return (
    <main style={{ padding: 20 }}>
      <h1>Course Catalog</h1>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {courses.map((c)=>(
          <article key={c.id} className="card" aria-label={`Course ${c.title}`} style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>{c.title}</h3>
            <p style={{ color: 'var(--text-secondary)', minHeight: 50 }}>{c.description}</p>
            <Link to={`/course/${c.id}`} className="btn" style={{ textDecoration: 'none', display:'inline-block' }}>
              View course
            </Link>
          </article>
        ))}
      </div>
      <Footer />
    </main>
  );
}

function Course() {
  const { pathname } = useLocation();
  const courseId = pathname.split('/').pop();
  const { getCourse } = useCourses();
  const { getProgress, setProgress } = useProgress();
  const course = getCourse(courseId);
  const progress = getProgress(courseId);
  if (!course) return <main style={{ padding: 20 }}>Course not found</main>;
  const pct = progress?.percent || 0;
  return (
    <main style={{ padding: 20 }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>{course.title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{course.description}</p>
        <div aria-label="Progress" style={{ marginTop: 12 }}>
          <div style={{ height: 10, background: '#e5e7eb', borderRadius: 8 }}>
            <div style={{ width: `${pct}%`, height: 10, background: 'var(--primary)', borderRadius: 8 }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pct}% completed</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={()=> setProgress(course.id, Math.min(100, pct + 10))}>Mark +10%</button>
          <button className="btn" onClick={()=> setProgress(course.id, 100)}>Complete</button>
        </div>
      </div>
      <Footer />
    </main>
  );
}

// Dashboard
function Dashboard() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { getProgress } = useProgress();
  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Welcome, {user?.email || 'User'}</h1>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {courses.map((c)=> {
          const pct = getProgress(c.id)?.percent || 0;
          return (
            <article key={c.id} className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>{c.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{c.description}</p>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 8 }}>
                <div style={{ width: `${pct}%`, height: 8, background: 'var(--primary)', borderRadius: 8 }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '6px 0 0' }}>{pct}% completed</p>
              <Link to={`/course/${c.id}`} className="btn" style={{ marginTop: 8, textDecoration:'none', display:'inline-block' }}>
                Continue
              </Link>
            </article>
          );
        })}
      </div>
      <Footer />
    </main>
  );
}

// Onboarding wizard integrating Documents step
function OnboardingWizard() {
  const [step, setStep] = useState(0);
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
        <p>Enroll in required courses from the Catalog and start learning.</p>
        <Link to="/catalog" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>
          Go to Catalog
        </Link>
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

  return (
    <FeatureFlagsProvider>
      <ToastProvider>
        <AuthProvider>
          <CoursesProvider>
            <ProgressProvider>
              <div className="App" style={{ textAlign: 'initial' }}>
                <Router>
                  <NavBar />
                  <button
                    className="theme-toggle"
                    onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/onboarding" element={<OnboardingWizard />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/course/:id" element={<Course />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
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
