-- Add invoice counters table for GST/NON-GST numbering
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