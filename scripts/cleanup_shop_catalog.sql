-- Destructive cleanup: removes every shop product and category, together with
-- product-linked shop sales and Pick cards/responses/progress.
-- Product-linked rows in the main transactions table are retained; the
-- product_id foreign key created by extend_transactions_with_products.sql
-- sets their product_id to NULL when products are deleted.
--
-- Run in the Neon SQL Editor only after confirming the selected database.
-- The transaction rolls back automatically if a remaining foreign key blocks
-- deletion.

BEGIN;

LOCK TABLE
  shop_categories,
  shop_products,
  shop_transactions,
  pick_cards,
  pick_responses,
  pick_daily_progress
IN SHARE ROW EXCLUSIVE MODE;

-- Remove shop sales that restrict deletion of their products.
DELETE FROM shop_transactions st
USING shop_products p
WHERE st.product_id = p.id;

-- Remove Pick data before deleting categories used by its cards.
DELETE FROM pick_responses;
DELETE FROM pick_daily_progress;
DELETE FROM pick_cards;

-- Product-owned images, attributes, variants, reviews, wishlists, and comments
-- are removed by their product foreign keys.
DELETE FROM shop_products;
DELETE FROM shop_categories;

-- Keep seller profiles, but clear statistics that were derived from products.
UPDATE shop_seller_ratings
SET average_rating = 0,
    total_reviews = 0,
    total_sales = 0,
    product_count = 0;

-- Verify the cleaned tables before committing.
SELECT 'shop_products' AS table_name, COUNT(*) AS remaining_rows FROM shop_products
UNION ALL
SELECT 'shop_categories', COUNT(*) FROM shop_categories
UNION ALL
SELECT 'shop_transactions', COUNT(*) FROM shop_transactions
UNION ALL
SELECT 'pick_cards', COUNT(*) FROM pick_cards
UNION ALL
SELECT 'pick_responses', COUNT(*) FROM pick_responses
UNION ALL
SELECT 'pick_daily_progress', COUNT(*) FROM pick_daily_progress;

COMMIT;
