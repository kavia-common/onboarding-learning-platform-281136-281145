import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';

const STORAGE_KEY = 'lms_auth';
const USERS_KEY = 'lms_users_v1'; // local user registry (fallback)
const ADMIN_INBOX_KEY = 'dt3_admin_inbox'; // stores admin submissions
const ADMIN_SEED_FLAG = 'dt3_admin_seeded_v1';

function demoDigest(input) {
  try {
    const data = String(input || '');
    return btoa(unescape(encodeURIComponent(`v1$${data}`)));
  } catch {
    return `v1$${input}`;
  }
}

function loadUsers() {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users || {}));
  } catch {
    // ignore
  }
}

const AuthContext = createContext(null);

// Map Supabase session to our local user shape with role
function toLocalUser(sbUser) {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  const role = meta.app_role || 'user';
  return {
    id: sbUser.id,
    email: sbUser.email || '',
    name: meta.name || sbUser.email || '',
    role,
  };
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * PUBLIC_INTERFACE
   * AuthProvider
   * Uses Supabase auth if configured; otherwise falls back to local-only mode.
   * - Session stored in localStorage (STORAGE_KEY) for quick restore
   * - Role derived from Supabase user_metadata.app_role or defaults to 'user'
   */
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  // Session bootstrap + admin seeding for local fallback
  useEffect(() => {
    try {
      const alreadySeeded = window.localStorage.getItem(ADMIN_SEED_FLAG);
      const users = loadUsers();
      const hasAdmin = Object.values(users).some(u => u?.role === 'admin');
      if (!alreadySeeded && !hasAdmin) {
        const adminEmail = 'admin@dt3.local';
        const adminUser = {
          id: `local-admin-${Date.now()}`,
          email: adminEmail,
          name: 'DT3 Admin',
          passwordHash: demoDigest('admin123'),
          createdAt: new Date().toISOString(),
          role: 'admin',
        };
        users[adminEmail] = adminUser;
        saveUsers(users);
        window.localStorage.setItem(ADMIN_SEED_FLAG, 'true');
      }

      // Try to restore prior session from storage quickly
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed?.user || null);
        setToken(parsed?.token || '');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to Supabase auth state if available
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return undefined;

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const session = data?.session || null;
      const sbUser = session?.user || null;
      const mapped = toLocalUser(sbUser);
      const accessToken = session?.access_token || '';
      setUser(mapped);
      setToken(accessToken);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mapped, token: accessToken }));
      } catch {
        // ignore
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sbUser = session?.user || null;
      const mapped = toLocalUser(sbUser);
      const accessToken = session?.access_token || '';
      setUser(mapped);
      setToken(accessToken);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mapped, token: accessToken }));
      } catch {
        // ignore
      }
    });

    return () => {
      isMounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const persist = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  // PUBLIC_INTERFACE
  const register = useCallback(async (email, password) => {
    /**
     * PUBLIC_INTERFACE
     * register
     * If Supabase is configured, sign up using Supabase. Otherwise, register in local fallback.
     * Returns true on success or { ok:false, message } on error.
     */
    const e = String(email || '').trim().toLowerCase();
    const p = String(password || '');

    if (!e || !e.includes('@')) {
      return { ok: false, message: 'Please enter a valid email address.' };
    }
    if (p.length < 6) {
      return { ok: false, message: 'Password must be at least 6 characters.' };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const siteUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
        const { data, error } = await supabase.auth.signUp({
          email: e,
          password: p,
          options: {
            emailRedirectTo: `${siteUrl}/documents`,
            data: {
              app_role: 'user',
              name: e,
            },
          },
        });
        if (error) {
          return { ok: false, message: error.message };
        }
        // User may be null until email confirmation, depending on Supabase settings.
        const mapped = toLocalUser(data.user);
        const accessToken = data.session?.access_token || '';
        setUser(mapped);
        setToken(accessToken);
        persist({ user: mapped, token: accessToken });
        return true;
      } catch (err) {
        return { ok: false, message: (err && err.message) || 'Sign up failed' };
      }
    }

    // Local fallback
    const users = loadUsers();
    if (users[e]) {
      return { ok: false, message: 'Email already registered.', errorCode: 409 };
    }
    const passwordHash = demoDigest(p);
    const newUser = {
      id: `local-${Date.now()}`,
      email: e,
      name: e,
      passwordHash,
      createdAt: new Date().toISOString(),
      role: 'user',
    };
    users[e] = newUser;
    saveUsers(users);
    const session = { user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role || 'user' }, token: `local-${newUser.id}` };
    setUser(session.user);
    setToken(session.token);
    persist(session);
    return true;
  }, [persist]);

  // PUBLIC_INTERFACE
  const login = useCallback(async (email, password) => {
    /**
     * PUBLIC_INTERFACE
     * login
     * If Supabase is configured, sign in with email/password. Otherwise, use local fallback.
     * Returns true on success or false on invalid credentials; may return {ok:false, message} on Supabase error.
     */
    const e = String(email || '').trim().toLowerCase();
    const p = String(password || '');

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: p });
        if (error) {
          return { ok: false, message: error.message };
        }
        const mapped = toLocalUser(data.user);
        const accessToken = data.session?.access_token || '';
        setUser(mapped);
        setToken(accessToken);
        persist({ user: mapped, token: accessToken });
        return true;
      } catch (err) {
        return { ok: false, message: (err && err.message) || 'Login failed' };
      }
    }

    // Local fallback
    const users = loadUsers();
    const found = users[e];
    if (!found) return false;
    const hash = demoDigest(p);
    if (hash !== found.passwordHash) return false;

    const role = found.role || 'user';
    const session = { user: { id: found.id, email: found.email, name: found.name, role }, token: `local-${found.id}` };
    setUser(session.user);
    setToken(session.token);
    persist(session);
    return true;
  }, [persist]);

  // PUBLIC_INTERFACE
  const logout = useCallback(async () => {
    /**
     * PUBLIC_INTERFACE
     * logout
     * Signs out from Supabase if configured; always clears local session.
     */
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setUser(null);
    setToken('');
    persist({ user: null, token: '' });
  }, [persist]);

  /**
   * PUBLIC_INTERFACE
   * makeAdmin(email)
   * Local-only helper to promote user to admin in fallback registry, or adjust current in-memory role
   * if running with Supabase but metadata not yet set remotely.
   */
  const makeAdmin = useCallback((email) => {
    try {
      const e = String(email || '').trim().toLowerCase();
      if (!e) return false;
      const users = loadUsers();
      const u = users[e];
      if (!u) return false;
      u.role = 'admin';
      saveUsers(users);
      if (user?.email === e) {
        const nextUser = { ...user, role: 'admin' };
        setUser(nextUser);
        persist({ user: nextUser, token });
      }
      return true;
    } catch {
      return false;
    }
  }, [user, token, persist]);

  const value = useMemo(
    () => ({ user, token, loading, register, login, logout, makeAdmin }),
    [user, token, loading, register, login, logout, makeAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
