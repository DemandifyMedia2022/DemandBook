const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

async function run() {
  try {
    console.log('Connecting to database to alter payments table...');
    await pool.query(`
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS other_details JSONB;
    `);
    console.log('Successfully added other_details JSONB column to payments table!');
  } catch (err) {
    console.error('Failed to alter payments table:', err.message);
  } finally {
    pool.end();
  }
}

run();
