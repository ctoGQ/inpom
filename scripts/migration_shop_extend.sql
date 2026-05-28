-- ============================================================
-- Migration: Extend Shop System for Marketplace
-- Version: shop_extend_v1
-- Purpose:
--   1. Add product_type column to distinguish goods vs services
--   2. Add seller profile fields to shop_seller_ratings
--   3. Ensure customers.avatar_url exists
--   4. Sync seller_ratings rows for all existing sellers
--   5. Performance indexes for type filtering
-- Run this once in your Neon dashboard SQL editor
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. ADD product_type TO shop_products
-- ─────────────────────────────────────────────────────────────
ALTER TABLE shop_products
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'goods';

-- Add constraint (safe: only applied if column is new)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_product_type' AND conrelid = 'shop_products'::regclass
  ) THEN
    ALTER TABLE shop_products
      ADD CONSTRAINT chk_product_type
      CHECK (product_type IN ('goods', 'service', 'digital', 'subscription'));
  END IF;
END $$;

-- Index for type-based filtering (marketplace sections)
CREATE INDEX IF NOT EXISTS idx_shop_products_type
  ON shop_products(product_type);

CREATE INDEX IF NOT EXISTS idx_shop_products_type_status
  ON shop_products(product_type, status);

CREATE INDEX IF NOT EXISTS idx_shop_products_sale_count
  ON shop_products(sale_count DESC);

-- ─────────────────────────────────────────────────────────────
-- 2. EXTEND shop_seller_ratings WITH PROFILE FIELDS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE shop_seller_ratings
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS product_count INT DEFAULT 0;

-- ─────────────────────────────────────────────────────────────
-- 3. ENSURE customers HAS avatar_url (already exists, but safe)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ─────────────────────────────────────────────────────────────
-- 4. SYNC seller_ratings FOR ALL EXISTING SELLERS
--    Creates missing rows so /api/shop/sellers returns real data
-- ─────────────────────────────────────────────────────────────
INSERT INTO shop_seller_ratings (
  seller_id,
  average_rating,
  total_reviews,
  total_sales,
  product_count
)
SELECT
  p.seller_id,
  COALESCE(AVG(p.rating), 0)::DECIMAL(3,2),
  0,
  COALESCE(SUM(p.sale_count), 0)::INT,
  COUNT(p.id)::INT
FROM shop_products p
WHERE NOT EXISTS (
  SELECT 1 FROM shop_seller_ratings sr WHERE sr.seller_id = p.seller_id
)
GROUP BY p.seller_id
ON CONFLICT (seller_id) DO NOTHING;

-- Update product_count for existing seller_ratings rows
UPDATE shop_seller_ratings sr
SET product_count = (
  SELECT COUNT(*)::INT
  FROM shop_products p
  WHERE p.seller_id = sr.seller_id AND p.status = 'active'
),
total_sales = (
  SELECT COALESCE(SUM(p.sale_count), 0)::INT
  FROM shop_products p
  WHERE p.seller_id = sr.seller_id
);

-- ─────────────────────────────────────────────────────────────
-- 5. ACTIVATE ALL PRODUCTS IN MODERATION STATUS
--    (No moderation workflow exists yet → set to active)
-- ─────────────────────────────────────────────────────────────
UPDATE shop_products
SET status = 'active'
WHERE status = 'moderation';

-- ─────────────────────────────────────────────────────────────
-- 6. TRIGGER: keep seller product_count in sync automatically
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_seller_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert seller_ratings row for this seller
  INSERT INTO shop_seller_ratings (seller_id, average_rating, total_reviews, total_sales, product_count)
  VALUES (NEW.seller_id, 0, 0, 0, 0)
  ON CONFLICT (seller_id) DO NOTHING;

  -- Recalculate product_count and total_sales
  UPDATE shop_seller_ratings
  SET
    product_count = (
      SELECT COUNT(*)::INT FROM shop_products
      WHERE seller_id = NEW.seller_id AND status = 'active'
    ),
    total_sales = (
      SELECT COALESCE(SUM(sale_count), 0)::INT FROM shop_products
      WHERE seller_id = NEW.seller_id
    )
  WHERE seller_id = NEW.seller_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_seller_stats ON shop_products;
CREATE TRIGGER trg_sync_seller_stats
AFTER INSERT OR UPDATE OF status, sale_count ON shop_products
FOR EACH ROW EXECUTE FUNCTION sync_seller_stats();

COMMIT;
