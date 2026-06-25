const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP' });
async function run() {
  try {
    await pool.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS gstin VARCHAR(15),
      ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) CHECK (customer_type IN ('Business', 'Individual')),
      ADD COLUMN IF NOT EXISTS primary_contact_salutation VARCHAR(10),
      ADD COLUMN IF NOT EXISTS primary_contact_first_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS primary_contact_last_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS work_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS mobile_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS customer_language VARCHAR(50),
      ADD COLUMN IF NOT EXISTS gst_treatment VARCHAR(100),
      ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(100),
      ADD COLUMN IF NOT EXISTS pan VARCHAR(20),
      ADD COLUMN IF NOT EXISTS tax_preference VARCHAR(50) CHECK (tax_preference IN ('Taxable', 'Tax Exempt', '')),
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
      ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100),
      ADD COLUMN IF NOT EXISTS enable_portal BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS customer_owner_id INT REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS other_details JSONB;
    `);
    console.log('Columns added successfully');
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
