import dotenv from 'dotenv';

dotenv.config();

/**
 * PUBLIC_INTERFACE
 * config
 * Provides typed access to environment configuration for the backend.
 * Required values should be set via .env; this module does not read .env directly in code beyond dotenv.config().
 */
export const config = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  HEALTHCHECK_PATH: process.env.HEALTHCHECK_PATH || '/healthz'
};
