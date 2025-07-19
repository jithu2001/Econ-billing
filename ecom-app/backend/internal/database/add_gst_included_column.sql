-- Add gst_included column to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS gst_included BOOLEAN NOT NULL DEFAULT true;