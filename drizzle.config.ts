import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './db/migrations',
  schema: './db/schema/index.ts',
  dialect: 'postgresql',
    dbCredentials: {
    host: process.env.PGHOST!,
    port: Number(process.env.PGPORT!),
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
    ssl: false
  },
   migrations: {
    table: 'drizzle_migrations',
    schema: "public",
  },
});
