-- Add withdrawal transaction types
-- This migration adds support for withdrawal transactions

-- If you're using a fresh database, ensure the transactions table has these types:
-- The transactions table should support type values like:
-- 'deposit', 'payment_sent', 'payment_received', 'withdrawal_card', 'withdrawal_iban'

-- Create withdrawal_methods table for storing user bank details
CREATE TABLE IF NOT EXISTS withdrawal_methods (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'card' or 'iban'
  
  -- For card withdrawals
  card_number VARCHAR(255), -- encrypted
  card_holder_name VARCHAR(255),
  card_expiry VARCHAR(10),
  
  -- For IBAN withdrawals
  iban VARCHAR(255),
  account_holder_name VARCHAR(255),
  bank_name VARCHAR(255),
  
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_withdrawal_methods_customer_id 
ON withdrawal_methods(customer_id);

-- Add comment to transactions table to document withdrawal types
-- When creating transactions with type 'withdrawal_card' or 'withdrawal_iban',
-- set the description to include the withdrawal method ID or bank details reference

-- Optional: Add column to transactions table for withdrawal method reference
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS withdrawal_method_id INTEGER REFERENCES withdrawal_methods(id);

-- Example transaction types for withdrawals:
-- INSERT INTO transactions (customer_id, card_id, type, amount, description, withdrawal_method_id)
-- VALUES (1, 1, 'withdrawal_card', 1000, 'Withdrawal to card', 1);
-- 
-- INSERT INTO transactions (customer_id, card_id, type, amount, description, withdrawal_method_id)
-- VALUES (1, 1, 'withdrawal_iban', 1000, 'Withdrawal to IBAN', 2);
