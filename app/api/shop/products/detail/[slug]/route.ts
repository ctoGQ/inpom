// GET /api/shop/products/[slug]
// Fetch detailed product information

import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;

    console.log(`[Shop Product Detail API] Fetching product: ${slug}`);

    // Get product details
    const productResult = await sql`
      SELECT 
        p.id, p.title, p.slug, p.description, p.short_description,
        p.price, p.original_price, p.currency, p.stock_quantity,
        p.rating, p.review_count, p.view_count, p.sale_count, p.sku,
        p.status, p.is_featured, p.created_at, p.updated_at,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        cu.id as seller_id, cu.name as seller_name, cu.avatar_url as seller_avatar
      FROM shop_products p
      JOIN shop_categories c ON p.category_id = c.id
      JOIN customers cu ON p.seller_id = cu.id
      WHERE p.slug = $1 AND p.status = 'active'
    `;

    if (!productResult.rows || productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult.rows[0];

    // Get images
    const imagesResult = await sql`
      SELECT id, image_url, alt_text, is_primary, display_order
      FROM shop_product_images
      WHERE product_id = ${product.id}
      ORDER BY display_order ASC
    `;

    // Get attributes
    const attributesResult = await sql`
      SELECT attribute_name, attribute_value, attribute_type
      FROM shop_product_attributes
      WHERE product_id = ${product.id}
      ORDER BY display_order ASC
    `;

    // Get reviews
    const reviewsResult = await sql`
      SELECT 
        id, rating, title, comment, is_verified_purchase,
        created_at, helpful_count, unhelpful_count,
        (SELECT name FROM customers WHERE id = reviewer_id) as reviewer_name
      FROM shop_product_reviews
      WHERE product_id = ${product.id} AND status = 'approved'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Get seller info
    const sellerResult = await sql`
      SELECT 
        average_rating, total_reviews, total_sales, response_time_hours
      FROM shop_seller_ratings
      WHERE seller_id = ${product.seller_id}
    `;

    // Update view count
    await sql`
      UPDATE shop_products
      SET view_count = view_count + 1
      WHERE id = ${product.id}
    `;

    console.log(
      `[Shop Product Detail API] ✅ Found product: ${product.title}`
    );

    return NextResponse.json({
      ...product,
      images: imagesResult.rows || [],
      attributes: attributesResult.rows || [],
      reviews: reviewsResult.rows || [],
      seller_info: sellerResult.rows?.[0] || null
    });
  } catch (error) {
    console.error('[Shop Product Detail API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
