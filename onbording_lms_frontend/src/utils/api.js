 /**
  * API utilities in frontend-only mode.
  * Auth flows are handled entirely in localStorage; network is optional and not required.
  * Environment variables remain supported but are not required.
  */

function resolveApiBase() {
  const raw =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '';
  const base = String(raw || '').trim();
  if (!base) return '';
  return base.replace(/\/*$/, '');
}

const API_BASE = resolveApiBase();

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

// PUBLIC_INTERFACE
export async function postAcknowledgements(payload) {
  /**
   * PUBLIC_INTERFACE
   * postAcknowledgements
   * In frontend-only mode, we always return ok: true after persisting locally.
   * If an API base is configured, we make a best-effort POST; failures are ignored.
   */
  // Persist locally to allow resume
  try {
    const raw = window.localStorage.getItem('onboarding_documents_ack');
    const existing = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem('onboarding_documents_ack', JSON.stringify({ ...existing, lastSubmitted: payload }));
  } catch {
    // ignore
  }

  if (!API_BASE) {
    return { ok: true, status: 200, url: '' };
  }

  const url = `${API_BASE}/acknowledgements`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // degrade gracefully to local only
      return { ok: true, status: 200, url: '' };
    }
    return { ok: true, status: res.status, url };
  } catch {
    // degrade gracefully
    return { ok: true, status: 200, url: '' };
  }
}

/**
 * PUBLIC_INTERFACE
 * getApiBase
 * Returns the normalized API base URL resolved from environment variables (may be empty).
 */
export function getApiBase() {
  return API_BASE;
}
