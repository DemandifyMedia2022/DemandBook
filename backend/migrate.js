const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

async function migrate() {
  try {
    console.log('Connecting to DB...');
    
    // Drop existing invoice related tables
    const dropQueries = `
      DROP TABLE IF EXISTS invoice_activity_logs CASCADE;
      DROP TABLE IF EXISTS invoice_email_logs CASCADE;
      DROP TABLE IF EXISTS recurring_invoices CASCADE;
      DROP TABLE IF EXISTS invoice_attachments CASCADE;
      DROP TABLE IF EXISTS invoice_status_history CASCADE;
      DROP TABLE IF EXISTS invoice_payments CASCADE;
      DROP TABLE IF EXISTS invoice_items CASCADE;
      DROP TABLE IF EXISTS invoices CASCADE;
    `;
    console.log('Dropping existing invoice tables...');
    await pool.query(dropQueries);

    // Alter users role enum check
    console.log('Altering users table check constraint...');
    try {
      await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`);
      await pool.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'SALES_EXECUTIVE', 'VIEWER'));`);
    } catch (e) {
      console.log('Notice: Could not alter users role check constraint', e.message);
    }

    // Run schema.sql
    console.log('Running schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schemaSql);
    
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

migrate();
