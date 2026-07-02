const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

async function run() {
  console.log('Running database alteration for products table...');
  try {
    // Add columns if they do not exist
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Goods' CHECK (type IN ('Goods', 'Service')),
      ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'pcs',
      ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tax_preference VARCHAR(50) DEFAULT 'Taxable',
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS selling_price NUMERIC(15, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS sales_account VARCHAR(255),
      ADD COLUMN IF NOT EXISTS sales_description TEXT,
      ADD COLUMN IF NOT EXISTS cost_price NUMERIC(15, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS purchase_account VARCHAR(255),
      ADD COLUMN IF NOT EXISTS purchase_description TEXT,
      ADD COLUMN IF NOT EXISTS preferred_vendor_id INT REFERENCES clients(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS intra_state_tax_rate VARCHAR(50) DEFAULT 'GST18 (18 %)',
      ADD COLUMN IF NOT EXISTS inter_state_tax_rate VARCHAR(50) DEFAULT 'IGST18 (18 %)',
      ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT TRUE;
    `);

    console.log('Successfully altered products table to support extended fields!');
  } catch (err) {
    console.error('Failed to alter products table:', err);
  } finally {
    pool.end();
  }
}

run();
