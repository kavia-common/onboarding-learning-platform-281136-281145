import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'lms_auth';
const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Auth provider with JWT support and mock fallback when no backend configured */
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { user, token } = JSON.parse(raw);
        setUser(user || null);
        setToken(token || '');
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(async (email, password) => {
    if (!API_BASE) {
      // mock success
      const mock = { user: { id: 'mock-user', email }, token: 'mock-token' };
      setUser(mock.user); setToken(mock.token); persist(mock);
      return true;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const auth = { user: data.user, token: data.token };
      setUser(auth.user); setToken(auth.token); persist(auth);
      return true;
    } catch {
      return false;
    }
  }, [persist]);

  const register = useCallback(async (email, password) => {
    if (!API_BASE) {
      const mock = { user: { id: 'mock-user', email }, token: 'mock-token' };
      setUser(mock.user); setToken(mock.token); persist(mock);
      return true;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const auth = { user: data.user, token: data.token };
      setUser(auth.user); setToken(auth.token); persist(auth);
      return true;
    } catch {
      return false;
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
