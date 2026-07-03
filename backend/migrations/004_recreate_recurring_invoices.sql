-- ==========================================
-- Drop and recreate recurring_invoices as a standalone template
-- (supersedes 003_extend_recurring_invoices.sql, which was never applied)
-- ==========================================

DROP TABLE IF EXISTS recurring_invoice_activity_logs CASCADE;
DROP TABLE IF EXISTS recurring_invoice_items CASCADE;
DROP TABLE IF EXISTS recurring_invoices CASCADE;

-- 1. Recurring invoice profiles
CREATE TABLE recurring_invoices (
    id SERIAL PRIMARY KEY,
    custom_id VARCHAR(20) UNIQUE NOT NULL, -- e.g. REC-0011
    profile_name VARCHAR(255) NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id),

    -- Schedule
    frequency VARCHAR(10) NOT NULL CHECK (frequency IN ('Daily','Weekly','Monthly','Yearly')),
    interval_count INT NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    next_generation_date DATE,
    last_generated_at TIMESTAMP WITH TIME ZONE,

    end_condition VARCHAR(20) NOT NULL DEFAULT 'Never'
        CHECK (end_condition IN ('Never','OnDate','AfterOccurrences')),
    end_date DATE,
    max_occurrences INT,
    occurrences_generated INT NOT NULL DEFAULT 0,

    -- Billing behavior
    creation_mode VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (creation_mode IN ('AutoSend','Draft')),
    due_date_offset_days INT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    -- Template amounts (copied onto each generated invoice)
    sub_total NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_total NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_total NUMERIC(14,2) NOT NULL DEFAULT 0,
    shipping_charges NUMERIC(14,2) NOT NULL DEFAULT 0,
    round_off NUMERIC(14,2) NOT NULL DEFAULT 0,
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,

    payment_terms VARCHAR(100),
    reference_number VARCHAR(100),
    customer_notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active','On Hold','Expired','Completed')),
    pause_reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Line-item template, copied onto each generated invoice
CREATE TABLE recurring_invoice_items (
    id SERIAL PRIMARY KEY,
    recurring_invoice_id INT NOT NULL REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    product_id INT,
    description TEXT,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'pcs',
    rate NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    amount NUMERIC(14,2) NOT NULL DEFAULT 0
);

-- 3. Activity log, mirrors invoice_activity_logs
CREATE TABLE recurring_invoice_activity_logs (
    id SERIAL PRIMARY KEY,
    recurring_invoice_id INT NOT NULL REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Link generated invoices back to their profile
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS recurring_invoice_id INT REFERENCES recurring_invoices(id) ON DELETE SET NULL;

-- 5. Indexes
CREATE INDEX idx_recurring_invoices_status ON recurring_invoices(status);
CREATE INDEX idx_recurring_invoices_next_generation_date ON recurring_invoices(next_generation_date) WHERE status = 'Active';
CREATE INDEX idx_recurring_invoice_activity_logs_recurring_invoice_id ON recurring_invoice_activity_logs(recurring_invoice_id);
CREATE INDEX idx_invoices_recurring_invoice_id ON invoices(recurring_invoice_id);