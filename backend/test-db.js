const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
  .then(res => {
    console.log('Tables in DemandERP:', res.rows.map(r => r.table_name));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to DemandERP:', err);
    process.exit(1);
  });
