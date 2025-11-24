import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize pool once
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  // optional: SSL for hosted postgres; keep minimal scaffold
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
});

/**
 * PUBLIC_INTERFACE
 * runSqlFile
 * Executes a .sql file contents against the database connection pool.
 * - filePath: absolute path to the .sql file
 * Returns: Promise<void>
 */
export async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  // Split on semicolons that end statements while ignoring those in strings is complex.
  // For scaffold, send as one script; Postgres can handle multiple statements.
  await pool.query(sql);
}

/**
 * PUBLIC_INTERFACE
 * migrate
 * Runs all SQL files in db/migrations in filename order.
 */
export async function migrate() {
  const migrationsDir = path.resolve(__dirname, '../../db/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const f of files) {
    const full = path.join(migrationsDir, f);
    await runSqlFile(full);
  }
}

/**
 * PUBLIC_INTERFACE
 * seed
 * Runs all SQL files in db/seeds in filename order.
 */
export async function seed() {
  const seedsDir = path.resolve(__dirname, '../../db/seeds');
  const files = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const f of files) {
    const full = path.join(seedsDir, f);
    await runSqlFile(full);
  }
}
