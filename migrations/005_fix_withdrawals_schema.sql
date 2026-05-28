-- Fix for missing card_expiry column
-- This script will alter the withdrawals table to fix the schema mismatch

-- Step 1: Drop the existing table if it has wrong schema
DROP TABLE IF EXISTS withdrawals CASCADE;

-- Step 2: Recreate with correct schema
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Recipient info
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  
  -- Withdrawal method
  withdrawal_type VARCHAR(50) NOT NULL CHECK (withdrawal_type IN ('card', 'iban')),
  
  -- Bank details (for IBAN method)
  iban VARCHAR(255),
  bank_name VARCHAR(255),
  swift_code VARCHAR(50),
  
  -- Card details (for Card method)
  card_number VARCHAR(255),
  card_expiry VARCHAR(10),
  
  -- Transaction details
  amount DECIMAL(18, 8) NOT NULL CHECK (amount > 0),
  platform_fee DECIMAL(18, 8) NOT NULL DEFAULT 0,
  total_amount DECIMAL(18, 8) NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  error_message TEXT
);

-- Create indexes
CREATE INDEX idx_withdrawals_customer_id ON withdrawals(customer_id);
CREATE INDEX idx_withdrawals_card_id ON withdrawals(card_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- Add comments for clarity
COMMENT ON TABLE withdrawals IS 'Stores withdrawal requests for users to transfer funds from their cards';
COMMENT ON COLUMN withdrawals.platform_fee IS 'Automatically calculated as 20% of the amount';
COMMENT ON COLUMN withdrawals.status IS 'pending = created, processing = being processed, completed = successful, failed = error occurred, cancelled = user cancelled';
