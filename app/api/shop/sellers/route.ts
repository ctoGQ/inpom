// GET /api/shop/sellers
// Returns all sellers who have active products, ranked by total sales.
// Used by /mycabinet/shop marketplace "Кращі Продавці" section.

import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '20'),
      100
    );

    console.log(`[Shop Sellers API] Fetching top ${limit} sellers`);

    // Returns every customer who has at least one active product,
    // enriched with seller_ratings data. Ordered by total_sales DESC.
    const result = await sql`
      SELECT
        c.id,
        c.name,
        c.avatar_url,
        COALESCE(sr.average_rating, 0)::DECIMAL(3,2) AS average_rating,
        COALESCE(sr.total_reviews, 0)::INT            AS total_reviews,
        COALESCE(sr.total_sales, 0)::INT              AS total_sales,
        COALESCE(sr.is_verified, FALSE)               AS is_verified,
        (
          SELECT COUNT(*)::INT
          FROM shop_products p
          WHERE p.seller_id = c.id AND p.status = 'active'
        ) AS product_count
      FROM customers c
      LEFT JOIN shop_seller_ratings sr ON c.id = sr.seller_id
      WHERE EXISTS (
        SELECT 1 FROM shop_products p
        WHERE p.seller_id = c.id AND p.status = 'active'
      )
      ORDER BY COALESCE(sr.total_sales, 0) DESC, COALESCE(sr.product_count, 0) DESC
      LIMIT ${limit}
    `;

    console.log(`[Shop Sellers API] ✅ Found ${result.rows?.length || 0} sellers`);

    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('[Shop Sellers API] ❌ Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database not initialized. Run migration_shop_extend.sql first.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}
