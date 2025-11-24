import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from './config/index.js';
import { pool } from './db/client.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { authRouter } from './routes/auth.js';
import { documentsRouter } from './routes/documents.js';
import { coursesRouter } from './routes/courses.js';
import { progressRouter } from './routes/progress.js';

/**
 * PUBLIC_INTERFACE
 * startServer
 * Starts the Express HTTP server for the Onboarding LMS backend.
 * - Environment variables:
 *   PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGINS, LOG_LEVEL, HEALTHCHECK_PATH
 * - Returns the created http.Server instance.
 */
export function startServer() {
  /** Create and configure the Express app, register routes and start listening. */
  const app = express();

  const logger = pino({ level: config.LOG_LEVEL });
  app.use(pinoHttp({ logger }));

  // Security headers
  app.use(helmet());

  // CORS (support FRONTEND_URL fallbacks)
  const envOrigins = [
    process.env.FRONTEND_URL,
    process.env.REACT_APP_FRONTEND_URL,
    process.env.REACT_APP_API_BASE,
    ...String(config.CORS_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  ].filter(Boolean);
  const uniqueOrigins = Array.from(new Set(envOrigins));
  app.use(
    cors({
      origin: uniqueOrigins.length ? uniqueOrigins : true,
      credentials: true
    })
  );

  // Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Base metadata (OpenAPI)
  app.get('/openapi.json', (_req, res) => {
    const openapi = {
      openapi: '3.0.3',
      info: {
        title: 'Onboarding LMS Backend',
        description:
          'REST API for onboarding LMS with auth, documents, courses, and progress.',
        version: '1.0.0'
      },
      tags: [
        { name: 'health', description: 'Service health and readiness' },
        { name: 'auth', description: 'Authentication' },
        { name: 'documents', description: 'Onboarding documents' },
        { name: 'catalog', description: 'Course catalog' },
        { name: 'courses', description: 'Course and modules' },
        { name: 'progress', description: 'Learning progress' }
      ],
      paths: {
        [config.HEALTHCHECK_PATH]: {
          get: {
            summary: 'Healthcheck',
            description:
              'Returns service liveness and basic database connectivity check.',
            tags: ['health'],
            responses: {
              '200': { description: 'OK' },
              '500': { description: 'Service unavailable' }
            }
          }
        }
      }
    };
    res.json(openapi);
  });

  /**
   * Healthcheck endpoint
   * Attempts a lightweight DB query to confirm connectivity.
   */
  app.get(config.HEALTHCHECK_PATH, async (req, res) => {
    try {
      const dbOk = await pool
        .query('SELECT 1 as ok')
        .then(() => true)
        .catch(() => false);
      res.status(200).json({
        status: 'ok',
        service: 'onboarding_lms_backend',
        db: dbOk ? 'up' : 'down',
        time: new Date().toISOString()
      });
    } catch (err) {
      req.log?.error({ err }, 'Healthcheck error');
      res.status(500).json({ status: 'error' });
    }
  });

  // Routes
  app.use('/auth', authRouter);
  app.use('/', documentsRouter); // GET /documents, POST /acknowledgements
  app.use('/', coursesRouter);   // GET /catalog, /courses, /courses/:id, /courses/:id/modules
  app.use('/', progressRouter);  // POST /progress, PATCH /modules/:id/complete

  // Placeholder root
  app.get('/', (_req, res) => {
    res.json({
      service: 'onboarding_lms_backend',
      message: 'Backend API is running. See /openapi.json for docs.'
    });
  });

  // errors
  app.use(notFound);
  app.use(errorHandler);

  const server = app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, health: config.HEALTHCHECK_PATH, cors: uniqueOrigins },
      `onboarding_lms_backend listening on :${config.PORT}`
    );
  });

  return server;
}

// If launched directly, start server.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  startServer();
}
