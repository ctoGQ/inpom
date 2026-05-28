-- ============================================
-- Extend transactions table to include product purchases
-- ============================================

-- Step 1: Add product_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES shop_products(id) ON DELETE SET NULL;

-- Step 2: Add quantity column for product purchases
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Step 3: Add buyer_id column for shop transactions (in addition to customer_id)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS buyer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;

-- Step 4: Add seller_id column for tracking seller
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;

-- Step 5: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type_product ON transactions(type, product_id);

-- Step 6: Add comment to document the changes
COMMENT ON COLUMN transactions.product_id IS 'References shop_products for purchase transactions';
COMMENT ON COLUMN transactions.quantity IS 'Quantity of products purchased (for shop transactions)';
COMMENT ON COLUMN transactions.buyer_id IS 'Buyer customer ID (for shop product purchases)';
COMMENT ON COLUMN transactions.seller_id IS 'Seller customer ID (for shop product purchases)';

-- Step 7: Create a view for product purchase transactions
CREATE OR REPLACE VIEW product_purchase_transactions AS
SELECT 
  t.id,
  t.customer_id,
  t.buyer_id,
  t.seller_id,
  t.product_id,
  t.type,
  t.amount,
  t.quantity,
  t.description,
  t.created_at,
  sp.id as product_id_ref,
  sp.title as product_title,
  sp.slug as product_slug,
  sp.price as product_price,
  sp.original_price,
  sp.currency,
  sp.rating as product_rating,
  sp.review_count as product_review_count,
  sp.sale_count,
  sp.stock_quantity,
  sp.is_featured,
  sp.status as product_status,
  sc.id as category_id,
  sc.name as category_name,
  cu.name as seller_name,
  cu.avatar_url as seller_avatar
FROM transactions t
LEFT JOIN shop_products sp ON t.product_id = sp.id
LEFT JOIN shop_categories sc ON sp.category_id = sc.id
LEFT JOIN customers cu ON sp.seller_id = cu.id
WHERE t.type = 'purchase' AND t.product_id IS NOT NULL;

-- Step 8: Grant permissions on the view
GRANT SELECT ON product_purchase_transactions TO current_user;

-- ============================================
-- Alternative: If you want to keep shop_transactions separate
-- and link them to main transactions table
-- ============================================
-- (Uncomment if needed)

-- ALTER TABLE shop_transactions 
-- ADD COLUMN IF NOT EXISTS related_transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL;

-- CREATE INDEX IF NOT EXISTS idx_shop_transactions_transaction_id 
-- ON shop_transactions(related_transaction_id);
