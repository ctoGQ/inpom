-- Add payer_customer_id column to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payer_customer_id INTEGER;

-- Add comment for clarity
COMMENT ON COLUMN transactions.payer_customer_id IS 'Customer ID of the payer (for payment_sent and payment_received transactions)';
