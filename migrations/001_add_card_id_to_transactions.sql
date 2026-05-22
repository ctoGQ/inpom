-- INPOM Card Slider Database Migration
-- This migration adds card_id support to transactions table

-- Step 1: Add card_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN card_id INTEGER REFERENCES user_cards(id);

-- Step 2: Assign existing transactions to the user's first card
-- This ensures no NULL values and maintains data integrity
UPDATE transactions t
SET card_id = (
  SELECT uc.id 
  FROM user_cards uc 
  WHERE uc.customer_id = (
    SELECT customer_id FROM transactions WHERE id = t.id LIMIT 1
  )
  ORDER BY uc.created_at ASC
  LIMIT 1
)
WHERE card_id IS NULL;

-- Step 3: Make card_id NOT NULL constraint
ALTER TABLE transactions 
ALTER COLUMN card_id SET NOT NULL;

-- Step 4: Create index for performance
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_card_id_created ON transactions(card_id, created_at DESC);

-- Step 5: Verify migration
-- Run these queries to check:
-- SELECT COUNT(*) as total_transactions FROM transactions;
-- SELECT COUNT(*) as transactions_with_card_id FROM transactions WHERE card_id IS NOT NULL;
-- SELECT card_id, COUNT(*) as count FROM transactions GROUP BY card_id;
