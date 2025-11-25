//
// Admin Inbox (v2) - localStorage-backed
// Schema for each inbox item (flat):
// {
//   email: string,
//   submittedAt: string (locale string),
//   codeOfConduct: boolean,
//   nda: boolean,
//   offerLetter: boolean,
//   // Optional PDF Data URLs (base64) generated client-side on Documents "Continue":
//   codeOfConductPdf?: string,
//   ndaPdf?: string,
//   offerLetterPdf?: string
// }
//
// Storage key: 'admin_inbox_v2'
// - Existing entries are preserved; new items appended safely.
// - Consumers should be resilient to missing fields.
// - PDFs should be 'data:application/pdf;base64,...'
//
// Includes SSR guards and safe JSON parsing.
//
 // PUBLIC_INTERFACE
export function getInboxItems() {
  /** Returns a list of inbox items from localStorage, resilient to parse errors and SSR. */
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('admin_inbox_v2');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function appendInboxItem(item) {
  /**
   * Appends a new inbox item while preserving any existing data.
   * Ensures we don't break older entries and handles non-array stored values.
   */
  if (typeof window === 'undefined') return false;
  try {
    const existingRaw = window.localStorage.getItem('admin_inbox_v2');
    let existing = [];
    try {
      existing = existingRaw ? JSON.parse(existingRaw) : [];
    } catch {
      existing = [];
    }
    const next = Array.isArray(existing) ? existing.slice() : [];
    // Normalize PDF fields to ensure proper data URL prefix and minimum size
    const normalizePdf = (v) => {
      if (!v || typeof v !== 'string') return '';
      let out = v;
      // Support raw base64 input
      if (!out.startsWith('data:application/pdf')) {
        // Heuristic: looks like base64?
        if (/^[A-Za-z0-9+/=\r\n]+$/.test(out.slice(0, 128))) {
          out = `data:application/pdf;base64,${out}`;
        }
      }
      // Only accept data:application/pdf
      if (!out.startsWith('data:application/pdf')) return '';
      const idx = out.indexOf(',');
      if (idx < 0) return '';
      const base64Part = out.slice(idx + 1);
      if (base64Part.length < 1024) return ''; // avoid storing tiny/truncated pdfs
      return out;
    };
    const normalized = {
      ...item,
      ...(item.codeOfConductPdf ? { codeOfConductPdf: normalizePdf(item.codeOfConductPdf) } : {}),
      ...(item.ndaPdf ? { ndaPdf: normalizePdf(item.ndaPdf) } : {}),
      ...(item.offerLetterPdf ? { offerLetterPdf: normalizePdf(item.offerLetterPdf) } : {}),
    };
    next.push(normalized);
    window.localStorage.setItem('admin_inbox_v2', JSON.stringify(next));
    // Dispatch event for same-tab updates
    window.dispatchEvent(new CustomEvent('admin_inbox_v2:update', { detail: { length: next.length } }));
    return true;
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
export function clearInbox() {
  /** Clears the v2 inbox entirely (dev only). */
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('admin_inbox_v2');
    window.dispatchEvent(new CustomEvent('admin_inbox_v2:update', { detail: { length: 0 } }));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function subscribe(callback) {
  /**
   * Subscribes to cross-tab and in-tab updates for the inbox.
   * Returns an unsubscribe function.
   */
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e) => {
    if (e.key === 'admin_inbox_v2') {
      callback(getInboxItems());
    }
  };
  const onCustom = () => callback(getInboxItems());
  window.addEventListener('storage', onStorage);
  window.addEventListener('admin_inbox_v2:update', onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('admin_inbox_v2:update', onCustom);
  };
}
