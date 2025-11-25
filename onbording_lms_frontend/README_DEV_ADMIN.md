Local Dev Admin Override (Client-side Only)
===========================================

This project includes a simple, non-secure client-side admin override using `localStorage`. It is intended for local development and testing only. Do not rely on this for production security.

How it works
------------
- The utility at `src/utils/adminLocalStorage.js` stores a JSON map under localStorage key `lms_admin_map`, mapping `email -> true/false`.
- The auth store (`src/store/authStore.js`) computes a derived `currentUserIsAdmin` after auth/session changes using `isAdminEmail(email)`.
- A dev helper at `src/dev/setAdmin.js` exposes console functions like `setAdminEmail`.

Console usage
-------------
1) Grant admin to an email (e.g., abburi@kavia.com):
   setAdminEmail('abburi@kavia.com')

2) Revoke admin for an email:
   setAdminForEmail('abburi@kavia.com', false)

3) Clear all admin flags:
   clearAdmin()

Notes:
- After toggling admin flags, if the UI doesn't update, re-trigger auth state or refresh the page so the store recomputes `currentUserIsAdmin`.

API Reference (client-only)
---------------------------
- getAdminMap(): returns current `{ [email: string]: boolean }`
- setAdminForEmail(email, isAdmin): sets admin flag for the email
- isAdminEmail(email): returns boolean derived from the stored map
- clearAdmin(): removes the map key `lms_admin_map` from localStorage

Important caveats
-----------------
- This is not secure. Any user can modify localStorage and bypass the gate.
- Do not connect this to server-side authorization or database RLS.
- Intended only for local testing and development.
