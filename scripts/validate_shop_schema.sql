-- SQL Check: Verify Shop System Tables and Schema
-- This script validates that all required tables exist with proper structure

-- Check 1: shop_products table
SELECT 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_products') as products_table_exists,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_products' AND column_name = 'id') as has_id,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_products' AND column_name = 'seller_id') as has_seller_id,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_products' AND column_name = 'price') as has_price,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_products' AND column_name = 'stock_quantity') as has_stock,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_products' AND column_name = 'status') as has_status;

-- Check 2: shop_product_images table
SELECT 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_product_images') as images_table_exists,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_product_images' AND column_name = 'product_id') as has_product_id,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_product_images' AND column_name = 'image_url') as has_image_url;

-- Check 3: shop_product_attributes table
SELECT 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_product_attributes') as attributes_table_exists,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_product_attributes' AND column_name = 'product_id') as has_product_id,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_product_attributes' AND column_name = 'attribute_name') as has_attr_name;

-- Check 4: shop_transactions table
SELECT 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_transactions') as transactions_table_exists,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_transactions' AND column_name = 'product_id') as has_product_id,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_transactions' AND column_name = 'buyer_id') as has_buyer_id,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_transactions' AND column_name = 'seller_id') as has_seller_id,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_transactions' AND column_name = 'total_price') as has_total_price,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_transactions' AND column_name = 'status') as has_status;

-- Summary: If all checks return TRUE, the database schema is ready for the shop system.
