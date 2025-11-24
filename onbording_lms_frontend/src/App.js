import React, { useState, useEffect } from 'react';
import './App.css';
import Documents from './routes/Documents';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [view, setView] = useState('home'); // 'home' | 'documents'

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const Nav = () => (
    <div
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
      role="navigation"
      aria-label="Main navigation"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Onboarding LMS</span>
        <button
          onClick={() => setView('home')}
          className="btn"
          style={{ background: view === 'home' ? 'var(--primary)' : 'transparent', color: view === 'home' ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          aria-pressed={view === 'home'}
        >
          Home
        </button>
        <button
          onClick={() => setView('documents')}
          className="btn"
          style={{ background: view === 'documents' ? 'var(--primary)' : 'transparent', color: view === 'documents' ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          aria-pressed={view === 'documents'}
        >
          Documents
        </button>
      </div>
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </div>
  );

  if (view === 'documents') {
    return (
      <div className="App" style={{ textAlign: 'initial' }}>
        <Nav />
        <Documents />
      </div>
    );
  }

  return (
    <div className="App">
      <Nav />
      <header className="App-header">
        <p style={{ maxWidth: 680 }}>
          Welcome to the Onboarding LMS. Use the Documents section to review and electronically sign required policies. 
          The interface adheres to the Ocean Professional theme.
        </p>
        <button
          onClick={() => setView('documents')}
          className="btn"
          aria-label="Open Documents onboarding"
        >
          Go to Documents
        </button>
      </header>
    </div>
  );
}

export default App;
