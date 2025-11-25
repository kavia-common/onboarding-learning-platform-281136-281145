//
// Developer helper: exposes window functions to toggle admin per email.
//
// Usage from browser console:
//   setAdminEmail('abburi@kavia.com'); // grant admin
//   setAdminForEmail('someone@example.com', false); // revoke for specific email
//   clearAdmin(); // clear all local admin flags
//
// Note: This is intentionally non-secure and for local testing only.
//

import { setAdminForEmail, clearAdmin } from '../utils/adminLocalStorage';

// PUBLIC_INTERFACE
export function attachAdminHelpersToWindow() {
  if (typeof window === 'undefined') return;
  if (!window.setAdminEmail) {
    window.setAdminEmail = function setAdminEmail(email) {
      setAdminForEmail(email, true);
      console.info('[Dev] Admin set to TRUE for', email);
    };
  }
  if (!window.setAdminForEmail) {
    window.setAdminForEmail = function setAdmin(email, isAdmin) {
      setAdminForEmail(email, !!isAdmin);
      console.info('[Dev] Admin set to', !!isAdmin, 'for', email);
    };
  }
  if (!window.clearAdmin) {
    window.clearAdmin = function clear() {
      clearAdmin();
      console.info('[Dev] Admin map cleared');
    };
  }
}

// Auto-attach on import
attachAdminHelpersToWindow();
