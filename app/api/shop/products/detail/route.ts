// GET /api/shop/products/detail
// Get product details (with attributes)

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = parseInt(searchParams.get('id') || '0');

    if (!productId) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Fetch product details
    const productResult = await sql`
      SELECT 
        p.id, p.title, p.slug, p.description, p.short_description,
        p.price, p.original_price, p.currency, p.stock_quantity,
        p.rating, p.review_count, p.view_count, p.sale_count,
        p.status, p.is_featured, p.created_at,
        c.name as category_name, c.id as category_id,
        cu.name as seller_name, cu.id as seller_id,
        spi.image_url as primary_image
      FROM shop_products p
      JOIN shop_categories c ON p.category_id = c.id
      JOIN customers cu ON p.seller_id = cu.id
      LEFT JOIN shop_product_images spi ON p.id = spi.product_id AND spi.is_primary = TRUE
      WHERE p.id = ${productId}
    `;

    if (!productResult.rows || productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult.rows[0];

    // Check if user is the seller or if product is active
    const customer = await getSessionCustomer();
    if (customer?.id !== product.seller_id && product.status !== 'active') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch attributes
    const attributesResult = await sql`
      SELECT id, attribute_name, attribute_value, display_order
      FROM shop_product_attributes
      WHERE product_id = ${productId}
      ORDER BY display_order ASC
    `;

    // Fetch images
    const imagesResult = await sql`
      SELECT id, image_url, alt_text, is_primary, display_order
      FROM shop_product_images
      WHERE product_id = ${productId}
      ORDER BY display_order ASC
    `;

    console.log(
      `[Get Product API] ✅ Fetched product details: ID=${productId}`
    );

    return NextResponse.json({
      product,
      attributes: attributesResult.rows || [],
      images: imagesResult.rows || []
    });
  } catch (error) {
    console.error('[Get Product API] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch product',
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
