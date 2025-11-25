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
// - We do NOT break existing data. Existing entries (from earlier versions) are preserved.
// - New items are appended safely.
// - Consumers should be resilient to missing fields.
//
// Includes:
// - safeParse JSON
// - SSR guard for window access
// - subscribe() to listen to storage changes across tabs
//

const INBOX_KEY = 'admin_inbox_v2';

// PUBLIC_INTERFACE
export function getInboxItems() {
  /** Returns a list of inbox items from localStorage, resilient to parse errors and SSR. */
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(INBOX_KEY);
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
    const existing = getInboxItems();
    const next = Array.isArray(existing) ? existing.slice() : [];
    next.push({ ...item });
    window.localStorage.setItem(INBOX_KEY, JSON.stringify(next));
    // Dispatch a custom event for same-tab updates if needed
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
    window.localStorage.removeItem(INBOX_KEY);
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
    if (e.key === INBOX_KEY) {
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

export const __INBOX_KEY__ = INBOX_KEY;
