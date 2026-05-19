-- Shop Marketplace System for Neon Database
-- Created: 2026-05-19
-- Purpose: Multi-user marketplace platform with product listings, categories, and reviews

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shop_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    color VARCHAR(20),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PRODUCTS TABLE (Main listing)
-- ============================================
CREATE TABLE IF NOT EXISTS shop_products (
    id SERIAL PRIMARY KEY,
    seller_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'UAH',
    stock_quantity INT DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    
    -- Ratings and reviews
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INT DEFAULT 0,
    
    -- Metrics
    view_count INT DEFAULT 0,
    sale_count INT DEFAULT 0,
    wishlist_count INT DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'draft', 'inactive', 'moderation', 'banned'
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(160),
    meta_description VARCHAR(160),
    meta_keywords VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES shop_categories(id) ON DELETE RESTRICT
);

-- ============================================
-- PRODUCT IMAGES/GALLERY
-- ============================================
CREATE TABLE IF NOT EXISTS shop_product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE
);

-- ============================================
-- PRODUCT CHARACTERISTICS/ATTRIBUTES
-- ============================================
CREATE TABLE IF NOT EXISTS shop_product_attributes (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(500) NOT NULL,
    attribute_type VARCHAR(50), -- 'text', 'select', 'color', 'size', 'number'
    display_order INT DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE
);

-- ============================================
-- PRODUCT VARIANTS (e.g., different colors/sizes)
-- ============================================
CREATE TABLE IF NOT EXISTS shop_product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    variant_name VARCHAR(100), -- e.g., "Red - Size M"
    sku VARCHAR(100),
    price DECIMAL(10, 2),
    stock_quantity INT,
    variant_image_url TEXT,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE
);

-- ============================================
-- PRODUCT REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS shop_product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    helpful_count INT DEFAULT 0,
    unhelpful_count INT DEFAULT 0,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'approved', -- 'pending', 'approved', 'rejected', 'hidden'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ============================================
