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

    // Build parameterized query based on status filter
    let products: any[] = [];
    let total = 0;

    if (status === 'all') {
      // Get all products
      const result = await sql`
        SELECT 
          p.id, p.title, p.slug, p.price, p.original_price, p.currency,
          p.stock_quantity, p.rating, p.review_count, p.sale_count,
          p.status, p.created_at,
          c.name as category_name,
          spi.image_url as primary_image
        FROM shop_products p
        JOIN shop_categories c ON p.category_id = c.id
        LEFT JOIN shop_product_images spi ON p.id = spi.product_id AND spi.is_primary = TRUE
        WHERE p.seller_id = ${customer.id}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      products = result.rows || [];

      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total FROM shop_products WHERE seller_id = ${customer.id}
      `;
      total = countResult.rows?.[0]?.total || 0;
    } else {
      // Get products with specific status
      const result = await sql`
        SELECT 
          p.id, p.title, p.slug, p.price, p.original_price, p.currency,
          p.stock_quantity, p.rating, p.review_count, p.sale_count,
          p.status, p.created_at,
          c.name as category_name,
          spi.image_url as primary_image
        FROM shop_products p
        JOIN shop_categories c ON p.category_id = c.id
        LEFT JOIN shop_product_images spi ON p.id = spi.product_id AND spi.is_primary = TRUE
        WHERE p.seller_id = ${customer.id} AND p.status = ${status}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      products = result.rows || [];

      // Get total count for status
      const countResult = await sql`
        SELECT COUNT(*) as total FROM shop_products 
        WHERE seller_id = ${customer.id} AND status = ${status}
      `;
      total = countResult.rows?.[0]?.total || 0;
    }

    // Count attributes for each product
    const productsWithAttrs = await Promise.all(
      products.map(async (product) => {
        const attrResult = await sql`
          SELECT COUNT(*) as count FROM shop_product_attributes WHERE product_id = ${product.id}
        `;
        return {
          ...product,
          attribute_count: attrResult.rows?.[0]?.count || 0
        };
      })
    );

    console.log(
      `[Seller Products API] ✅ Fetched ${productsWithAttrs.length} products for seller ${customer.id}`
    );

    return NextResponse.json({
      products: productsWithAttrs,
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
