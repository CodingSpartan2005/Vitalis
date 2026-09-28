import "dotenv/config";
import type { Config } from "drizzle-kit";

const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
} satisfies Config;
