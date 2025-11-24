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
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 16,
        }}
      >
        <aside>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
              marginBottom: 12,
            }}
          >
            <h1 style={{ margin: 0, color: '#111827' }}>Onboarding Documents</h1>
            <p style={{ marginTop: 8, color: '#6b7280' }}>
              Read and acknowledge all required documents. Continue is enabled once Code of Conduct, NDA, and the Internship Letter are signed.
            </p>
          </div>

          <DocumentList
            items={items}
            // onOpen removed since the viewer/tabs section is gone
          />
        </aside>

        {/* Removed highlighted section: tabs + document viewer container */}
        <section aria-label="Actions" style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'flex-end',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 12,
              boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
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
              style={{
                background: canContinue ? '#2563EB' : '#93C5FD',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '10px 16px',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                boxShadow: canContinue ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                minWidth: 140,
              }}
              aria-disabled={!canContinue || submitStatus === 'saving'}
              aria-label="Continue after acknowledging documents"
            >
              {submitStatus === 'saving' ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </section>
      </div>

      <footer style={{ marginTop: 24, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
}
