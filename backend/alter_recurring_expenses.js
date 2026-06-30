const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

async function run() {
  try {
    console.log('Connecting to database to alter recurring_expenses table...');
    await pool.query(`
      ALTER TABLE recurring_expenses
      ADD COLUMN IF NOT EXISTS other_details JSONB;
    `);
    console.log('Successfully added other_details JSONB column to recurring_expenses table!');
  } catch (err) {
    console.error('Failed to alter recurring_expenses table:', err.message);
  } finally {
    pool.end();
  }
}

run();
