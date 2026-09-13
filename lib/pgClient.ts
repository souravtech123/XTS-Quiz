import { Pool } from 'pg';

// Singleton pg Pool — reused across hot-reloads in dev via globalThis
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please add it to your .env.local file.'
    );
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    // Keep connections alive; adjust for your hosting plan
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

// In development Next.js hot-reloads modules, which would create a new Pool
// on every reload and exhaust connections. We stash it on globalThis to reuse.
const pool: Pool =
  process.env.NODE_ENV === 'development'
    ? (globalThis._pgPool ??= createPool())
    : createPool();

export default pool;
