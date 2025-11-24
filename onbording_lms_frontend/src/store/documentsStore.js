const STORAGE_KEY = 'onboarding_documents_ack';

const defaultState = {
  code_of_conduct: {
    key: 'code_of_conduct',
    name: 'Code of Conduct',
    acceptedAt: null,
    signatureName: '',
  },
  nda: {
    key: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    acceptedAt: null,
    signatureName: '',
  },
  internship_letter: {
    key: 'internship_letter',
    name: 'Internship Offer Letter',
    acceptedAt: null,
    signatureName: '',
  },
};

// PUBLIC_INTERFACE
export function loadAckState() {
  /** Load document acknowledgements from localStorage, falling back to defaults. */
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return { ...defaultState };
  }
}

// PUBLIC_INTERFACE
export function saveAckState(state) {
  /** Persist document acknowledgements to localStorage. */
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op if storage unavailable
  }
}

// PUBLIC_INTERFACE
export function isAllCompleted(state) {
  /** Returns true if all required documents have acceptedAt and signatureName. */
  return ['code_of_conduct', 'nda', 'internship_letter'].every((k) => {
    const d = state[k];
    return d && d.acceptedAt && d.signatureName && String(d.signatureName).trim().length > 1;
  });
}
