 // PUBLIC_INTERFACE
 /**
  * documentsStatusStore
  * Provides simple get/set helpers for document completion statuses in localStorage.
  * Namespaced structure:
  * {
  *   codeOfConduct: 'Completed' | 'Pending',
  *   nda: 'Completed' | 'Pending',
  *   offerLetter: 'Completed' | 'Pending'
  * }
  * Defaults to 'Pending' when unset.
  */
const STORAGE_KEY = 'documents_status_v1';

const defaults = {
  codeOfConduct: 'Pending',
  nda: 'Pending',
  offerLetter: 'Pending',
};

function readStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    // merge to ensure all keys exist
    return { ...defaults, ...(parsed || {}) };
  } catch {
    return { ...defaults };
  }
}

function writeStore(next) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaults, ...(next || {}) }));
  } catch {
    // ignore write failures
  }
}

// PUBLIC_INTERFACE
export function getDocumentsStatus() {
  /** Returns a copy of the documents status store. */
  return { ...readStore() };
}

// PUBLIC_INTERFACE
export function setDocumentCompleted(docKey) {
  /**
   * Marks a given document as Completed.
   * docKey: 'codeOfConduct' | 'nda' | 'offerLetter'
   */
  const store = readStore();
  if (docKey in store) {
    store[docKey] = 'Completed';
  }
  writeStore(store);
  return { ...store };
}

// PUBLIC_INTERFACE
export function setDocumentPending(docKey) {
  /**
   * Marks a given document as Pending.
   * docKey: 'codeOfConduct' | 'nda' | 'offerLetter'
   */
  const store = readStore();
  if (docKey in store) {
    store[docKey] = 'Pending';
  }
  writeStore(store);
  return { ...store };
}

// PUBLIC_INTERFACE
export function setDocumentsStatus(partial) {
  /**
   * Merges provided keys into the stored object. Useful for bulk updates.
   */
  const store = readStore();
  const next = { ...store, ...(partial || {}) };
  writeStore(next);
  return { ...next };
}
