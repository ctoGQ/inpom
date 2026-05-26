// GET /api/shop/products/seller
// Get all products for the current seller

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status') || 'all';

    let query = `
      SELECT 
        p.id, p.title, p.slug, p.price, p.original_price, p.currency,
        p.stock_quantity, p.rating, p.review_count, p.sale_count,
        p.status, p.created_at,
        c.name as category_name,
        spi.image_url as primary_image,
        COUNT(spa.id) as attribute_count
      FROM shop_products p
      JOIN shop_categories c ON p.category_id = c.id
      LEFT JOIN shop_product_images spi ON p.id = spi.product_id AND spi.is_primary = TRUE
      LEFT JOIN shop_product_attributes spa ON p.id = spa.product_id
      WHERE p.seller_id = ${customer.id}
    `;

    if (status !== 'all') {
      query += ` AND p.status = '${status}'`;
    }

    query += ` GROUP BY p.id, c.name, spi.image_url
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const result = await sql.unsafe(query);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM shop_products WHERE seller_id = ${customer.id}`;
    if (status !== 'all') {
      countQuery += ` AND status = '${status}'`;
    }

    const countResult = await sql.unsafe(countQuery);
    const total = countResult.rows?.[0]?.total || 0;

    console.log(
      `[Seller Products API] ✅ Fetched ${result.rows?.length || 0} products for seller ${customer.id}`
    );

    return NextResponse.json({
      products: result.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Seller Products API] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch seller products',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined
      },
      { status: 500 }
    );
  }
}
