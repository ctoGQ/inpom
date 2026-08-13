-- Migration: Allow multiple cards per customer by making unique constraint (customer_id, card_type)
BEGIN;

-- Drop existing single-card unique constraint if present
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_customer_id_key;

-- Add composite unique constraint so a customer can have multiple cards but one of each type
ALTER TABLE user_cards
  ADD CONSTRAINT user_cards_customer_id_card_type_key UNIQUE (customer_id, card_type);

COMMIT;
