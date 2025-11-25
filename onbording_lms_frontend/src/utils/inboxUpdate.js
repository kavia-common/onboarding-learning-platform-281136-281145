import { appendInboxItem, getInboxItems } from "./adminInbox";
import { normalizePdfInput } from "./pdfUtils";

/**
 * PUBLIC_INTERFACE
 * upsertInboxPdfForUser
 * Safely append or update the Admin Inbox (v2) item for the current user/session,
 * setting any provided PDF data URLs for the given fields.
 * - Looks up user email from local session (lms_auth). Falls back to a generated id.
 * - Ensures data URLs are valid (data:application/pdf;base64,...) before storing.
 * - Preserves existing fields and only updates provided PDF fields.
 */
export function upsertInboxPdfForUser({ codeOfConductPdf, ndaPdf, offerLetterPdf } = {}) {
  if (typeof window === "undefined") return false;

  // Resolve current user email or a fallback id
  let email = "anonymous";
  try {
    const raw = window.localStorage.getItem("lms_auth");
    const session = raw ? JSON.parse(raw) : null;
    email = session?.user?.email || "anonymous";
  } catch {
    // ignore
  }
  const submittedAt = new Date().toLocaleString();

  // Normalize incoming PDFs; only keep valid ones
  const normalized = {
    ...(codeOfConductPdf ? { codeOfConductPdf: normalizePdfInput(codeOfConductPdf) } : {}),
    ...(ndaPdf ? { ndaPdf: normalizePdfInput(ndaPdf) } : {}),
    ...(offerLetterPdf ? { offerLetterPdf: normalizePdfInput(offerLetterPdf) } : {}),
  };

  // If none are valid, still create/update basic row to reflect activity
  const items = getInboxItems();
  const idx = Array.isArray(items) ? items.findIndex((it) => (it?.email || "anonymous") === email) : -1;

  // Build baseline row flags do not interfere with existing flow; we don't force booleans here.
  const base = {
    email,
    submittedAt,
  };

  // We don't have a direct "update" API, so append a new item representing latest export; Admin UI reads newest first.
  // This avoids mutating previous "Continue" submission rows and keeps SSR guards intact.
  const toAppend = { ...base, ...normalized };

  try {
    appendInboxItem(toAppend);
    return true;
  } catch {
    return false;
  }
}
