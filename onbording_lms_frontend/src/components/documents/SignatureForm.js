import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * SignatureForm
 * Collects a confirmation checkbox, typed full-name signature, and date.
 */
export default function SignatureForm({
  docKey,
  docName,
  initialSignatureName = '',
  initialAcceptedAt = null,
  onChange,
}) {
  const [checked, setChecked] = useState(Boolean(initialAcceptedAt));
  const [name, setName] = useState(initialSignatureName || '');
  const [date, setDate] = useState(
    initialAcceptedAt ? new Date(initialAcceptedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    const acceptedAt = checked && name.trim().length > 1 ? new Date(date).toISOString() : null;
    onChange?.({
      key: docKey,
      name: docName,
      signatureName: name.trim(),
      acceptedAt,
    });
  }, [checked, name, date, docKey, docName, onChange]);

  return (
    <fieldset
      aria-labelledby={`${docKey}-legend`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        background: '#ffffff',
        boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
      }}
    >
      <legend id={`${docKey}-legend`} style={{ padding: '0 8px', color: '#2563EB', fontWeight: 600 }}>
        Acknowledgment & Signature
      </legend>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          aria-describedby={`${docKey}-ack-help`}
        />
        <span id={`${docKey}-ack-help`} style={{ color: '#111827' }}>
          I have read and agree to the {docName}.
        </span>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
        <div>
          <label htmlFor={`${docKey}-name`} style={{ display: 'block', color: '#111827', marginBottom: 6 }}>
            Full name (typed signature)
          </label>
          <input
            id={`${docKey}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              outline: 'none',
            }}
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor={`${docKey}-date`} style={{ display: 'block', color: '#111827', marginBottom: 6 }}>
            Date
          </label>
          <input
            id={`${docKey}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              outline: 'none',
            }}
            aria-required="true"
          />
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>
        Your typed name constitutes your electronic signature.
      </p>
    </fieldset>
  );
}
