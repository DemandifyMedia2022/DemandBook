const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP' });

async function run() {
  try {
    console.log('Starting manual journals database schema alteration...');

    // 1. Alter manual_journals table
    await pool.query(`
      ALTER TABLE manual_journals
      ADD COLUMN IF NOT EXISTS reverse_date DATE,
      ADD COLUMN IF NOT EXISTS publish_reverse BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS reporting_method VARCHAR(50) DEFAULT 'Accrual and Cash' CHECK (reporting_method IN ('Accrual and Cash', 'Accrual Only', 'Cash Only')),
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
    `);
    console.log('Altered manual_journals table successfully (added reverse_date, publish_reverse, reporting_method, currency)');

    // 2. Alter journal_entries table
    await pool.query(`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS contact_id INT REFERENCES clients(id) ON DELETE SET NULL;
    `);
    console.log('Altered journal_entries table successfully (added contact_id)');

    // 3. Create manual_journal_attachments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manual_journal_attachments (
        id SERIAL PRIMARY KEY,
        journal_id INT NOT NULL REFERENCES manual_journals(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_data TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created manual_journal_attachments table successfully');

    console.log('Database schema alteration completed successfully!');
  } catch (e) {
    console.error('Error altering database schema:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
