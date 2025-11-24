const API_BASE = process.env.REACT_APP_API_BASE;

// PUBLIC_INTERFACE
export async function postAcknowledgements(payload) {
  /**
   * Attempt to post acknowledgements to the backend if API_BASE is set.
   * Returns { ok: boolean, status?: number } and does not throw.
   */
  if (!API_BASE) {
    return { ok: false, status: 0 };
  }
  try {
    const res = await fetch(`${API_BASE}/acknowledgements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
