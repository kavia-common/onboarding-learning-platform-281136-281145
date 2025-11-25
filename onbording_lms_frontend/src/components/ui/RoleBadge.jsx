import React from 'react';
import { useAuth } from '../../store/authStore';

/**
 * PUBLIC_INTERFACE
 * RoleBadge
 * Displays the current authenticated user's role. Defaults to "user" if missing.
 * Accessible with appropriate aria-label and follows Ocean Professional theme.
 */
export default function RoleBadge() {
  const { user, currentUserIsAdmin } = useAuth();
  const role = currentUserIsAdmin ? 'admin' : (user?.role || 'user');
  const color =
    role === 'admin'
      ? 'linear-gradient(90deg, rgba(37,99,235,0.12), rgba(245,158,11,0.12))'
      : 'rgba(37,99,235,0.10)';

  const border =
    role === 'admin'
      ? '1px solid rgba(245,158,11,0.6)'
      : '1px solid rgba(37,99,235,0.3)';

  return (
    <span
      role="status"
      aria-label={`Current role: ${role}`}
      title={`Current role: ${role}`}
      style={{
        fontSize: 12,
        color: 'var(--text-primary)',
        background: color,
        padding: '4px 8px',
        borderRadius: 999,
        border,
      }}
    >
      {role}
    </span>
  );
}
