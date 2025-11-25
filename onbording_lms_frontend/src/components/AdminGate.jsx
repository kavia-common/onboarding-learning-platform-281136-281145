import React from 'react';
import { useAuth } from '../store/authStore';

/**
 * PUBLIC_INTERFACE
 * AdminGate component: Renders children only if currentUserIsAdmin is true.
 * Otherwise, displays a minimal "Not authorized" message.
 * Intended for client-side, non-secure gating for local/dev usage.
 */
export default function AdminGate({ children, fallback = null }) {
  const { currentUserIsAdmin, loading } = useAuth();

  console.log('[AdminGate] loading:', loading, 'isAdmin:', currentUserIsAdmin);

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading...</div>;
  }

  if (!currentUserIsAdmin) {
    if (fallback) return fallback;
    return <div style={{ padding: '1rem', color: '#b91c1c' }}>Not authorized</div>;
  }

  return <>{children}</>;
}
