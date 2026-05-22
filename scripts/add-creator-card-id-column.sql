-- Add creator_card_id column to invoices table
ALTER TABLE invoices
ADD COLUMN creator_card_id INTEGER;

-- Add foreign key constraint
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_creator_card_id
FOREIGN KEY (creator_card_id) REFERENCES user_cards(id);
