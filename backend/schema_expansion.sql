-- ==========================================
-- DemandERP Schema Expansion SQL Script
-- ==========================================

-- 1. Quotes Table (Pre-sales quotes)
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    quote_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    sub_total NUMERIC(15, 2) DEFAULT 0.00,
    discount_total NUMERIC(15, 2) DEFAULT 0.00,
    tax_total NUMERIC(15, 2) DEFAULT 0.00,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Accepted', 'Declined', 'Expired')),
    customer_notes TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quote_items (
    id SERIAL PRIMARY KEY,
    quote_id INT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(50),
    rate NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(15, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    order_date DATE DEFAULT CURRENT_DATE,
    shipment_date DATE,
    sub_total NUMERIC(15, 2) DEFAULT 0.00,
    discount_total NUMERIC(15, 2) DEFAULT 0.00,
    tax_total NUMERIC(15, 2) DEFAULT 0.00,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Confirmed', 'Shipped', 'Invoiced', 'Cancelled')),
    customer_notes TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id SERIAL PRIMARY KEY,
    sales_order_id INT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(50),
    rate NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(15, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Delivery Challans Table
CREATE TABLE IF NOT EXISTS delivery_challans (
    id SERIAL PRIMARY KEY,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    challan_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Delivered', 'Returned', 'Cancelled')),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Credit Notes Table
CREATE TABLE IF NOT EXISTS credit_notes (
    id SERIAL PRIMARY KEY,
    credit_note_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_id INT REFERENCES invoices(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Open', 'Refunded', 'Void')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. e-Way Bills Table
CREATE TABLE IF NOT EXISTS eway_bills (
    id SERIAL PRIMARY KEY,
    eway_bill_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id INT REFERENCES invoices(id) ON DELETE SET NULL,
    challan_id INT REFERENCES delivery_challans(id) ON DELETE SET NULL,
    transport_mode VARCHAR(50) CHECK (transport_mode IN ('Road', 'Rail', 'Air', 'Ship')),
    vehicle_number VARCHAR(20),
    from_place VARCHAR(100),
    to_place VARCHAR(100),
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Cancelled', 'Expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Recurring Expenses Table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id SERIAL PRIMARY KEY,
    merchant VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')),
    next_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- vendor
    date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    sub_total NUMERIC(15, 2) DEFAULT 0.00,
    tax_total NUMERIC(15, 2) DEFAULT 0.00,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Received', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(50),
    rate NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Recurring Bills Table
CREATE TABLE IF NOT EXISTS recurring_bills (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- vendor
    amount NUMERIC(15, 2) DEFAULT 0.00,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')),
    next_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Payments Made Table
CREATE TABLE IF NOT EXISTS payments_made (
    id SERIAL PRIMARY KEY,
    custom_id VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- vendor
    bill_id INT REFERENCES bills(id) ON DELETE SET NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL,
    amount_paid NUMERIC(15, 2) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Vendor Credits Table
CREATE TABLE IF NOT EXISTS vendor_credits (
    id SERIAL PRIMARY KEY,
    credit_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- vendor
    bill_id INT REFERENCES bills(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Open', 'Refunded', 'Void')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INT REFERENCES clients(id) ON DELETE SET NULL,
    billing_method VARCHAR(50) DEFAULT 'Fixed Price' CHECK (billing_method IN ('Fixed Price', 'Based on Hours')),
    rate NUMERIC(15, 2) DEFAULT 0.00,
    budget NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed', 'Cancelled')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Timesheets Table
CREATE TABLE IF NOT EXISTS timesheets (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    hours NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Bank Accounts & Transactions Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) UNIQUE,
    bank_name VARCHAR(255),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id SERIAL PRIMARY KEY,
    bank_account_id INT NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('Deposit', 'Withdrawal')),
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Uncleared' CHECK (status IN ('Cleared', 'Uncleared', 'Reconciled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Compliance (GST Filings & TDS Liabilities/Challans)
CREATE TABLE IF NOT EXISTS gst_filings (
    id SERIAL PRIMARY KEY,
    return_type VARCHAR(50) NOT NULL, -- GSTR-1, GSTR-3B, etc.
    period VARCHAR(50) NOT NULL, -- e.g. "June 2026"
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Ready to File', 'Filed')),
    filing_date DATE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tds_liabilities (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL, -- e.g. "194C"
    assessment_year VARCHAR(50) NOT NULL,
    deductee_name VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tds_challans (
    id SERIAL PRIMARY KEY,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    paid_date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed' CHECK (status IN ('Draft', 'Completed')),
    bsr_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Accountant Module (Chart of Accounts, Manual Journals & Entries, Budgets, Transaction Locking)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(100) NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
    parent_id INT REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manual_journals (
    id SERIAL PRIMARY KEY,
    journal_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    reference VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Posted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    journal_id INT NOT NULL REFERENCES manual_journals(id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    debit NUMERIC(15, 2) DEFAULT 0.00,
    credit NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fiscal_year VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    allocated_amount NUMERIC(15, 2) DEFAULT 0.00,
    spent_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_locks (
    id SERIAL PRIMARY KEY,
    lock_date DATE NOT NULL,
    reason TEXT,
    locked_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Documents Repository Table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    category VARCHAR(100) DEFAULT 'General',
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Trigger functions to maintain updated_at timestamps on extended tables
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_orders_updated_at ON sales_orders;
CREATE TRIGGER update_sales_orders_updated_at
    BEFORE UPDATE ON sales_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_challans_updated_at ON delivery_challans;
CREATE TRIGGER update_delivery_challans_updated_at
    BEFORE UPDATE ON delivery_challans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_notes_updated_at ON credit_notes;
CREATE TRIGGER update_credit_notes_updated_at
    BEFORE UPDATE ON credit_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_expenses_updated_at ON recurring_expenses;
CREATE TRIGGER update_recurring_expenses_updated_at
    BEFORE UPDATE ON recurring_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_bills_updated_at ON recurring_bills;
CREATE TRIGGER update_recurring_bills_updated_at
    BEFORE UPDATE ON recurring_bills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_credits_updated_at ON vendor_credits;
CREATE TRIGGER update_vendor_credits_updated_at
    BEFORE UPDATE ON vendor_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timesheets_updated_at ON timesheets;
CREATE TRIGGER update_timesheets_updated_at
    BEFORE UPDATE ON timesheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chart_of_accounts_updated_at ON chart_of_accounts;
CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manual_journals_updated_at ON manual_journals;
CREATE TRIGGER update_manual_journals_updated_at
    BEFORE UPDATE ON manual_journals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
