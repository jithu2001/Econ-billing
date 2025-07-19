CREATE TABLE IF NOT EXISTS business_settings (
    id SERIAL PRIMARY KEY,
    property_name VARCHAR(255) NOT NULL,
    property_address TEXT NOT NULL,
    gst_number VARCHAR(50) NOT NULL,
    gst_percentage DECIMAL(5,2) NOT NULL CHECK (gst_percentage >= 0 AND gst_percentage <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure only one row exists
CREATE UNIQUE INDEX idx_single_row ON business_settings ((true));

-- Invoice number counters table
CREATE TABLE IF NOT EXISTS invoice_counters (
    id SERIAL PRIMARY KEY,
    counter_type VARCHAR(10) NOT NULL UNIQUE, -- 'GST' or 'NON_GST'
    current_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default counters
INSERT INTO invoice_counters (counter_type, current_number) 
VALUES ('GST', 1), ('NON_GST', 1) 
ON CONFLICT (counter_type) DO NOTHING;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_counters_type ON invoice_counters(counter_type);