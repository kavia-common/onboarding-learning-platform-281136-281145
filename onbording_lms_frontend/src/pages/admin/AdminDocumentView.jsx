import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminGate from '../../components/AdminGate.jsx';
import { getDocumentById } from '../../services/adminDocuments';

/**
 * PUBLIC_INTERFACE
 * AdminDocumentView
 * Loads a document by id from adminDocuments service and embeds it safely.
 * - If link is external http(s), uses iframe where possible.
 * - Supports basic types: pdf, images, text/markdown; falls back to open in new tab.
 * - Shows metadata and Back button.
 */
export default function AdminDocumentView() {
  const ocean = {
    primary: '#2563EB',
    secondary: '#F59E0B',
    surface: '#ffffff',
    background: '#f9fafb',
    text: '#111827',
    error: '#EF4444',
  };

  const { id } = useParams();
  const doc = useMemo(() => getDocumentById(id), [id]);

  const isUrl = (v) => /^https?:\/\//i.test(v || '');
  const getExt = (v) => {
    try {
      const url = new URL(v, window.location.origin);
      const pathname = url.pathname || '';
      const qName = (url.searchParams.get('filename') || '').toLowerCase();
      const base = (qName || pathname.split('/').pop() || '').toLowerCase();
      const dot = base.lastIndexOf('.');
      return dot >= 0 ? base.slice(dot + 1) : '';
    } catch {
      const s = String(v || '');
      const idx = s.lastIndexOf('.');
      return idx >= 0 ? s.slice(idx + 1).toLowerCase() : '';
    }
  };

  const ext = getExt(doc?.link || '');
  const isPdf = ext === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
  const isText = ['txt', 'md', 'markdown', 'json', 'csv', 'log'].includes(ext);

  const viewer = (() => {
    if (!doc?.link) return null;
    const src = doc.link;

    // External URL
    if (isUrl(src)) {
      if (isPdf) {
        return (
          <iframe
            title="PDF Viewer"
            src={src}
            style={{ width: '100%', height: 600, border: '1px solid #e5e7eb', borderRadius: 12 }}
          />
        );
      }
      if (isImage) {
        return (
          <div style={{ textAlign: 'center' }}>
            <img src={src} alt={doc.title} style={{ maxWidth: '100%', maxHeight: 600, borderRadius: 12, border: '1px solid #e5e7eb' }} />
          </div>
        );
      }
      if (isText) {
        return (
          <iframe
            title="Text Viewer"
            src={src}
            style={{ width: '100%', height: 500, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}
          />
        );
      }
      // Unknown external -> provide a safe direct navigation hint (no target=_blank)
      return (
        <div style={{ padding: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12 }}>
          <p style={{ marginTop: 0, color: '#92400e' }}>
            This file type might not be embeddable. You can navigate to the resource directly.
          </p>
          <a
            href={src}
            rel="noreferrer"
            style={{ color: ocean.primary, textDecoration: 'none', border: '1px solid #c7d2fe', padding: '6px 10px', borderRadius: 8 }}
            title="Open resource"
            aria-label="Open resource"
          >
            Go to resource
          </a>
        </div>
      );
    }

    // Local path or public asset
    if (isPdf) {
      return (
        <object data={src} type="application/pdf" width="100%" height="600" style={{ border: '1px solid #e5e7eb', borderRadius: 12 }}>
          <iframe title="PDF Viewer Fallback" src={src} style={{ width: '100%', height: 600, border: 'none' }} />
          <p>
            Unable to display PDF.{' '}
            <a href={src} download style={{ color: ocean.primary, textDecoration: 'none', border: '1px solid #c7d2fe', padding: '2px 6px', borderRadius: 6 }}>
              Download
            </a>
          </p>
        </object>
      );
    }
    if (isImage) {
      return (
        <div style={{ textAlign: 'center' }}>
          <img src={src} alt={doc.title} style={{ maxWidth: '100%', maxHeight: 600, borderRadius: 12, border: '1px solid #e5e7eb' }} />
        </div>
      );
    }
    if (isText) {
      return (
        <iframe
          title="Text Viewer"
          src={src}
          style={{ width: '100%', height: 500, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}
        />
      );
    }

    // Fallback
    return (
      <div style={{ padding: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12 }}>
        <p style={{ marginTop: 0, color: '#92400e' }}>
          Preview not available for this file type.
        </p>
        <a href={src} rel="noreferrer" style={{ color: ocean.primary }}>
          Open
        </a>
      </div>
    );
  })();

  return (
    <AdminGate>
      <main style={{ padding: 24, background: ocean.background, minHeight: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: ocean.text }}>Document Viewer</h2>
          <Link to="/admin/documents" style={{ color: ocean.primary }}>
            ← Back to Documents
          </Link>
        </div>

        {!doc ? (
          <div style={{ padding: 16, border: '1px solid #fecaca', background: '#fef2f2', color: ocean.error, borderRadius: 12 }}>
            Document not found.
          </div>
        ) : (
          <section style={{ display: 'grid', gap: 16 }}>
            <div style={{ background: ocean.surface, border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <h3 style={{ marginTop: 0, color: ocean.text }}>{doc.title}</h3>
              <div style={{ color: '#6b7280', display: 'grid', gap: 6 }}>
                <div><strong>Category:</strong> {doc.category || '—'}</div>
                <div><strong>Description:</strong> {doc.description || '—'}</div>
                <div>
                  <strong>Link:</strong> <a href={doc.link} style={{ color: ocean.primary, textDecoration: 'none' }}>{doc.link}</a>
                </div>
                <div><strong>Type:</strong> {ext || 'unknown'}</div>
              </div>
            </div>

            <div style={{ background: ocean.surface, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
              {viewer}
            </div>
          </section>
        )}
      </main>
    </AdminGate>
  );
}
