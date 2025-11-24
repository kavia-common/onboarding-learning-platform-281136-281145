# Onboarding LMS Backend (API)

Node.js + Express + PostgreSQL backend for the Onboarding LMS.

- CORS (reads CORS_ORIGINS or FRONTEND_URL vars), Helmet security headers, pino logging
- JWT auth (register, login, me)
- Documents listing and acknowledgements
- Catalog and Courses (with modules)
- Progress endpoints
- Healthcheck and OpenAPI stub
- PostgreSQL client, migrations, and seeds

## Requirements

- Node.js >= 18
- PostgreSQL database
- Create a `.env` file (copy from `.env.example`) and set DATABASE_URL and JWT_SECRET

## Getting Started

1) Install dependencies
```
npm install
```

2) Copy env file
```
cp .env.example .env
# Edit .env to set DATABASE_URL, JWT_SECRET, and CORS_ORIGINS/FRONTEND_URL
```

3) Run migrations and seeds
```
npm run migrate
npm run seed
```

4) Start the server
```
npm run dev   # development with nodemon
# or
npm start     # production
```

- Server runs on PORT (default 4000)
- Health: GET ${HEALTHCHECK_PATH} (default `/healthz`)
- OpenAPI: GET /openapi.json

## API Endpoints

Auth (JSON)
- POST /auth/register
  - body: { email: string, password: string, name?: string }
  - returns: { token, user }
- POST /auth/login
  - body: { email: string, password: string }
  - returns: { token, user }
- GET /me
  - header: Authorization: Bearer <token>
  - returns: { user }

Documents
- GET /documents
  - returns: [{ key, name, version, content_url }]
- POST /acknowledgements
  - headers (optional): Authorization: Bearer <token>
  - body: { userId?: string, documents: [{ key, signatureName, acceptedAt, name? }] }
  - returns: { ok: true, userId }

Catalog and Courses
- GET /catalog
  - returns: courses [{ id, title, description, category }]
- GET /courses
  - same as /catalog
- GET /courses/:id
  - returns: { id, title, description, category, modules: [...] }
- GET /courses/:id/modules
  - returns: modules for a course

Progress
- POST /progress
  - header: Authorization: Bearer <token>
  - body: { courseId: uuid, percent: number }
  - returns: { ok: true, courseId, percent }
- PATCH /modules/:id/complete
  - header: Authorization: Bearer <token>
  - returns: { ok: true, moduleId, status: 'completed' }

Health
- GET /healthz (or HEALTHCHECK_PATH)

## Environment Variables

- PORT: default 4000
- DATABASE_URL: Postgres connection string (required)
- JWT_SECRET: secret for JWT signing
- CORS_ORIGINS: comma-separated list of allowed origins (default http://localhost:3000)
- FRONTEND_URL / REACT_APP_FRONTEND_URL: also considered for CORS
- LOG_LEVEL: pino log level (default info)
- HEALTHCHECK_PATH: default /healthz
- PGSSL: set to "true" to enable SSL

Frontend passthrough variables included for convenience in `.env.example`:
- REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL,
  REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS,
  REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH,
  REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED

## Database

Schema includes:
- users
- documents
- acknowledgements
- courses
- modules
- enrollments
- progress

Initial seed inserts:
- documents: code_of_conduct (v1), nda (v1)
- courses: Company Onboarding 101, Product Overview

## Notes

- Keep credentials in `.env` only—do not hardcode secrets in code.
- For production, consider enabling SSL for Postgres via `PGSSL=true`.
- Acknowledgements support mock-friendly default: when unauthenticated and no userId provided, a mock user is created.

