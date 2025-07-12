import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  host: process.env.PGHOST!,
  port: Number(process.env.PGPORT!),
  user: process.env.PGUSER!,
  password: process.env.PGPASSWORD!,
  database: process.env.PGDATABASE!,
  ssl: false
});

export const db: any = drizzle(pool, { schema });