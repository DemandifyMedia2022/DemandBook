const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:sanjog123@localhost:5432/DemandERP',
});

const query = `
CREATE TABLE IF NOT EXISTS organization_profile (
    id SERIAL PRIMARY KEY,
    logo_url VARCHAR(255),
    organization_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    
    -- Location
    address_street TEXT,
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip VARCHAR(50),
    address_country VARCHAR(100),
    phone VARCHAR(50),
    fax VARCHAR(50),
    website_url VARCHAR(255),
    different_payment_address BOOLEAN DEFAULT FALSE,
    
    -- Primary Contact
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    
    -- Preferences
    base_currency VARCHAR(10) DEFAULT 'USD',
    fiscal_year VARCHAR(50) DEFAULT 'Jan - Dec',
    report_basis VARCHAR(50) CHECK (report_basis IN ('Accrual', 'Cash')) DEFAULT 'Accrual',
    organization_language VARCHAR(50) DEFAULT 'English',
    communication_languages VARCHAR(255),
    time_zone VARCHAR(100) DEFAULT 'UTC',
    date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    company_id VARCHAR(100),
    
    -- Other
    additional_fields JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_organization_profile_updated_at ON organization_profile;
CREATE TRIGGER update_organization_profile_updated_at
    BEFORE UPDATE ON organization_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

pool.query(query)
  .then(() => {
    console.log('Successfully created organization_profile table.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating table:', err);
    process.exit(1);
  });
