import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

function resolveDatabaseUrl(): string {
  const raw =
    process.env.DATABASE_URL ??
    process.env.DATABASE_URL_POOLED ??
    process.env.POSTGRES_URL ??
    "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

  try {
    const parsed = new URL(raw);
    const isLocal =
      parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";

    // On Netlify/Vercel, if PGUSER / PGPASSWORD are provided as separate env vars,
    // let them override the credentials inside DATABASE_URL for remote hosts.
    if (!isLocal) {
      if (process.env.PGUSER?.trim()) {
        parsed.username = process.env.PGUSER.trim();
      }
      if (process.env.PGPASSWORD?.trim()) {
        parsed.password = process.env.PGPASSWORD.trim();
      }
      // Remove channel_binding=require which can cause pg pooler handshake errors
      parsed.searchParams.delete("channel_binding");
      if (!parsed.searchParams.has("sslmode")) {
        parsed.searchParams.set("sslmode", "require");
      }
    }

    return parsed.toString();
  } catch {
    return raw;
  }
}

const databaseUrl = resolveDatabaseUrl();

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.PG_POOL_MAX) || 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);
