import React from 'react';
import { useAuth } from '../store/authStore';

/**
 * PUBLIC_INTERFACE
 * AdminGate
 * Renders children only if the authenticated user is considered admin.
 * Uses useAuth() context, which derives currentUserIsAdmin from localStorage override
 * (via isAdminEmail) or user.role === 'admin' depending on auth state.
 *
 * @param {React.ReactNode} children - Content to render when authorized
 * @param {React.ReactNode} [fallback=null] - Optional fallback when not authorized
 * @returns {JSX.Element}
 */
export default function AdminGate({ children, fallback = null }) {
  const { currentUserIsAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading...</div>;
  }

  if (!currentUserIsAdmin) {
    if (fallback) return fallback;
    return <div style={{ padding: '1rem', color: '#b91c1c' }}>Not authorized</div>;
  }

  return <>{children}</>;
}
