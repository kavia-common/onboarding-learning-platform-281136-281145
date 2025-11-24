import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'lms_progress';
const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';

function getAuthToken() {
  try {
    const raw = window.localStorage.getItem('lms_auth');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.token || '';
  } catch {
    return '';
  }
}

const ProgressContext = createContext(null);

// PUBLIC_INTERFACE
export function ProgressProvider({ children }) {
  /** Provide per-course progress, persisted to localStorage and optionally posted to API */
  const [progress, setProgressState] = useState({}); // { [courseId]: { percent } }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProgressState(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((state) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, []);

  const setProgress = useCallback(async (courseId, percent) => {
    setProgressState(prev => {
      const next = { ...prev, [courseId]: { percent } };
      persist(next);
      return next;
    });
    if (API_BASE) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        const token = getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
        await fetch(`${API_BASE}/progress`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ courseId, percent }),
        });
      } catch {
        // ignore api failures
      }
    }
  }, [persist]);

  const getProgress = useCallback((courseId) => progress[courseId] || { percent: 0 }, [progress]);

  const value = useMemo(()=>({ getProgress, setProgress }), [getProgress, setProgress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// PUBLIC_INTERFACE
export function useProgress() {
  /** Access progress context */
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
