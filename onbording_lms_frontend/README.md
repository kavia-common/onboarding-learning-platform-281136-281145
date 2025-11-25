# Onboarding LMS Frontend

Modern React app with router-driven layout, onboarding wizard, documents acknowledgment, basic course catalog, and frontend-only authentication by default.

## Features

- Router-driven pages: `/`, `/onboarding`, `/documents`, `/courses`, `/courses/:courseId`, `/dashboard`, `/login`, `/register`, `/logout`
- Documents Onboarding: View and acknowledge Code of Conduct, NDA, and Internship Letter with electronic signature
- Onboarding Wizard: Integrates the Documents step with welcome and next steps
- Auth Store: Frontend-only localStorage users and sessions by default (no backend required)
- Course and Progress Stores: LocalStorage with optional API sync if configured
- Feature Flags: via `REACT_APP_FEATURE_FLAGS` (JSON or comma list)
- Ocean Professional theme with accessibility and responsive layout
- Toast notifications for user feedback

## Getting Started

In the project directory, run:

- `npm start` — start dev server at http://localhost:3000
- `npm test` — run tests
- `npm run build` — production build

## Frontend-only mode (default)

This app now runs fully in the browser without any backend:

- Registration and Login store users in localStorage (non-production hashing used for demo only).
- Sessions are stored locally and used for protected routes.
- Documents acknowledgements and progress are persisted locally.
- No environment variables are required to use the app.

To reset local data:
- In your browser console, run:
  - `localStorage.removeItem('lms_users_v1')`  // clears registered users
  - `localStorage.removeItem('lms_auth')`      // clears current session
  - `localStorage.removeItem('onboarding_documents_ack')` // clears document acknowledgements
  - `localStorage.removeItem('lms_progress')` // clears progress
- Or clear browser site data for the app origin.

Note: The password hashing used is a simple base64 digest intended only for demonstration. Do not use this setup in production.

## Admin Role and Inbox (frontend-only)

- A default admin account is seeded automatically on first load if no admin exists:
  - Email: admin@dt3.local
  - Password: admin123
  - Role: admin
- Only users with role === "admin" can access the Admin page at /admin. Non-admins are redirected.
- Admin submissions inbox is stored in localStorage under key: dt3_admin_inbox.
  - Each entry: { submittedBy, submittedAt, codeOfConduct, nda, offerLetter }
  - Code of Conduct stores employee name and signature image (data URL) as captured on that page.
  - NDA stores consultant name/title/date and signature image (data URL).
  - Offer Letter stores the signature image (data URL).
- An "Admin" link appears in the navbar only if the current session user has role "admin".
- To manually promote an existing user to admin, you can, from app code via useAuth().makeAdmin(email) or via DevTools by editing lms_users_v1 to set role: "admin" for the desired user.

Resetting admin inbox:
- In browser console: localStorage.removeItem('dt3_admin_inbox')

## Optional Environment Variables

These variables are supported but not required:

- `REACT_APP_API_BASE` — API base URL for REST backend (e.g., http://localhost:4000).
- `REACT_APP_BACKEND_URL` — alternative API base (same as above). Trailing slashes are ignored automatically.
- `REACT_APP_FRONTEND_URL` — site URL (e.g., http://localhost:3000)
- `REACT_APP_WS_URL` — websocket URL (optional)
- `REACT_APP_NODE_ENV` — node env (optional)
- `REACT_APP_ENABLE_SOURCE_MAPS` — build maps (optional)
- `REACT_APP_PORT` — port (optional)
- `REACT_APP_TRUST_PROXY` — (optional)
- `REACT_APP_LOG_LEVEL` — (optional)
- `REACT_APP_HEALTHCHECK_PATH` — (optional)
- `REACT_APP_FEATURE_FLAGS` — JSON or comma list e.g. `{"onboarding":true}` or `onboarding,courses`.
- `REACT_APP_EXPERIMENTS_ENABLED` — (optional)
- `REACT_APP_PREVIEW_DOCUMENTS_ONLY` — when set to `true`, the app runs in Preview mode limited to the Documents flow only (see below)

If an API base is configured, course catalog/progress and acknowledgements may be synced to the backend on a best-effort basis. Core flows continue to work locally even if API calls fail.

## Preview Mode: Documents Only

To limit the running preview to only the Documents flow, set:

```
REACT_APP_PREVIEW_DOCUMENTS_ONLY=true
```

When enabled:
- `/documents` becomes the default route
- Direct access to other routes (`/`, `/onboarding`, `/catalog`, `/course/:id`, `/dashboard`, `/login`, `/register`, `/logout`) is redirected to `/documents`
- Navigation links for those routes are hidden/disabled
- A banner "Preview mode: Documents only" is shown below the navbar

When `false` or unset, the app behaves normally with all routes available.

## Documents Onboarding

Navigate to "Documents", review the required documents (Code of Conduct, NDA, and Internship Letter), and acknowledge:
- Check the agreement box
- Type your full name
- Select the date

Local state is stored in `localStorage`. If a backend is set, acknowledgements are posted on a best-effort basis; if posting fails, local data remains the source of truth.

### Code of Conduct: Export as PDF

On the Code of Conduct page, after entering your name and uploading your signature image, you can click "Export as PDF" to download a PDF containing:
- The policy content
- Your entered employee name
- An embedded thumbnail of your uploaded signature

This uses a purely client-side approach (html2canvas + jsPDF via CDN). If those libraries cannot load (e.g., offline or blocked), the app will fall back to the browser’s print dialog (`window.print()`), which uses a print-friendly layout. No backend calls or environment changes are required.

## Testing

Basic tests cover routing presence, documents page rendering, and protected route behavior.
