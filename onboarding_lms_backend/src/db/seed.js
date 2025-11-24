import { seed, pool } from './client.js';

/**
 * PUBLIC_INTERFACE
 * CLI seed runner
 * Executes SQL seed files in db/seeds directory.
 */
async function main() {
  try {
    await seed();
    // eslint-disable-next-line no-console
    console.log('Seeding completed');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
