import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'lms_auth';
const USERS_KEY = 'lms_users_v1'; // local user registry
const ADMIN_INBOX_KEY = 'dt3_admin_inbox'; // stores admin submissions
const ADMIN_SEED_FLAG = 'dt3_admin_seeded_v1';

/**
 * Minimal non-production hashing for demo purposes.
 * Not secure. Do NOT use in production.
 */
function demoDigest(input) {
  try {
    const data = String(input || '');
    // simple base64 of string + salt marker to avoid plain-text (non-secure)
    return btoa(unescape(encodeURIComponent(`v1$${data}`)));
  } catch {
    // fallback: return input marked
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

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * PUBLIC_INTERFACE
   * AuthProvider
   * Pure frontend auth provider.
   * - Registration/Login stored in localStorage (USERS_KEY)
   * - Session stored in localStorage (STORAGE_KEY)
   * - No backend or env vars required for core flows
   */
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  // Load session on mount and seed an admin account if none exists
  useEffect(() => {
    try {
      // Seed a default admin once if registry is empty or no admin found
      const alreadySeeded = window.localStorage.getItem(ADMIN_SEED_FLAG);
      const users = loadUsers();
      const hasAdmin = Object.values(users).some(u => u?.role === 'admin');
      if (!alreadySeeded && !hasAdmin) {
        const adminEmail = 'admin@dt3.local';
        const adminUser = {
          id: `local-admin-${Date.now()}`,
          email: adminEmail,
          name: 'DT3 Admin',
          passwordHash: demoDigest('admin123'), // demo only
          createdAt: new Date().toISOString(),
          role: 'admin',
        };
        users[adminEmail] = adminUser;
        saveUsers(users);
        window.localStorage.setItem(ADMIN_SEED_FLAG, 'true');
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed?.user || null);
        setToken(parsed?.token || '');
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

  // PUBLIC_INTERFACE
  const register = useCallback(async (email, password) => {
    /**
     * PUBLIC_INTERFACE
     * register
     * Registers a new user in localStorage-only registry.
     * - Returns true on success
     * - Returns { ok:false, message, errorCode? } on failure
     * Non-production: password stored with a simple base64 digest for demo.
     */
    const e = String(email || '').trim().toLowerCase();
    const p = String(password || '');

    if (!e || !e.includes('@')) {
      return { ok: false, message: 'Please enter a valid email address.' };
    }
    if (p.length < 6) {
      return { ok: false, message: 'Password must be at least 6 characters.' };
    }

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
      role: 'user', // default role
    };
    users[e] = newUser;
    saveUsers(users);

    // create a local session token (non-secure)
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
     * Authenticates against localStorage registry and sets local session.
     * Returns true on success or false on invalid credentials.
     */
    const e = String(email || '').trim().toLowerCase();
    const p = String(password || '');

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
  const logout = useCallback(() => {
    /**
     * PUBLIC_INTERFACE
     * logout
     * Clears local session.
     */
    setUser(null);
    setToken('');
    persist({ user: null, token: '' });
  }, [persist]);

  /**
   * PUBLIC_INTERFACE
   * makeAdmin(email)
   * Manually promote an existing user to admin role in localStorage.
   * Returns true if role updated.
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
      // if current session belongs to same user, update in-memory user
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

  const value = useMemo(() => ({ user, token, register, login, logout, makeAdmin }), [user, token, register, login, logout, makeAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
