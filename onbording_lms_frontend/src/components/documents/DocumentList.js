import React from 'react';

const statusColors = {
  pending: '#EF4444',
  completed: '#10B981', // use a green tone for completeness clarity
};

/**
 * PUBLIC_INTERFACE
 * DocumentList
 * Shows a list of documents with status and a button to view details.
 */
export default function DocumentList({ items, onOpen }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
      }}
      aria-label="Documents list"
      role="list"
    >
      <h2 style={{ marginTop: 0, color: '#111827' }}>Documents</h2>
      {items.map((doc) => {
        const isDone = Boolean(doc.acceptedAt && doc.signatureName);
        return (
          <div
            role="listitem"
            key={doc.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              marginBottom: 10,
              background: '#f9fafb',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#111827' }}>{doc.name}</div>
              <div
                style={{
                  marginTop: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#111827',
                }}
              >
                <span
                  aria-label={`Status ${isDone ? 'Completed' : 'Pending'}`}
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: isDone ? statusColors.completed : statusColors.pending,
                  }}
                />
                {isDone ? 'Completed' : 'Pending'}
              </div>
            </div>
            <div>
              <button
                onClick={() => onOpen(doc.key)}
                className="btn"
                style={{
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                }}
                aria-label={`View ${doc.name}`}
              >
                View
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
