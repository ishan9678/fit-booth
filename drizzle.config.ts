import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './db/schema/index.ts',
  dialect: 'postgresql',
    dbCredentials: {
    host: process.env.PGHOST!,
    port: Number(process.env.PGPORT!),
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
  },
});
