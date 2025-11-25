import React, { useMemo, useState } from 'react';
import { listUsers, upsertUser, deleteUser, getUserById } from '../../services/adminUsers';
import { useAuth } from '../../store/authStore';
import AdminGate from '../../components/AdminGate.jsx';

/**
 * AdminUsers - Manage users with localStorage-backed CRUD.
 * Accessible only to admins through AdminGate/ProtectedRoute.
 */
const ocean = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  surface: '#ffffff',
  background: '#f9fafb',
  text: '#111827',
  error: '#EF4444',
};

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div style={{ background: ocean.surface, padding: 24, borderRadius: 12, textAlign: 'center', border: '1px solid #e5e7eb' }}>
      <h3 style={{ margin: 0, color: ocean.text }}>{title}</h3>
      <p style={{ color: '#6b7280' }}>{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          style={{ background: ocean.primary, color: 'white', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const auth = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', status: 'active' });
  const [error, setError] = useState('');
  const users = useMemo(() => listUsers(), [editingId, form]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', email: '', role: 'user', status: 'active' });
    setError('');
  };

  const onEdit = (id) => {
    const u = getUserById(id);
    if (u) {
      setEditingId(id);
      setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    }
  };

  const onDelete = (id) => {
    if (window.confirm('Delete this user?')) {
      deleteUser(id);
      resetForm();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, id: editingId || undefined };
      if (!payload.name || !payload.email) {
        setError('Name and Email are required.');
        return;
      }
      upsertUser(payload);
      resetForm();
    } catch (err) {
      setError(err?.message || 'Error saving user.');
    }
  };

  // Only show for admins
  return (
    <AdminGate>
      <div style={{ padding: 24, background: ocean.background, minHeight: '100%' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 420px', background: ocean.surface, borderRadius: 12, padding: 16, border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginTop: 0, color: ocean.text }}>{editingId ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={onSubmit} aria-label="User form">
              <div style={{ display: 'grid', gap: 12 }}>
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    aria-label="Name"
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                    required
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    aria-label="Email"
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                    required
                  />
                </label>
                <label>
                  <span>Role</span>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    aria-label="Role"
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    aria-label="Status"
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
              </div>
              {error && <div role="alert" style={{ color: ocean.error, marginTop: 8 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="submit" style={{ background: ocean.primary, color: 'white', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} style={{ background: '#6b7280', color: 'white', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          <div style={{ flex: '2 1 600px', background: ocean.surface, borderRadius: 12, padding: 16, border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginTop: 0, color: ocean.text }}>Users</h2>
            {users.length === 0 ? (
              <EmptyState
                title="No users yet"
                description="Create your first user to get started."
                actionLabel="Add User"
                onAction={() => setEditingId(null)}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Users table">
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: 8 }}>Name</th>
                      <th style={{ padding: 8 }}>Email</th>
                      <th style={{ padding: 8 }}>Role</th>
                      <th style={{ padding: 8 }}>Status</th>
                      <th style={{ padding: 8 }} aria-label="Actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: 8 }}>{u.name}</td>
                        <td style={{ padding: 8 }}>{u.email}</td>
                        <td style={{ padding: 8 }}>
                          <span style={{ background: '#eff6ff', color: ocean.primary, padding: '2px 8px', borderRadius: 999 }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: 8 }}>
                          <span style={{ background: u.status === 'active' ? '#ecfeff' : '#fef3c7', color: u.status === 'active' ? '#0e7490' : ocean.secondary, padding: '2px 8px', borderRadius: 999 }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: 8 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => onEdit(u.id)} aria-label={`Edit ${u.name}`} style={{ background: 'transparent', color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
                              Edit
                            </button>
                            <button onClick={() => onDelete(u.id)} aria-label={`Delete ${u.name}`} style={{ background: 'transparent', color: ocean.error, border: '1px solid #fecaca', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => { auth.logout(); }}
            style={{ background: 'transparent', color: ocean.error, border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>
    </AdminGate>
  );
}
