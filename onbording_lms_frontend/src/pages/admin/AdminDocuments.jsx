import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDocuments, upsertDocument, deleteDocument, getDocumentById } from '../../services/adminDocuments';
import AdminGate from '../../components/AdminGate.jsx';

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

export default function AdminDocuments() {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', description: '', link: '' });
  const [error, setError] = useState('');
  const docs = useMemo(() => listDocuments(), [editingId, form]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: '', category: '', description: '', link: '' });
    setError('');
  };

  const onEdit = (id) => {
    const d = getDocumentById(id);
    if (d) {
      setEditingId(id);
      setForm({ title: d.title, category: d.category, description: d.description, link: d.link });
    }
  };

  const onDelete = (id) => {
    if (window.confirm('Delete this document?')) {
      deleteDocument(id);
      resetForm();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, id: editingId || undefined };
      if (!payload.title || !payload.link) {
        setError('Title and Link are required.');
        return;
      }
      upsertDocument(payload);
      resetForm();
    } catch (err) {
      setError(err?.message || 'Error saving document.');
    }
  };

  const navigate = useNavigate();
  const onView = (id) => navigate(`/admin/documents/${id}`);

  return (
    <AdminGate>
      <div style={{ padding: 24, background: ocean.background, minHeight: '100%' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 420px', background: ocean.surface, borderRadius: 12, padding: 16, border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginTop: 0, color: ocean.text }}>{editingId ? 'Edit Document' : 'Add Document'}</h2>
            <form onSubmit={onSubmit} aria-label="Document form">
              <div style={{ display: 'grid', gap: 12 }}>
                <label>
                  <span>Title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    aria-label="Title"
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                    required
                  />
                </label>
                <label>
                  <span>Category</span>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    aria-label="Category"
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                  />
                </label>
                <label>
                  <span>Description</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    aria-label="Description"
                    rows={3}
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                  />
                </label>
                <label>
                  <span>Link/URL</span>
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    aria-label="Link"
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                    required
                  />
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
            <h2 style={{ marginTop: 0, color: ocean.text }}>Documents</h2>
            <p style={{ color: '#6b7280', marginTop: 4 }}>
              Tip: You can link to uploaded assets under <code>/assets/</code>. For example:
              <code style={{ marginLeft: 6, background: '#f3f4f6', padding: '2px 6px', borderRadius: 6 }}>/assets/20251125_064008_image.png</code>
            </p>
            {docs.length === 0 ? (
              <EmptyState
                title="No documents yet"
                description="Add your first document."
                actionLabel="Add Document"
                onAction={() => setEditingId(null)}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Documents table">
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: 8 }}>Title</th>
                      <th style={{ padding: 8 }}>Category</th>
                      <th style={{ padding: 8 }}>Description</th>
                      <th style={{ padding: 8 }}>Link</th>
                      <th style={{ padding: 8 }} aria-label="Actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td
                          style={{ padding: 8, cursor: 'pointer', color: ocean.primary, textDecoration: 'underline' }}
                          onClick={() => onView(d.id)}
                          role="button"
                          aria-label={`View ${d.title}`}
                          title="View document"
                        >
                          {d.title}
                        </td>
                        <td style={{ padding: 8 }}>{d.category}</td>
                        <td style={{ padding: 8, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</td>
                        <td style={{ padding: 8 }}>
                          <a href={d.link} style={{ color: ocean.primary, textDecoration: 'none' }}>{d.link}</a>
                        </td>
                        <td style={{ padding: 8 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => onView(d.id)} aria-label={`View ${d.title}`} style={{ background: ocean.primary, color: '#fff', border: '1px solid #1d4ed8', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
                              View
                            </button>
                            <button onClick={() => onEdit(d.id)} aria-label={`Edit ${d.title}`} style={{ background: 'transparent', color: ocean.primary, border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
                              Edit
                            </button>
                            <button onClick={() => onDelete(d.id)} aria-label={`Delete ${d.title}`} style={{ background: 'transparent', color: ocean.error, border: '1px solid #fecaca', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
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
      </div>
    </AdminGate>
  );
}
