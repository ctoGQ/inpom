-- ============================================================
-- Migration: Product Comments System
-- Purpose: Allow authenticated users to comment on products.
--          Supports threaded replies (parent_id), soft-delete,
--          edit tracking, and like counts.
-- Run once in Neon Dashboard → SQL Editor
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- MAIN COMMENTS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_product_comments (
    id           SERIAL PRIMARY KEY,
    product_id   INT NOT NULL
                   REFERENCES shop_products(id) ON DELETE CASCADE,
    author_id    INT NOT NULL
                   REFERENCES customers(id)     ON DELETE CASCADE,
    -- NULL = top-level comment; non-NULL = reply to another comment
    parent_id    INT
                   REFERENCES shop_product_comments(id) ON DELETE CASCADE,
    content      TEXT NOT NULL,
    -- Soft-delete: keep the row but hide content
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    -- Track whether the comment was edited after creation
    is_edited    BOOLEAN NOT NULL DEFAULT FALSE,
    -- Simple likes counter (no separate likes table for now)
    likes_count  INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
-- Primary access pattern: all comments for a product, newest first
CREATE INDEX IF NOT EXISTS idx_shop_comments_product_id
    ON shop_product_comments(product_id, created_at DESC);

-- For fetching replies to a comment
CREATE INDEX IF NOT EXISTS idx_shop_comments_parent_id
    ON shop_product_comments(parent_id)
    WHERE parent_id IS NOT NULL;

-- For moderation / author view
CREATE INDEX IF NOT EXISTS idx_shop_comments_author_id
    ON shop_product_comments(author_id);

-- ─────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.is_edited  = TRUE;   -- any UPDATE means it was edited
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comment_updated_at ON shop_product_comments;
CREATE TRIGGER trg_comment_updated_at
    BEFORE UPDATE ON shop_product_comments
    FOR EACH ROW EXECUTE FUNCTION set_comment_updated_at();

-- ─────────────────────────────────────────────────────────────
-- COMMENT COUNT CACHE on shop_products (optional but useful)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE shop_products
    ADD COLUMN IF NOT EXISTS comment_count INT NOT NULL DEFAULT 0;

-- Keep comment_count in sync automatically
CREATE OR REPLACE FUNCTION sync_product_comment_count()
RETURNS TRIGGER AS $$
DECLARE
    v_product_id INT;
BEGIN
    -- Works for INSERT, DELETE, and soft-delete UPDATE
    IF TG_OP = 'DELETE' THEN
        v_product_id := OLD.product_id;
    ELSE
        v_product_id := NEW.product_id;
    END IF;

    UPDATE shop_products
    SET comment_count = (
        SELECT COUNT(*)
        FROM shop_product_comments
        WHERE product_id = v_product_id
          AND is_deleted = FALSE
          AND parent_id IS NULL  -- only top-level count
    )
    WHERE id = v_product_id;

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_comment_count ON shop_product_comments;
CREATE TRIGGER trg_sync_comment_count
AFTER INSERT OR UPDATE OF is_deleted OR DELETE ON shop_product_comments
FOR EACH ROW EXECUTE FUNCTION sync_product_comment_count();

COMMIT;
