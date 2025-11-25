Frontend-only Admin Auth (Demo)
================================

This app implements a minimal, client-side only admin authentication for demo purposes. No external services (e.g., Supabase) are used.

How it works
- Users and sessions are stored in localStorage:
  - Users key: lms_users_v1
  - Session key: lms_auth
- Admin overrides can also be set via localStorage (see README_DEV_ADMIN.md).
- Passwords are stored with a simple demoDigest to avoid plaintext. This is NOT secure and should never be used in production.

Seeded admin user
- Email: abburi@kavia.com
- Password: Pallavi@123
- Role: admin
- Seeded automatically on first load (if not already present). Marked by flag dt3_admin_seeded_v1.

Routes
- /admin/login: Admin login page
- /admin: Admin dashboard (admin-only route; redirects to /admin/login if not authenticated as admin)

Navbar
- Shows an Admin link.
  - If user is admin: goes to /admin
  - Otherwise: goes to /admin/login

Notes
- This is intended for local demos only. Any user can modify localStorage and bypass the gate.
- Do not use this for production security.
