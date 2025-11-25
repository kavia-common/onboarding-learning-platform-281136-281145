/**
 * Utilities for handling PDF data URLs and base64 decoding robustly.
 */

// PUBLIC_INTERFACE
export function isPdfDataUrl(value) {
  /** Returns true if value is a string starting with data:application/pdf */
  return !!(value && typeof value === 'string' && value.startsWith('data:application/pdf'));
}

// PUBLIC_INTERFACE
export function normalizePdfInput(maybe) {
  /** Returns a proper data:application/pdf;base64,... or '' if invalid. Supports raw base64 input. */
  if (!maybe || typeof maybe !== 'string') return '';
  if (maybe.startsWith('data:application/pdf')) return maybe;
  if (/^[A-Za-z0-9+/=\r\n]+$/.test(maybe.slice(0, 128))) {
    return `data:application/pdf;base64,${maybe}`;
  }
  return '';
}

// PUBLIC_INTERFACE
export function base64PdfToBlobUrl(dataUrl) {
  /** Converts a PDF data URL to a Blob URL, decoding base64 safely; returns { url, error }. */
  try {
    const normalized = normalizePdfInput(dataUrl);
    if (!isPdfDataUrl(normalized)) return { url: '', error: 'invalid-prefix' };
    const commaIdx = normalized.indexOf(',');
    if (commaIdx < 0) return { url: '', error: 'missing-comma' };
    const b64 = normalized.slice(commaIdx + 1);
    if (b64.length < 1024) return { url: '', error: 'too-small' };
    const clean = decodeURIComponent(b64.replace(/%0A/gi, '').replace(/%0D/gi, ''));
    const bin = atob(clean);
    if (!bin || bin.length === 0) return { url: '', error: 'empty-bin' };
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    if (!blob.size) return { url: '', error: 'zero-size' };
    const url = URL.createObjectURL(blob);
    return { url, error: '' };
  } catch (e) {
    return { url: '', error: 'exception' };
  }
}
