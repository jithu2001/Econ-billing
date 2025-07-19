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

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal > 0),
    gst_included BOOLEAN NOT NULL DEFAULT true,
    gst_percent DECIMAL(5,2) NOT NULL CHECK (gst_percent >= 0 AND gst_percent <= 100),
    gst_amount DECIMAL(10,2) NOT NULL CHECK (gst_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure only one bill per booking
    CONSTRAINT unique_booking_bill UNIQUE (booking_id)
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_bills_booking_id ON bills(booking_id);
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_counters_type ON invoice_counters(counter_type);