-- Migration: Add creator_card_id to invoices table
ALTER TABLE invoices ADD COLUMN creator_card_id INTEGER;
