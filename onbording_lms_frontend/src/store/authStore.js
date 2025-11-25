import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isAdminEmail } from '../utils/adminLocalStorage';

const STORAGE_KEY = 'lms_auth';
const USERS_KEY = 'lms_users_v1'; // local user registry (frontend-only)
const ADMIN_SEED_FLAG = 'dt3_admin_seeded_v1';

// Simple demo digest (NOT secure; demo only). Do NOT use in production.
// This is provided to avoid storing plaintext; it is not cryptographically secure.
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

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * PUBLIC_INTERFACE
   * AuthProvider
   * Frontend-only authentication via localStorage.
   * - Users are stored locally under USERS_KEY
   * - Session stored under STORAGE_KEY
   * - Admin role derived from stored user role or local override in adminLocalStorage
   */
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  const recomputeAdmin = useCallback((maybeUser) => {
    const email = maybeUser?.email || '';
    const isAdmin = email ? isAdminEmail(email) || maybeUser?.role === 'admin' : false;
    setCurrentUserIsAdmin(!!isAdmin);
  }, []);

  // PUBLIC_INTERFACE
  const seedAdminIfNeeded = useCallback(() => {
    /**
     * PUBLIC_INTERFACE
     * seedAdminIfNeeded
     * Seeds demo admin accounts locally if not already seeded:
     *  - Primary requested admin: abburi@kavia.com / Pallavi@123
     *  - Legacy fallback admin for dev: admin@dt3.local / admin123
     * Credentials are stored with a demo digest and are for demo only.
     */
    const users = loadUsers();
    let changed = false;

    // Requested seed
    const seedEmail = 'abburi@kavia.com';
    if (!users[seedEmail]) {
      users[seedEmail] = {
        id: `local-admin-${Date.now()}-abburi`,
        email: seedEmail,
        name: 'Admin',
        passwordHash: demoDigest('Pallavi@123'),
        createdAt: new Date().toISOString(),
        role: 'admin',
      };
      changed = true;
    }

    // Optional legacy seed retained for local convenience
    const legacyEmail = 'admin@dt3.local';
    if (!users[legacyEmail]) {
      users[legacyEmail] = {
        id: `local-admin-${Date.now()}-legacy`,
        email: legacyEmail,
        name: 'DT3 Admin',
        passwordHash: demoDigest('admin123'),
        createdAt: new Date().toISOString(),
        role: 'admin',
      };
      changed = true;
    }

    if (changed) {
      saveUsers(users);
    }
    // Mark seeded
    window.localStorage.setItem(ADMIN_SEED_FLAG, 'true');
  }, []);

  // Seed admins and restore session
  useEffect(() => {
    try {
      const alreadySeeded = window.localStorage.getItem(ADMIN_SEED_FLAG);
      if (!alreadySeeded) {
        seedAdminIfNeeded();
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const restoredUser = parsed?.user || null;
        setUser(restoredUser);
        setToken(parsed?.token || '');
        recomputeAdmin(restoredUser);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [recomputeAdmin, seedAdminIfNeeded]);

  const persist = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  // PUBLIC_INTERFACE
  const register = useCallback(
    async (email, password) => {
      /**
       * PUBLIC_INTERFACE
       * register
       * Registers a new local-only user in localStorage.
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
      const session = {
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role || 'user' },
        token: `local-${newUser.id}`,
      };
      setUser(session.user);
      setToken(session.token);
      recomputeAdmin(session.user);
      persist(session);
      return true;
    },
    [persist, recomputeAdmin]
  );

  // PUBLIC_INTERFACE
  const login = useCallback(
    async (email, password) => {
      /**
       * PUBLIC_INTERFACE
       * login
       * Local-only login against stored users.
       * Returns true on success or false on invalid credentials.
       * Also sets currentUser with role and persists session in localStorage (STORAGE_KEY).
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
      console.debug('[authStore.login] Authenticated user:', session.user);
      setUser(session.user);
      setToken(session.token);
      recomputeAdmin(session.user);
      persist(session);
      console.debug('[authStore.login] Session persisted to localStorage');
      return true;
    },
    [persist, recomputeAdmin]
  );

  // PUBLIC_INTERFACE
  const logout = useCallback(async () => {
    /**
     * PUBLIC_INTERFACE
     * logout
     * Clears local session.
     */
    setUser(null);
    setToken('');
    setCurrentUserIsAdmin(false);
    persist({ user: null, token: '' });
  }, [persist]);

  /**
   * PUBLIC_INTERFACE
   * makeAdmin(email)
   * Promote a local user to admin in the local registry and update current session if applicable.
   */
  const makeAdmin = useCallback(
    (email) => {
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
          recomputeAdmin(nextUser);
          persist({ user: nextUser, token });
        }
        return true;
      } catch {
        return false;
      }
    },
    [user, token, persist, recomputeAdmin]
  );

  // PUBLIC_INTERFACE
  const getCurrentUserRole = useCallback(async () => {
    /**
     * PUBLIC_INTERFACE
     * getCurrentUserRole
     * Returns the user's current role from session (frontend-only).
     */
    return user?.role || 'user';
  }, [user]);

  // PUBLIC_INTERFACE
  const updateCurrentUserRole = useCallback(
    async (newRole) => {
      /**
       * PUBLIC_INTERFACE
       * updateCurrentUserRole(newRole)
       * Updates the current user's role in local registry and session.
       */
      const role = newRole === 'admin' ? 'admin' : 'user';
      try {
        if (!user?.email) return { ok: false, message: 'No authenticated user' };
        const users = loadUsers();
        const u = users[user.email];
        if (u) {
          u.role = role;
          saveUsers(users);
        }
        const nextUser = { ...user, role };
        setUser(nextUser);
        recomputeAdmin(nextUser);
        persist({ user: nextUser, token });
        return { ok: true };
      } catch (err) {
        return { ok: false, message: (err && err.message) || 'Failed to update role locally' };
      }
    },
    [user, token, persist, recomputeAdmin]
  );

  // PUBLIC_INTERFACE
  const setCurrentUser = useCallback((nextUser) => {
    /**
     * PUBLIC_INTERFACE
     * setCurrentUser(nextUser)
     * Sets the current user object and persists the session using the same STORAGE_KEY format.
     * Intended for lightweight session changes (e.g., demo-only admin bypass).
     */
    const safeUser = nextUser ? {
      id: nextUser.id,
      email: nextUser.email,
      name: nextUser.name,
      role: nextUser.role || 'user',
      status: nextUser.status,
    } : null;
    const session = { user: safeUser, token: safeUser ? `local-${safeUser.id || 'session'}` : '' };
    setUser(safeUser);
    setToken(session.token);
    recomputeAdmin(safeUser);
    persist(session);
  }, [persist, recomputeAdmin]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      currentUserIsAdmin,
      register,
      login,
      logout,
      makeAdmin,
      getCurrentUserRole,
      updateCurrentUserRole,
      setCurrentUser,
    }),
    [user, token, loading, currentUserIsAdmin, register, login, logout, makeAdmin, getCurrentUserRole, updateCurrentUserRole, setCurrentUser]
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
