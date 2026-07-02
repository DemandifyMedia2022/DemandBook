const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

async function run() {
  try {
    console.log('Connecting to database to alter vendor_credits table...');
    
    // 1. Alter table
    await pool.query(`
      ALTER TABLE vendor_credits
      ADD COLUMN IF NOT EXISTS order_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS subject VARCHAR(250),
      ADD COLUMN IF NOT EXISTS accounts_payable VARCHAR(100) DEFAULT 'Accounts Payable',
      ADD COLUMN IF NOT EXISTS reverse_charge BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS sub_total NUMERIC(15, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS tds VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tcs VARCHAR(100),
      ADD COLUMN IF NOT EXISTS adjustment NUMERIC(15, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS total NUMERIC(15, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
    `);

    // 2. Adjust constraint on status if check constraint exists
    try {
      await pool.query(`
        ALTER TABLE vendor_credits DROP CONSTRAINT IF EXISTS vendor_credits_status_check;
      `);
      await pool.query(`
        ALTER TABLE vendor_credits 
        ADD CONSTRAINT vendor_credits_status_check 
        CHECK (status IN ('Draft', 'Open', 'Refunded', 'Void', 'Partially Used', 'Fully Used', 'Expired'));
      `);
    } catch (e) {
      console.log('Status check alteration skipped or not needed:', e.message);
    }

    console.log('Successfully altered vendor_credits table with new columns!');
  } catch (err) {
    console.error('Failed to alter vendor_credits table:', err.message);
  } finally {
    pool.end();
  }
}

run();
