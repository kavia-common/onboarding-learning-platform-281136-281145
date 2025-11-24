import React, { useMemo, useState } from 'react';
import DocumentList from '../components/documents/DocumentList';

import { loadAckState, saveAckState, isAllCompleted } from '../store/documentsStore';
import { postAcknowledgements } from '../utils/api';

// PUBLIC_INTERFACE
export default function Documents() {
  /** Documents onboarding page simplified to list and action only (viewer block removed). */
  const [state, setState] = useState(() => loadAckState());
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | saving | saved

  const items = useMemo(
    () => [state.code_of_conduct, state.nda, state.internship_letter],
    [state.code_of_conduct, state.nda, state.internship_letter]
  );

  const canContinue = isAllCompleted(state);

  const handleSubmit = async () => {
    setSubmitStatus('saving');
    saveAckState(state);

    const payload = {
      userId: 'local-session',
      documents: [state.code_of_conduct, state.nda, state.internship_letter].map((d) => ({
        key: d.key,
        name: d.name,
        signatureName: d.signatureName,
        acceptedAt: d.acceptedAt,
      })),
    };

    await postAcknowledgements(payload);
    setSubmitStatus('saved');
    setTimeout(() => setSubmitStatus('idle'), 3000);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f9fafb',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 16,
          width: '100%',
          flex: 1, // allow content to grow so footer sticks to bottom
        }}
      >
        <aside>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 0,
              boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
              marginBottom: 12,
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                height: 44,
                background: 'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(249,250,251,0.6))',
                borderBottom: '1px solid #e5e7eb',
              }}
            />
            <div style={{ padding: 16 }}>
              <h1 style={{ margin: 0, color: '#111827' }}>Onboarding Documents</h1>
              <p style={{ marginTop: 8, color: '#6b7280' }}>
                Read and acknowledge all required documents. Continue is enabled once Code of Conduct, NDA, and the Internship Letter are signed.
              </p>
            </div>
          </div>

          <DocumentList items={items} />
        </aside>

        {/* Right side content area reserved for future extensions */}
        <section aria-label="Content" style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          {/* Intentionally empty for now to remove top-right action bar */}
        </section>
      </div>

      {/* Sticky bottom action bar that does not overlap content */}
      <div
        role="region"
        aria-label="Document actions"
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 5,
          width: '100%',
          background: 'linear-gradient(to top, rgba(249,250,251,0.98), rgba(249,250,251,0.75))',
          borderTop: '1px solid #e5e7eb',
          padding: '12px 0',
          marginTop: 16,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'flex-end',
          }}
        >
          {submitStatus === 'saved' && (
            <span role="status" style={{ color: '#10B981', marginRight: 'auto' }}>
              Saved locally. You can proceed.
            </span>
          )}
          <button
            disabled={!canContinue || submitStatus === 'saving'}
            onClick={handleSubmit}
            className="btn"
            style={{
              // override subtle states to reflect disabled visual while keeping theme
              background: canContinue ? 'var(--primary)' : '#93C5FD',
              color: '#fff',
              borderRadius: 10,
              padding: '10px 16px',
              minWidth: 140,
              cursor: canContinue ? 'pointer' : 'not-allowed',
              boxShadow: canContinue ? '0 8px 24px rgba(37,99,235,0.25)' : 'none',
            }}
            aria-disabled={!canContinue || submitStatus === 'saving'}
            aria-label="Continue after acknowledging documents"
          >
            {submitStatus === 'saving' ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>

      <footer style={{ marginTop: 12, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
}
