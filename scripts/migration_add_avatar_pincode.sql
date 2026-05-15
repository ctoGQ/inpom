-- Migration: Add avatar_url and pincode_hash to customers table
-- Purpose: Support user avatars (Vercel Blob) and PIN code authentication

-- Add avatar_url column
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add pincode_hash column (stores hashed 6-digit PIN)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS pincode_hash VARCHAR(256);

-- Optional: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_avatar_url ON customers(avatar_url);
CREATE INDEX IF NOT EXISTS idx_customers_pincode_hash ON customers(pincode_hash);

-- Verify the new columns exist (check migration success)
-- Run this query to verify:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'customers' AND column_name IN ('avatar_url', 'pincode_hash');
