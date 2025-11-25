import React from 'react';
import { useAuth } from '../store/authStore';

/**
 * PUBLIC_INTERFACE
 * Profile
 * Shows basic user info and role derived from auth store.
 */
export default function Profile() {
  const { user, currentUserIsAdmin } = useAuth();
  const role = user?.role || 'user';
  return (
    <main style={{ padding: 20 }}>
      <section className="card" style={{ padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>Profile</h1>
        {user ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Role:</strong> {role}{currentUserIsAdmin && role !== 'admin' ? ' (admin override active)' : ''}</div>
          </div>
        ) : (
          <div>Please sign in to view your profile.</div>
        )}
      </section>
      <footer style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
}
