const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  '';

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
   * Attempt to post acknowledgements to the backend if API_BASE is set.
   * Includes Authorization when available (JWT).
   * Returns { ok: boolean, status?: number } and does not throw.
   */
  if (!API_BASE) {
    return { ok: false, status: 0 };
  }
  try {
    const res = await fetch(`${API_BASE}/acknowledgements`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch {
    return { ok: false, status: -1 };
  }
}

// PUBLIC_INTERFACE
export function getApiBase() {
  return API_BASE;
}