-- WISHLIST
-- ============================================
CREATE TABLE IF NOT EXISTS shop_wishlist (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(customer_id, product_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE
);

-- ============================================
-- PRODUCT TRANSACTIONS/SALES
-- ============================================
CREATE TABLE IF NOT EXISTS shop_transactions (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE RESTRICT,
    FOREIGN KEY (buyer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ============================================
-- SELLER RATINGS/REPUTATION
-- ============================================
CREATE TABLE IF NOT EXISTS shop_seller_ratings (
    id SERIAL PRIMARY KEY,
    seller_id INT NOT NULL UNIQUE,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    total_sales INT DEFAULT 0,
    response_time_hours DECIMAL(5, 2),
    return_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Products queries
CREATE INDEX idx_shop_products_seller_id ON shop_products(seller_id);
CREATE INDEX idx_shop_products_category_id ON shop_products(category_id);
CREATE INDEX idx_shop_products_status ON shop_products(status);
CREATE INDEX idx_shop_products_created_at ON shop_products(created_at DESC);
CREATE INDEX idx_shop_products_rating ON shop_products(rating DESC);
CREATE INDEX idx_shop_products_price ON shop_products(price);

-- Search/filtering
CREATE INDEX idx_shop_products_title_fts ON shop_products USING gin(to_tsvector('ukrainian', title || ' ' || COALESCE(short_description, '')));

-- Product images
CREATE INDEX idx_shop_product_images_product_id ON shop_product_images(product_id);
CREATE INDEX idx_shop_product_images_primary ON shop_product_images(product_id) WHERE is_primary = TRUE;

-- Attributes
CREATE INDEX idx_shop_product_attributes_product_id ON shop_product_attributes(product_id);

-- Reviews
CREATE INDEX idx_shop_product_reviews_product_id ON shop_product_reviews(product_id);
CREATE INDEX idx_shop_product_reviews_reviewer_id ON shop_product_reviews(reviewer_id);
CREATE INDEX idx_shop_product_reviews_status ON shop_product_reviews(status);

-- Wishlist
CREATE INDEX idx_shop_wishlist_customer_id ON shop_wishlist(customer_id);
CREATE INDEX idx_shop_wishlist_product_id ON shop_wishlist(product_id);

-- Transactions
CREATE INDEX idx_shop_transactions_seller_id ON shop_transactions(seller_id);
CREATE INDEX idx_shop_transactions_buyer_id ON shop_transactions(buyer_id);
CREATE INDEX idx_shop_transactions_product_id ON shop_transactions(product_id);
CREATE INDEX idx_shop_transactions_status ON shop_transactions(status);

-- Seller ratings
CREATE INDEX idx_shop_seller_ratings_average ON shop_seller_ratings(average_rating DESC);

-- ============================================
-- SAMPLE CATEGORIES DATA
-- ============================================
INSERT INTO shop_categories (name, slug, description, color, display_order, is_active)
VALUES
-- Основные категории
('Консультації', 'konsultatsii', 'Консультаційні послуги та тренінги', '#FF6B6B', 1, TRUE),
('Онлайн Курси', 'online-kursy', 'Онлайн навчальні курси та вебінари', '#4ECDC4', 2, TRUE),
('Коворкинг', 'kovorking', 'Можливості для роботи та спільні простори', '#95E1D3', 3, TRUE),
('Менторство', 'mentorstvo', 'Послуги менторингу та навчання', '#FFE66D', 4, TRUE),
('Інвестиції', 'investytsii', 'Інвестиційні можливості та фінансування', '#C7CEEA', 5, TRUE),
('Товари', 'tovary', 'Фізичні товари та обладнання', '#FF8B94', 6, TRUE),
('Дизайн & Креатив', 'dizajn-kreatyv', 'Послуги дизайну та творчої роботи', '#B4A7D6', 7, TRUE),
('Технології & IT', 'tekhnolohii-it', 'IT послуги та технологічні рішення', '#73C6B6', 8, TRUE),
('Маркетинг & PR', 'marketynh-pr', 'Послуги маркетингу та PR', '#F8B500', 9, TRUE),
('Здоров''я & Краса', 'zdorov''ya-krasa', 'Послуги здоров''я, краси та благополуччя', '#FF7B9C', 10, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update product rating based on reviews
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shop_products
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM shop_product_reviews
        WHERE product_id = NEW.product_id AND status = 'approved'
    ),
    review_count = (
        SELECT COUNT(*)
        FROM shop_product_reviews
        WHERE product_id = NEW.product_id AND status = 'approved'
    )
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update product rating on review changes
CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON shop_product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Function to update seller rating based on reviews
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shop_seller_ratings
    SET average_rating = (
        SELECT AVG(r.rating)::DECIMAL(3,2)
        FROM shop_product_reviews r
        JOIN shop_products p ON r.product_id = p.id
        WHERE p.seller_id = (
            SELECT seller_id FROM shop_products WHERE id = NEW.product_id
        ) AND r.status = 'approved'
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM shop_product_reviews r
        JOIN shop_products p ON r.product_id = p.id
        WHERE p.seller_id = (
            SELECT seller_id FROM shop_products WHERE id = NEW.product_id
        ) AND r.status = 'approved'
    )
    WHERE seller_id = (
        SELECT seller_id FROM shop_products WHERE id = NEW.product_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update seller rating on product review
CREATE TRIGGER trigger_update_seller_rating
AFTER INSERT OR UPDATE ON shop_product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_seller_rating();

-- Function to update wishlist count
CREATE OR REPLACE FUNCTION update_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shop_products
    SET wishlist_count = (
        SELECT COUNT(*)
        FROM shop_wishlist
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update wishlist count
CREATE TRIGGER trigger_update_wishlist_count
AFTER INSERT OR DELETE ON shop_wishlist
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_count();

-- ============================================
-- SAMPLE PRODUCT (for reference/demo)
-- ============================================
-- Example: Consulting service from seller
-- (Uncomment to use as template)
/*
INSERT INTO shop_products 
(seller_id, category_id, title, slug, description, short_description, price, currency, stock_quantity, status, is_featured)
SELECT 
    customers.id as seller_id,
    1 as category_id,
    'Консультація з розвитку бізнесу' as title,
    'konsultatsiia-z-rozvytku-biznesu' as slug,
    'Індивідуальна консультація щодо розвитку вашого бізнесу. Аналіз поточної ситуації, визначення проблем та розробка дорожної карти розвитку.' as description,
    'Консультація щодо розвитку бізнесу для жінок-підприємців' as short_description,
    500 as price,
    'UAH' as currency,
    999 as stock_quantity,
    'active' as status,
    TRUE as is_featured
FROM customers
WHERE id = 1
LIMIT 1;
*/

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Popular products view
CREATE OR REPLACE VIEW shop_popular_products AS
SELECT 
    p.id, p.title, p.price, p.rating, p.review_count, p.sale_count,
    c.name as category_name,
    cu.name as seller_name,
    spi.image_url as primary_image
FROM shop_products p
JOIN shop_categories c ON p.category_id = c.id
JOIN customers cu ON p.seller_id = cu.id
LEFT JOIN shop_product_images spi ON p.id = spi.product_id AND spi.is_primary = TRUE
WHERE p.status = 'active'
ORDER BY (p.sale_count + p.view_count) DESC;

-- Seller profile view
CREATE OR REPLACE VIEW shop_seller_profile AS
SELECT 
    cu.id, cu.name, cu.avatar_url,
    sr.average_rating, sr.total_reviews, sr.total_sales,
    COUNT(DISTINCT sp.id) as active_products
FROM customers cu
LEFT JOIN shop_seller_ratings sr ON cu.id = sr.seller_id
LEFT JOIN shop_products sp ON cu.id = sp.seller_id AND sp.status = 'active'
GROUP BY cu.id, cu.name, cu.avatar_url, sr.average_rating, sr.total_reviews, sr.total_sales;

-- Product details view (with all related data)
CREATE OR REPLACE VIEW shop_product_details AS
SELECT 
    p.id, p.title, p.description, p.price, p.original_price, p.currency,
    p.stock_quantity, p.rating, p.review_count, p.view_count, p.sale_count,
    c.name as category_name,
    cu.name as seller_name, cu.avatar_url as seller_avatar,
    sr.average_rating as seller_rating, sr.total_sales as seller_total_sales,
    COALESCE(json_agg(DISTINCT spi.*) FILTER (WHERE spi.id IS NOT NULL), '[]'::json) as images,
    COALESCE(json_agg(DISTINCT spa.*) FILTER (WHERE spa.id IS NOT NULL), '[]'::json) as attributes
FROM shop_products p
JOIN shop_categories c ON p.category_id = c.id
JOIN customers cu ON p.seller_id = cu.id
LEFT JOIN shop_seller_ratings sr ON cu.id = sr.seller_id
LEFT JOIN shop_product_images spi ON p.id = spi.product_id
LEFT JOIN shop_product_attributes spa ON p.id = spa.product_id
WHERE p.status = 'active'
GROUP BY p.id, c.name, cu.id, cu.name, cu.avatar_url, sr.average_rating, sr.total_sales;
