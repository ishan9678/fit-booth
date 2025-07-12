export const dbConfig = {
  host: process.env.PGHOST!,
  port: Number(process.env.PGPORT!),
  user: process.env.PGUSER!,
  password: process.env.PGPASSWORD!,
  database: process.env.PGDATABASE!,
};

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Connection pool settings
export const poolConfig = {
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};