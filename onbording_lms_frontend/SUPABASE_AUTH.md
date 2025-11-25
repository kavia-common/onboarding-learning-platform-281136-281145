# Supabase Authentication (Frontend)

This app supports Supabase Auth (email/password) with a graceful local fallback when environment variables are missing.

## Environment variables

Add these to your environment (e.g., .env):

- REACT_APP_SUPABASE_URL=<your-supabase-url>
- REACT_APP_SUPABASE_KEY=<your-anon-key>  (alias REACT_APP_SUPABASE_ANON_KEY also supported for backward-compat)
- REACT_APP_FRONTEND_URL=<your-site-url>  (used for emailRedirectTo)

If REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY are missing, the app automatically falls back to local-only auth (localStorage).

Do not commit a real .env. Provide them via deployment or local environment.

## Role handling

- Admin route guard checks user.role === 'admin'.
- With Supabase, role is derived from user_metadata.app_role on the authenticated user.
  - Set app_role to "admin" for an admin user via Supabase:
    - In the Supabase dashboard > Authentication > Users, edit the user's user_metadata and add:
      {
        "app_role": "admin",
        "name": "Jane Admin"
      }
  - If app_role is absent, user defaults to "user".

## Signup redirect

During sign up, the app sets emailRedirectTo to REACT_APP_FRONTEND_URL + "/documents".
Adjust REACT_APP_FRONTEND_URL to match your deployment URL.

## Offline/local fallback

When Supabase env is not configured:
- Registration/login happen in localStorage.
- A default admin is seeded (admin@dt3.local / admin123) on first load if no admin exists.
- Documents and progress remain stored locally.

## Where the code is

- Supabase client: src/lib/supabaseClient.js
- Auth store (Supabase + fallback): src/store/authStore.js
- UI forms show loading/error states in App routes (/login, /register).
