import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from './config/index.js';
import { pool } from './db/client.js';

/**
 * PUBLIC_INTERFACE
 * startServer
 * Starts the Express HTTP server for the Onboarding LMS backend.
 * - Environment variables:
 *   PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGINS, LOG_LEVEL, HEALTHCHECK_PATH
 * - Returns the created http.Server instance.
 */
export function startServer() {
  /** Create and configure the Express app, register health check, and start listening. */
  const app = express();

  const logger = pino({ level: config.LOG_LEVEL });
  app.use(pinoHttp({ logger }));

  // Security headers
  app.use(helmet());

  // CORS
  const origins = config.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  app.use(
    cors({
      origin: origins.length ? origins : true,
      credentials: true
    })
  );

  // Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Base metadata (OpenAPI placeholder)
  app.get('/openapi.json', (_req, res) => {
    const openapi = {
      openapi: '3.0.3',
      info: {
        title: 'Onboarding LMS Backend',
        description:
          'Scaffolded API for onboarding LMS. Routes TBD in later tasks. Includes health endpoint and DB connectivity.',
        version: '0.1.0'
      },
      tags: [
        { name: 'health', description: 'Service health and readiness' }
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
  app.get(config.HEALTHCHECK_PATH, async (_req, res) => {
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

  // Placeholder root
  app.get('/', (_req, res) => {
    res.json({
      service: 'onboarding_lms_backend',
      message: 'Backend scaffold is running. Implement routes in subsequent tasks.'
    });
  });

  const server = app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, health: config.HEALTHCHECK_PATH },
      `onboarding_lms_backend listening on :${config.PORT}`
    );
  });

  return server;
}

// If launched directly, start server.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  startServer();
}
