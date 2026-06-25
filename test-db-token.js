// removed

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

async function run() {
  const email = 'sanjog@demandbooks.io'; // or any user
  const res = await pool.query('SELECT * FROM users LIMIT 1');
  if(res.rows.length === 0) {
    console.log('No users found');
    process.exit(0);
  }
  const user = res.rows[0];
  console.log('User:', user.email);

  // set token
  await pool.query("UPDATE users SET reset_token = 'testtoken123', reset_token_expires = NOW() + interval '1 hour' WHERE id = $1", [user.id]);
  console.log('Token set');

  const verify = await pool.query("SELECT id FROM users WHERE reset_token = 'testtoken123' AND reset_token_expires > NOW()");
  console.log('Verify:', verify.rows.length > 0 ? 'Success' : 'Failed');

  process.exit(0);
}

run();
