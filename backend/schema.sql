-- ==========================================
-- PostgreSQL Database Initialization Script
-- ==========================================

-- 1. Users Table (Staff & Client Accounts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'SALES_EXECUTIVE', 'VIEWER')),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Sessions Table (Secure JWT Session Logs)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- 3. Clients Table (Unified Customers & Vendors)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    custom_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'CUST-4092' or 'VEND-2041'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) DEFAULT '—',
    type VARCHAR(50) NOT NULL CHECK (type IN ('customer', 'vendor')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    
    -- Additional Customer Details
    gstin VARCHAR(15),
    customer_type VARCHAR(50) CHECK (customer_type IN ('Business', 'Individual')),
    primary_contact_salutation VARCHAR(10),
    primary_contact_first_name VARCHAR(100),
    primary_contact_last_name VARCHAR(100),
    company_name VARCHAR(255),
    display_name VARCHAR(255),
    work_phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    customer_language VARCHAR(50),
    gst_treatment VARCHAR(100),
    place_of_supply VARCHAR(100),
    pan VARCHAR(20),
    tax_preference VARCHAR(50) CHECK (tax_preference IN ('Taxable', 'Tax Exempt', '')),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_terms VARCHAR(100),
    enable_portal BOOLEAN DEFAULT FALSE,
    customer_owner_id INT REFERENCES users(id) ON DELETE SET NULL,
    other_details JSONB, -- For Address, Contact Persons, Custom Fields, Reporting Tags, Remarks

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_custom_id ON clients(custom_id);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);

-- 4. Invoices Table (Receivables)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'INV-2023-089'
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- References customer type client
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),
    sales_person_id INT REFERENCES users(id) ON DELETE SET NULL,
    reference_number VARCHAR(100),
    sub_total NUMERIC(15, 2) DEFAULT 0.00,
    discount_total NUMERIC(15, 2) DEFAULT 0.00,
    tax_total NUMERIC(15, 2) DEFAULT 0.00,
    shipping_charges NUMERIC(15, 2) DEFAULT 0.00,
    round_off NUMERIC(15, 2) DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Viewed', 'Partial', 'Paid', 'Overdue', 'Cancelled')),
    customer_notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- 4.1 Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(50),
    rate NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(15, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- 4.2 Invoice Payments
CREATE TABLE IF NOT EXISTS invoice_payments (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL, -- Cash, Bank Transfer, UPI, Credit Card, Debit Card, Cheque
    amount_received NUMERIC(15, 2) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);

-- 4.3 Invoice Status History
CREATE TABLE IF NOT EXISTS invoice_status_history (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    status_from VARCHAR(50),
    status_to VARCHAR(50) NOT NULL,
    changed_by INT REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.4 Invoice Attachments
CREATE TABLE IF NOT EXISTS invoice_attachments (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.5 Recurring Invoices
CREATE TABLE IF NOT EXISTS recurring_invoices (
    id SERIAL PRIMARY KEY,
    base_invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.6 Invoice Email Logs
CREATE TABLE IF NOT EXISTS invoice_email_logs (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    sent_to VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    template_used VARCHAR(100),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Sent'
);

-- 4.7 Invoice Activity Logs
CREATE TABLE IF NOT EXISTS invoice_activity_logs (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bills Table (Payables)
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'BILL-2024-001'
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- References vendor type client
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    due_date VARCHAR(100) DEFAULT '—',
    payment_method VARCHAR(100) DEFAULT 'Bank Transfer',
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Overdue', 'Open', 'Paid')),
    cleared_date VARCHAR(100),
    other_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bills_number ON bills(number);
CREATE INDEX IF NOT EXISTS idx_bills_client_id ON bills(client_id);

-- 6. Payments/Expenses Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    custom_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'EXP-001'
    merchant VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Travel', 'Meals', 'Supplies', 'Software', 'Shipping', 'Other')),
    date VARCHAR(100) DEFAULT 'Today',
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Synced', 'Draft', 'Review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_custom_id ON payments(custom_id);

-- 7. Products Table (Inventory & Services)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    custom_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'PROD-001'
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'in stock' CHECK (status IN ('in stock', 'low stock', 'out of stock')),
    stock INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_custom_id ON products(custom_id);

-- 8. Common Updated_At Columns Timestamp Sync
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_invoices_updated_at ON recurring_invoices;
CREATE TRIGGER update_recurring_invoices_updated_at
    BEFORE UPDATE ON recurring_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Organization Profile Table
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

