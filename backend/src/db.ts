import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const result = dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
console.log('[DOTENV DEBUG] Result:', result);
console.log('[DOTENV DEBUG] Database URL:', process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('PostgreSQL connection pool initialized.');
});

pool.on('error', (err) => {
  console.error('Idle client database pool error:', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
