import React from 'react';

/**
 * InboxRow renders a single row for the Admin Inbox table.
 * This is a semantic button row with accessible labels; click handlers are passed via props.
 */
// PUBLIC_INTERFACE
export function InboxRow({
  id,
  subject,
  from,
  receivedAt,
  status,
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
      <td style={{ padding: '12px 16px', color: '#374151' }}>{from}</td>
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
        }}
      >
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
 * This keeps the provided click handlers intact, and uses semantic table elements.
 */
// PUBLIC_INTERFACE
export default function InboxTable({ items, onView, onApprove, onReject }) {
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
            minWidth: 720,
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
            {(items || []).map((it) => (
              <InboxRow
                key={it.id}
                id={it.id}
                subject={it.subject}
                from={it.from}
                receivedAt={it.receivedAt}
                status={it.status}
                onView={() => onView?.(it)}
                onApprove={() => onApprove?.(it)}
                onReject={() => onReject?.(it)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
