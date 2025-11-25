import React, { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * InboxRow renders a single row for the Admin Inbox table.
 * This is a semantic button row with accessible labels; click handlers are passed via props.
 */
// PUBLIC_INTERFACE
export function InboxRow({
  id,
  subject,
  fromEmail,
  receivedAt,
  status,
  codeOfConduct,
  nda,
  offerLetter,
  onToggleDoc, // (id, field) => void
  onView,
  onApprove,
  onReject,
}) {
  // Map status to simple color chips using the Ocean Professional palette
  const statusStyles = {
    pending: { bg: '#F59E0B1A', color: '#F59E0B', label: 'Pending' }, // secondary
    approved: { bg: '#2563EB1A', color: '#2563EB', label: 'Approved' }, // primary
    rejected: { bg: '#EF44441A', color: '#EF4444', label: 'Rejected' }, // error
  };
  const s = statusStyles[status] || statusStyles.pending;

  // Simple style for toggle buttons
  const toggleBtnStyle = (active) => ({
    padding: '8px 12px',
    background: active ? '#10B981' : '#ffffff',
    color: active ? '#ffffff' : '#111827',
    border: `1px solid ${active ? '#059669' : '#D1D5DB'}`,
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  const labelFor = (active) => (active ? 'Provided' : 'Mark Provided');

  return (
    <tr
      key={id}
      style={{
        background: '#ffffff',
        transition: 'background-color 150ms ease',
      }}
    >
      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827' }}>
        {subject}
      </td>
      <td style={{ padding: '12px 16px', color: '#374151' }}>{fromEmail}</td>
      <td style={{ padding: '12px 16px', color: '#4B5563' }}>{receivedAt}</td>
      <td style={{ padding: '12px 16px' }}>
        <span
          aria-label={`Status: ${s.label}`}
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            color: s.color,
            background: s.bg,
            borderRadius: 999,
          }}
        >
          {s.label}
        </span>
      </td>
      <td
        style={{
          padding: '12px 16px',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => onToggleDoc?.(id, 'codeOfConduct')}
          aria-label={`Toggle Code of Conduct provided for ${fromEmail}`}
          style={toggleBtnStyle(Boolean(codeOfConduct))}
        >
          {labelFor(Boolean(codeOfConduct))}
        </button>

        <button
          type="button"
          onClick={() => onToggleDoc?.(id, 'nda')}
          aria-label={`Toggle NDA provided for ${fromEmail}`}
          style={toggleBtnStyle(Boolean(nda))}
        >
          {labelFor(Boolean(nda))}
        </button>

        <button
          type="button"
          onClick={() => onToggleDoc?.(id, 'offerLetter')}
          aria-label={`Toggle Offer Letter provided for ${fromEmail}`}
          style={toggleBtnStyle(Boolean(offerLetter))}
        >
          {labelFor(Boolean(offerLetter))}
        </button>

        <button
          type="button"
          onClick={onView}
          aria-label={`View details for ${subject}`}
          style={{
            padding: '8px 12px',
            background:
              'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(243,244,246,0))',
            color: '#2563EB',
            border: '1px solid #BFDBFE',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#EFF6FF';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(243,244,246,0))';
          }}
        >
          View
        </button>

        <button
          type="button"
          onClick={onApprove}
          aria-label={`Approve ${subject}`}
          style={{
            padding: '8px 12px',
            background: '#2563EB',
            color: '#ffffff',
            border: '1px solid #1E40AF',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            transition: 'all 150ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#1D4ED8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#2563EB';
          }}
        >
          Approve
        </button>

        <button
          type="button"
          onClick={onReject}
          aria-label={`Reject ${subject}`}
          style={{
            padding: '8px 12px',
            background: '#ffffff',
            color: '#EF4444',
            border: '1px solid #FCA5A5',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#FEF2F2';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          Reject
        </button>
      </td>
    </tr>
  );
}

/**
 * InboxTable renders a table-like list of inbox items with actions.
 * Sources data from localStorage key 'admin_inbox' and keeps it in sync.
 *
 * Expected localStorage format (key: 'admin_inbox'):
 * [
 *   { id?: string|number, email: string, submittedAt: string, codeOfConduct: boolean, nda: boolean, offerLetter: boolean }
 * ]
 *
 * We transform the above structure into internal rows:
 * { id, subject, fromEmail, receivedAt, status, codeOfConduct, nda, offerLetter }
 *
 * Status rule:
 * - If all three booleans true => 'approved'
 * - Otherwise => 'pending'
 */
// PUBLIC_INTERFACE
export default function InboxTable({
  items,
  onView,
  onApprove,
  onReject,
  storageKey = 'admin_inbox',
}) {
  // If parent passes items we prioritize them; otherwise load from localStorage.
  const [rows, setRows] = useState(Array.isArray(items) ? items : []);

  // Safe parse helper with SSR guard
  const safeGetLocal = useMemo(
    () =>
      function safeGetLocal(key, fallback) {
        if (typeof window === 'undefined') return fallback;
        try {
          const raw = window.localStorage.getItem(key);
          if (!raw) return fallback;
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : fallback;
        } catch {
          return fallback;
        }
      },
    []
  );

  // Transform admin_inbox entries into table rows
  const transformEntriesToRows = useCallback((entries) => {
    return (entries || []).map((e, idx) => {
      const subject = 'Onboarding Document Submissions';
      const from = e?.email || e?.from || 'unknown';
      const receivedAt = e?.submittedAt || '';
      const allDone =
        Boolean(e?.codeOfConduct) && Boolean(e?.nda) && Boolean(e?.offerLetter);
      const status = allDone ? 'approved' : 'pending';
      return {
        id: String(e?.id ?? idx),
        subject,
        fromEmail: from,
        receivedAt,
        status,
        codeOfConduct: Boolean(e?.codeOfConduct),
        nda: Boolean(e?.nda),
        offerLetter: Boolean(e?.offerLetter),
        _raw: e,
      };
    });
  }, []);

  // Initial load
  useEffect(() => {
    if (Array.isArray(items)) {
      // If parent controls items, just mirror them into component rows
      setRows(transformEntriesToRows(items));
      return;
    }
    const initial = safeGetLocal(storageKey, []);
    // Optionally seed empty array if not present
    if (typeof window !== 'undefined') {
      try {
        if (!window.localStorage.getItem(storageKey)) {
          window.localStorage.setItem(storageKey, JSON.stringify([]));
        }
      } catch {
        // ignore write errors
      }
    }
    setRows(transformEntriesToRows(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, storageKey, safeGetLocal, transformEntriesToRows]);

  // Listen to storage changes to refresh data across tabs
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleStorage = (ev) => {
      if (ev.key && ev.key !== storageKey) return;
      const next = safeGetLocal(storageKey, []);
      setRows(transformEntriesToRows(next));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey, safeGetLocal, transformEntriesToRows]);

  // PUBLIC_INTERFACE
  const toggleProvided = useCallback(
    (rowId, field) => {
      // field should be one of 'codeOfConduct' | 'nda' | 'offerLetter'
      if (typeof window === 'undefined') return;

      // Read from storage, robustly
      let current = safeGetLocal(storageKey, []);
      // Find the entry by matching id (string/number) or fallback by index
      const idx = current.findIndex((e, i) => String(e?.id ?? i) === String(rowId));
      if (idx === -1) return;

      // Immutable update of the specific boolean field
      const oldEntry = current[idx] || {};
      const nextValue = !Boolean(oldEntry[field]);
      const updatedEntry = { ...oldEntry, [field]: nextValue };

      // Write back immutably
      const nextArray = [...current];
      nextArray[idx] = updatedEntry;

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextArray));
      } catch {
        // ignore storage errors
      }

      // Update local state
      setRows(transformEntriesToRows(nextArray));
    },
    [safeGetLocal, storageKey, transformEntriesToRows]
  );

  const hasData = rows && rows.length > 0;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
      }}
      aria-label="Admin Inbox"
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #E5E7EB',
          background:
            'linear-gradient(90deg, rgba(37,99,235,0.06), rgba(249,250,251,1))',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            color: '#111827',
            fontWeight: 700,
          }}
        >
          Inbox
        </h2>
        <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize: 13 }}>
          Review pending requests and actions.
        </p>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            minWidth: 920,
          }}
        >
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '1px solid #E5E7EB',
                }}
                scope="col"
              >
                Subject
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '1px solid #E5E7EB',
                }}
                scope="col"
              >
                From
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '1px solid #E5E7EB',
                }}
                scope="col"
              >
                Received
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '1px solid #E5E7EB',
                }}
                scope="col"
              >
                Status
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px 16px',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '1px solid #E5E7EB',
                }}
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>

        <tbody>
            {hasData ? (
              rows.map((it) => (
                <InboxRow
                  key={it.id}
                  id={it.id}
                  subject={it.subject}
                  fromEmail={it.fromEmail ?? it.from}
                  receivedAt={it.receivedAt}
                  status={it.status}
                  codeOfConduct={it.codeOfConduct}
                  nda={it.nda}
                  offerLetter={it.offerLetter}
                  onToggleDoc={toggleProvided}
                  onView={() => onView?.(it._raw ?? it)}
                  onApprove={() => onApprove?.(it._raw ?? it)}
                  onReject={() => onReject?.(it._raw ?? it)}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: '#6B7280',
                    fontStyle: 'italic',
                  }}
                >
                  No inbox items yet. Submissions will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
