const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

async function run() {
  console.log('Running database schema updates for inventory adjustments...');
  try {
    // 1. Create inventory_adjustments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_adjustments (
        id SERIAL PRIMARY KEY,
        mode VARCHAR(50) NOT NULL CHECK (mode IN ('Quantity', 'Value')),
        reference_number VARCHAR(100) UNIQUE NOT NULL,
        adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        account_name VARCHAR(255),
        reason VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        status VARCHAR(50) DEFAULT 'Approved' CHECK (status IN ('Approved', 'Draft')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create inventory_adjustment_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_adjustment_items (
        id SERIAL PRIMARY KEY,
        adjustment_id INT NOT NULL REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity_available NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        new_quantity_on_hand NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        quantity_adjusted NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        value_adjusted NUMERIC(15, 2) DEFAULT 0.00
      );
    `);

    // 3. Create inventory_adjustment_attachments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_adjustment_attachments (
        id SERIAL PRIMARY KEY,
        adjustment_id INT NOT NULL REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_data TEXT NOT NULL
      );
    `);

    console.log('Successfully created inventory adjustments tables!');
  } catch (err) {
    console.error('Failed to create inventory adjustments tables:', err);
  } finally {
    pool.end();
  }
}

run();
