import React, { useCallback, useMemo, useState } from 'react';
import DocumentList from '../components/documents/DocumentList';
import DocumentViewer from '../components/documents/DocumentViewer';

import { loadAckState, saveAckState, isAllCompleted } from '../store/documentsStore';
import { postAcknowledgements } from '../utils/api';

// PUBLIC_INTERFACE
export default function Documents() {
  /** Documents onboarding page with viewer, signature, and submission (frontend-only by default). */
  const [state, setState] = useState(() => loadAckState());
  const [activeKey, setActiveKey] = useState('code_of_conduct');
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | saving | saved

  const items = useMemo(
    () => [state.code_of_conduct, state.nda, state.internship_letter],
    [state.code_of_conduct, state.nda, state.internship_letter]
  );

  const onFormChange = useCallback((docPartial) => {
    setState((prev) => {
      const next = {
        ...prev,
        [docPartial.key]: {
          ...prev[docPartial.key],
          ...docPartial,
        },
      };
      saveAckState(next);
      return next;
    });
  }, []);

  const canContinue = isAllCompleted(state);

  const handleSubmit = async () => {
    setSubmitStatus('saving');
    // always save locally
    saveAckState(state);

    const payload = {
      userId: 'local-session',
      documents: [
        state.code_of_conduct,
        state.nda,
        state.internship_letter
      ].map((d) => ({
        key: d.key,
        name: d.name,
        signatureName: d.signatureName,
        acceptedAt: d.acceptedAt,
      })),
    };

    // Best-effort post (no-op if API not configured), always treat as success
    await postAcknowledgements(payload);
    setSubmitStatus('saved');
    setTimeout(() => setSubmitStatus('idle'), 3000);
  };

  const docMeta = {
    code_of_conduct: {
      title: 'Code of Conduct',
      src: '/src/content/code_of_conduct.md',
      name: 'Code of Conduct'
    },
    nda: {
      title: 'Non-Disclosure Agreement (NDA)',
      src: '/src/content/nda.md',
      name: 'Non-Disclosure Agreement (NDA)'
    },
    internship_letter: {
      title: 'Internship Offer Letter',
      src: '/src/content/internship_letter.md',
      name: 'Internship Offer Letter',
      optional: false
    },
  };

  const activeMeta = docMeta[activeKey];
  const activeState = state[activeKey];

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
            onOpen={setActiveKey}
          />
        </aside>

        <section aria-label="Document details and signature" style={{ display: 'grid', gap: 16 }}>
          <nav
            aria-label="Documents tabs"
            style={{
              display: 'flex',
              gap: 8,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 8,
              boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
            }}
          >
            {Object.keys(docMeta).map((k) => {
              const isActive = k === activeKey;
              return (
                <button
                  key={k}
                  onClick={() => setActiveKey(k)}
                  aria-pressed={isActive}
                  style={{
                    background: isActive ? '#2563EB' : 'transparent',
                    color: isActive ? 'white' : '#111827',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {docMeta[k].title}
                </button>
              );
            })}
          </nav>

          <DocumentViewer
            title={activeMeta.title}
            src={activeMeta.src}
            ariaLabel={`${activeMeta.title} content`}
          />

          {/* Signature form removed as per request to hide the highlighted section */}

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
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
