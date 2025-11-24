import { migrate, pool } from './client.js';

/**
 * PUBLIC_INTERFACE
 * CLI migrate runner
 * Executes SQL migrations in db/migrations directory.
 */
async function main() {
  try {
    await migrate();
    // eslint-disable-next-line no-console
    console.log('Migrations completed');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
