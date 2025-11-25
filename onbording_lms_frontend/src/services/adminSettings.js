//
// LocalStorage-backed admin settings service.
// Schema: { siteTitle: string, theme: 'light'|'dark', features: Record<string, boolean> }
//
const STORAGE_KEY = 'admin_settings_v1';

function seedIfEmpty() {
  const data = window.localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const seed = {
      siteTitle: 'Onboarding LMS',
      theme: 'light',
      features: {
        documents: true,
        courses: true,
        progress: true,
        experimentalUI: false,
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
}

function read() {
  seedIfEmpty();
  try {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return data || {};
  } catch {
    return {};
  }
}

function write(settings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// PUBLIC_INTERFACE
export function getSettings() {
  /** Retrieve current admin settings. */
  return read();
}

// PUBLIC_INTERFACE
export function updateSettings(patch) {
  /**
   * Update admin settings with partial fields.
   * Returns the updated settings object.
   */
  const curr = read();
  const next = {
    ...curr,
    siteTitle: patch.siteTitle ?? curr.siteTitle ?? 'Onboarding LMS',
    theme: patch.theme === 'dark' ? 'dark' : 'light',
    features: {
      ...(curr.features || {}),
      ...(patch.features || {}),
    },
  };
  write(next);
  return next;
}
