//
// Utility functions to manage client-side admin flags in localStorage.
// Stores a JSON object mapping email -> boolean under key 'lms_admin_map'.
//
// Note: This is intentionally non-secure and for local/dev usage only.
//

const ADMIN_MAP_KEY = 'lms_admin_map';

/**
 * Safely parse JSON, returning fallback on error.
 * @param {string|null} str
 * @param {any} fallback
 * @returns {any}
 */
function safeParse(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Get the current admin map from localStorage.
 * PUBLIC_INTERFACE
 * @returns {Record<string, boolean>}
 */
export function getAdminMap() {
  const raw = window.localStorage.getItem(ADMIN_MAP_KEY);
  const map = safeParse(raw, {});
  // Ensure only string keys and boolean values
  const cleaned = {};
  Object.keys(map || {}).forEach((k) => {
    cleaned[String(k).toLowerCase()] = Boolean(map[k]);
  });
  return cleaned;
}

/**
 * Set admin flag for a specific email.
 * PUBLIC_INTERFACE
 * @param {string} email
 * @param {boolean} isAdmin
 */
export function setAdminForEmail(email, isAdmin) {
  if (!email || typeof email !== 'string') return;
  const map = getAdminMap();
  map[email.toLowerCase()] = Boolean(isAdmin);
  window.localStorage.setItem(ADMIN_MAP_KEY, JSON.stringify(map));
}

/**
 * Check if a specific email is marked as admin.
 * PUBLIC_INTERFACE
 * @param {string} email
 * @returns {boolean}
 */
export function isAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const map = getAdminMap();
  const normalized = email.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(map, normalized)) {
    return Boolean(map[normalized]);
  }
  // Optional: hardcode a dev helper default for a specific email if desired.
  // For convenience, if not set, you can force default here, but we will not do that by default.
  return false;
}

/**
 * Clear the entire admin map.
 * PUBLIC_INTERFACE
 * Clears all locally stored admin flags.
 */
export function clearAdmin() {
  window.localStorage.removeItem(ADMIN_MAP_KEY);
}

export const __ADMIN_MAP_KEY__ = ADMIN_MAP_KEY;
