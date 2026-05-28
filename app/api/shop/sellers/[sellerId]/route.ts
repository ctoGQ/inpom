// GET /api/shop/sellers/[sellerId]
// Fetch seller information and their products

import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params;
    const sellerIdNum = parseInt(sellerId);

    console.log(`[Shop Seller API] Fetching seller profile: ${sellerIdNum}`);

    // Get seller info
    const sellerResult = await sql`
      SELECT 
        c.id, c.name, c.avatar_url, c.email,
        sr.average_rating, sr.total_reviews, sr.total_sales, sr.response_time_hours
      FROM customers c
      LEFT JOIN shop_seller_ratings sr ON c.id = sr.seller_id
      WHERE c.id = ${sellerIdNum}
    `;

    if (!sellerResult.rows || sellerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const seller = sellerResult.rows[0];

    // Get seller's active products
    const productsResult = await sql`
      SELECT 
        p.id, p.title, p.slug, p.price, p.rating, p.review_count,
        p.sale_count, p.created_at,
        c.name as category_name,
        spi.image_url as primary_image
      FROM shop_products p
      JOIN shop_categories c ON p.category_id = c.id
      LEFT JOIN shop_product_images spi ON p.id = spi.product_id AND spi.is_primary = TRUE
      WHERE p.seller_id = ${sellerIdNum} AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 50
    `;

    console.log(
      `[Shop Seller API] ✅ Found ${productsResult.rows?.length || 0} products from seller`
    );

    return NextResponse.json({
      seller: {
        id: seller.id,
        name: seller.name,
        avatar: seller.avatar_url,
        rating: seller.average_rating || 0,
        reviews: seller.total_reviews || 0,
        sales: seller.total_sales || 0,
        responseTime: seller.response_time_hours
      },
      products: productsResult.rows || []
    });
  } catch (error) {
    console.error('[Shop Seller API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller' },
      { status: 500 }
    );
  }
}
