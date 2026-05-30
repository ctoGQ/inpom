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

    // Get seller info from customers table
    const sellerResult = await sql`
      SELECT 
        id, name, avatar_url, email
      FROM customers
      WHERE id = ${sellerIdNum}
    `;

    if (!sellerResult.rows || sellerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const seller = sellerResult.rows[0];

    // Calculate seller ratings from transactions
    const statsResult = await sql`
      SELECT 
        COUNT(DISTINCT st.id) as total_sales,
        COALESCE(AVG(sr.rating), 0) as average_rating,
        COUNT(DISTINCT sr.id) as total_reviews
      FROM shop_transactions st
      LEFT JOIN shop_reviews sr ON st.product_id = sr.product_id AND st.seller_id = sr.seller_id
      WHERE st.seller_id = ${sellerIdNum} AND st.status = 'confirmed'
    `;

    const stats = statsResult.rows[0] || {};

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
        rating: parseFloat(stats.average_rating || 0),
        reviews: parseInt(stats.total_reviews || 0),
        sales: parseInt(stats.total_sales || 0),
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
