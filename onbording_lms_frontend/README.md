# Onboarding LMS Frontend

Modern React app with router-driven layout, onboarding wizard, documents acknowledgment, basic course catalog, and auth with mock fallback.

## Features

- Router-driven pages: `/`, `/onboarding`, `/documents`, `/catalog`, `/course/:id`, `/dashboard`, `/login`, `/register`, `/logout`
- Documents Onboarding: View and acknowledge Code of Conduct, NDA, and Internship Letter with electronic signature
- Onboarding Wizard: Integrates the Documents step with welcome and next steps
- Auth Store: JWT handling with mock fallback when no API is configured
- Course and Progress Stores: LocalStorage with optional API sync
- Feature Flags: via `REACT_APP_FEATURE_FLAGS` (JSON or comma list)
- Ocean Professional theme with accessibility and responsive layout
- Toast notifications for user feedback

## Getting Started

In the project directory, run:

- `npm start` — start dev server at http://localhost:3000
- `npm test` — run tests
- `npm run build` — production build

## Environment Variables

Copy `.env.example` to `.env` and set as needed:

- `REACT_APP_API_BASE` — API base URL for REST backend (e.g., http://localhost:4000). If both are set, this takes precedence.
- `REACT_APP_BACKEND_URL` — alternative API base (same as above if used). Trailing slashes are ignored automatically.
- `REACT_APP_FRONTEND_URL` — site URL (e.g., http://localhost:3000)
- `REACT_APP_WS_URL` — websocket URL (optional)
- `REACT_APP_NODE_ENV` — node env (optional)
- `REACT_APP_ENABLE_SOURCE_MAPS` — build maps (optional)
- `REACT_APP_PORT` — port (optional)
- `REACT_APP_TRUST_PROXY` — (optional)
- `REACT_APP_LOG_LEVEL` — (optional)
- `REACT_APP_HEALTHCHECK_PATH` — (optional)
- `REACT_APP_FEATURE_FLAGS` — JSON or comma list e.g. `{"onboarding":true}` or `onboarding,courses`
- `REACT_APP_EXPERIMENTS_ENABLED` — (optional)
- `REACT_APP_PREVIEW_DOCUMENTS_ONLY` — when set to `true`, the app runs in Preview mode limited to the Documents flow only (see below)

If neither `REACT_APP_API_BASE` nor `REACT_APP_BACKEND_URL` is set:
- Auth, Courses, and Progress stores use mock/localStorage behavior
- Documents submissions are stored locally; attempts to post to server are skipped

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

## API Conventions (when configured)

- Auth: `POST /auth/login`, `POST /auth/register`
- Courses: `GET /courses`
- Progress: `PUT /progress/:courseId`
- Documents: `POST /acknowledgements`

All requests use JSON.

## Documents Onboarding

Navigate to "Documents", review the required documents (Code of Conduct, NDA, and Internship Letter), and acknowledge:
- Check the agreement box
- Type your full name
- Select the date

Local state is stored in `localStorage`. If a backend is set, acknowledgements are posted as:
```json
{
  "userId": "mock-or-todo",
  "documents": [{ "key": "code_of_conduct", "acceptedAt": "...", "name": "Code of Conduct", "signatureName": "..." }]
}
```

If posting fails, the app falls back to local storage.

## Testing

Basic tests cover routing presence, documents page rendering, and protected route behavior.
