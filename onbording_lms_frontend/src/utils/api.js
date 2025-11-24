 /**
  * API utilities for frontend requests to the backend.
  * - Resolves and normalizes API base URL from env (REACT_APP_API_BASE or REACT_APP_BACKEND_URL)
  * - Provides helpers for auth headers and detailed error reporting
  * - Supports feature-flagged mock behavior ("mockApi" in REACT_APP_FEATURE_FLAGS) to verify flows in preview
  */

function resolveApiBase() {
  const raw =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '';
  const base = String(raw || '').trim();
  if (!base) return '';
  // Remove trailing slashes to avoid accidental double slashes in requests
  return base.replace(/\/+$/, '');
}

const API_BASE = resolveApiBase();

// Parse feature flags and check for "mockApi"
function isMockEnabled() {
  try {
    const raw = process.env.REACT_APP_FEATURE_FLAGS || '';
    if (!raw) return false;
    const t = raw.trim();
    if (t.startsWith('{') || t.startsWith('[')) {
      const data = JSON.parse(t);
      if (Array.isArray(data)) return data.includes('mockApi');
      return Boolean(data.mockApi);
    }
    // comma/space separated list
    return raw.split(',').map(s => s.trim()).includes('mockApi');
  } catch {
    return false;
  }
}

function getAuthToken() {
  try {
    const raw = window.localStorage.getItem('lms_auth');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.token || '';
  } catch {
    return '';
  }
}

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Build helpful network error details
function buildNetworkError(url, err, res) {
  const pageIsHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
  const apiIsHttp = /^http:\/\//i.test(url);
  const mixedContent = pageIsHttps && apiIsHttp;
  const isLikelyCors = err instanceof TypeError && !res;

  let message = `Network error while calling ${url}`;
  if (mixedContent) {
    message += ' (blocked mixed content: HTTPS page calling HTTP API). Ensure API is served over HTTPS.';
  } else if (isLikelyCors) {
    message += ' (possible CORS or connectivity issue).';
  }

  return {
    ok: false,
    status: res?.status ?? -1,
    url,
    message,
    corsHint: isLikelyCors
      ? 'If backend is different origin, ensure it allows this Origin via CORS and includes proper Access-Control-Allow-Origin.'
      : undefined,
    mixedContentHint: mixedContent
      ? 'Serve the API over HTTPS or use a relative/HTTPS URL.'
      : undefined
  };
}

// PUBLIC_INTERFACE
export async function postAcknowledgements(payload) {
  /**
   * Attempt to post acknowledgements to the backend if API_BASE is set.
   * Includes Authorization when available (JWT).
   * Returns { ok: boolean, status?: number, url?: string, message?: string } and does not throw.
   * If mockApi feature is enabled and backend is unreachable, returns a mocked success to validate UI flows.
   */
  if (!API_BASE) {
    return { ok: false, status: 0, url: '', message: 'API base URL not configured' };
  }
  const url = `${API_BASE}/acknowledgements`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        url,
        message: `Request failed (${res.status}) calling ${url}`
      };
    }
    return { ok: true, status: res.status, url };
  } catch (err) {
    if (isMockEnabled()) {
      // allow UI to proceed in preview even if backend is unreachable
      return { ok: true, status: 200, url: `${url} (mocked)` };
    }
    return buildNetworkError(url, err);
  }
}

/**
 * PUBLIC_INTERFACE
 * getApiBase
 * Returns the normalized API base URL resolved from environment variables.
 */
export function getApiBase() {
  return API_BASE;
}
