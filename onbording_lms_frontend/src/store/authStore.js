import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'lms_auth';

// Normalize API base and avoid double slashes
function resolveApiBase() {
  const raw =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '';
  const base = String(raw || '').trim();
  if (!base) return '';
  return base.replace(/\/+$/, '');
}
const API_BASE = resolveApiBase();

function isMockEnabled() {
  try {
    const raw = process.env.REACT_APP_FEATURE_FLAGS || '';
    if (!raw) return false;
    if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data.includes('mockApi');
      return Boolean(data.mockApi);
    }
    return raw.split(',').map(s => s.trim()).includes('mockApi');
  } catch {
    return false;
  }
}

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Auth provider with JWT support and mock fallback when no backend configured */
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const existingUser = parsed?.user || null;
          const existingToken = parsed?.token || '';
          setUser(existingUser);
          setToken(existingToken);

          // If API configured and we have a token, verify it via /me
          if (API_BASE && existingToken) {
            try {
              const res = await fetch(`${API_BASE}/me`, {
                headers: { Authorization: `Bearer ${existingToken}` }
              });
              if (res.ok) {
                const data = await res.json();
                if (active) setUser(data.user);
              } else {
                // token invalid; clear
                if (active) {
                  setUser(null);
                  setToken('');
                  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: null, token: '' }));
                }
              }
            } catch {
              // network errors ignored; keep local state
            }
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => { active = false; };
  }, []);

  const persist = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(async (email, password) => {
    if (!API_BASE || isMockEnabled()) {
      // mock success path when API not configured or mock flag enabled
      const mock = { user: { id: 'mock-user', email }, token: 'mock-token' };
      setUser(mock.user); setToken(mock.token); persist(mock);
      return true;
    }
    const url = `${API_BASE}/auth/login`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return { ok: false, status: res.status, url };
      const data = await res.json();
      const auth = { user: data.user, token: data.token };
      setUser(auth.user); setToken(auth.token); persist(auth);
      return true;
    } catch (err) {
      const pageIsHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
      const apiIsHttp = /^http:\/\//i.test(url);
      const mixedContent = pageIsHttps && apiIsHttp;
      return {
        ok: false,
        status: -1,
        url,
        message: `Network error while calling ${url}${mixedContent ? ' (blocked mixed content)' : ''}`
      };
    }
  }, [persist]);

  const register = useCallback(async (email, password) => {
    // Basic client-side guard
    const e = String(email || '').trim();
    const p = String(password || '');
    if (!e || !e.includes('@')) {
      return { ok: false, message: 'Invalid email address.' };
    }
    if (p.length < 6) {
      return { ok: false, message: 'Password must be at least 6 characters.' };
    }

    if (!API_BASE) {
      const mock = { user: { id: 'mock-user', email: e }, token: 'mock-token' };
      setUser(mock.user); setToken(mock.token); persist(mock);
      return true;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email: e, password: p }),
      });

      if (!res.ok) {
        let msg = 'Registration failed.';
        let errorCode = res.status;
        try {
          const body = await res.json();
          if (body?.error === 'EmailExists' || res.status === 409) {
            msg = 'Email already registered.';
            errorCode = 409;
          } else if (body?.error === 'ValidationError' && Array.isArray(body.details) && body.details.length) {
            msg = `Validation error: ${body.details[0]}`;
          } else if (body?.error) {
            msg = body.error;
          }
        } catch {
          // ignore JSON parsing errors
        }
        return { ok: false, message: msg, errorCode };
      }

      const data = await res.json();
      const auth = { user: data.user, token: data.token };
      setUser(auth.user); setToken(auth.token); persist(auth);
      return true;
    } catch {
      return { ok: false, message: 'Network error. Please check API availability.' };
    }
  }, [persist]);

  const logout = useCallback(() => {
    setUser(null); setToken(''); persist({ user:null, token:'' });
  }, [persist]);

  const value = useMemo(()=>({ user, token, login, register, logout }), [user, token, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
