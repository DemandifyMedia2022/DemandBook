const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

async function migrate() {
  try {
    console.log('Connecting to DB to apply expansion schema...');
    const schemaPath = path.join(__dirname, 'schema_expansion.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schemaSql);
    console.log('Expansion migration successful!');
  } catch (err) {
    console.error('Expansion migration failed:', err);
  } finally {
    pool.end();
  }
}

migrate();
