const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

const query = `
UPDATE users SET role = 'SUPER_ADMIN';
`;

pool.query(query)
  .then(() => {
    console.log('Successfully updated all users to SUPER_ADMIN role.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error updating users:', err);
    process.exit(1);
  });
