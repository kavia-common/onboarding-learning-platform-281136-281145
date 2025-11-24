# Onboarding LMS Backend (Scaffold)

Node.js + Express + PostgreSQL backend scaffold for the Onboarding LMS. This step includes:
- Project structure and configuration
- Healthcheck and basic middleware (CORS, Helmet, logging)
- PostgreSQL client and helpers
- Database schema via SQL migration(s)
- Seed data for initial documents and courses
- `.env.example` with required variables

API routes are intentionally not implemented in this step.

## Requirements

- Node.js >= 18
- PostgreSQL database
- Create a `.env` file (copy from `.env.example`) and set DATABASE_URL

## Getting Started

1) Install dependencies
```
npm install
```

2) Copy env file
```
cp .env.example .env
# Then edit .env to set DATABASE_URL and any other settings
```

3) Run migrations and seeds
```
npm run migrate
npm run seed
```

4) Start the server
```
npm run dev   # with nodemon (development)
# or
npm start     # plain node
```

- Server runs on PORT (default 4000)
- Health: GET ${HEALTHCHECK_PATH} (default `/healthz`)
- OpenAPI placeholder: GET /openapi.json

## Project Structure

```
onboarding_lms_backend/
  src/
    config/
      index.js         # env config loader
    db/
      client.js        # pg pool and helpers (migrate/seed)
      migrate.js       # CLI entry for migrations
      seed.js          # CLI entry for seeds
    middleware/        # (reserved for later)
    routes/            # (reserved for later)
    server.js          # Express app entrypoint
  db/
    migrations/
      001_init.sql     # schema
    seeds/
      001_seed.sql     # initial docs and courses
  .env.example
  package.json
  README.md
```

## Environment Variables

- PORT: default 4000
- DATABASE_URL: Postgres connection string (required)
- JWT_SECRET: secret for JWT signing (placeholder for future auth)
- CORS_ORIGINS: comma-separated list of allowed origins (default http://localhost:3000)
- LOG_LEVEL: pino log level (default info)
- HEALTHCHECK_PATH: default /healthz

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

- This scaffold is prepared for future REST API routes (auth, courses, progress, acknowledgements).
- Keep credentials in `.env` only—do not hardcode secrets in code.
- For production, consider enabling SSL for Postgres via `PGSSL=true`.

