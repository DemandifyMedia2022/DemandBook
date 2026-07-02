const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Connecting to database to alter payments_made table...');
    await pool.query(`
      ALTER TABLE payments_made
      ADD COLUMN IF NOT EXISTS paid_through VARCHAR(100) DEFAULT 'HDFC Bank Account',
      ADD COLUMN IF NOT EXISTS amount_refunded NUMERIC(15, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS bill_allocations JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('Successfully altered payments_made table with new fields!');
  } catch (err) {
    console.error('Failed to alter payments_made table:', err.message);
  } finally {
    pool.end();
  }
}

run();
