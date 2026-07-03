-- ==========================================
-- Extend Quotes to match new frontend fields
-- ==========================================

-- 1. Add new columns to quotes
ALTER TABLE quotes
    ADD COLUMN IF NOT EXISTS billing_address TEXT,
    ADD COLUMN IF NOT EXISTS shipping_address TEXT,
    ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(100),
    ADD COLUMN IF NOT EXISTS subject VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS sales_person_id INT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
    ADD COLUMN IF NOT EXISTS shipping_charges NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS round_off NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS converted_to_invoice_id INT REFERENCES invoices(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Add new columns to quote_items
ALTER TABLE quote_items
    ADD COLUMN IF NOT EXISTS hsn_sac VARCHAR(20),
    ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5, 2) DEFAULT 0.00;

-- 3. Quote Activity Logs (mirrors invoice_activity_logs)
CREATE TABLE IF NOT EXISTS quote_activity_logs (
    id SERIAL PRIMARY KEY,
    quote_id INT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Quote Attachments (mirrors invoice_attachments)
CREATE TABLE IF NOT EXISTS quote_attachments (
    id SERIAL PRIMARY KEY,
    quote_id INT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_activity_logs_quote_id ON quote_activity_logs(quote_id);