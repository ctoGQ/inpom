import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sellerId = parseInt(id, 10);
    if (isNaN(sellerId)) {
      return NextResponse.json(
        { error: 'Invalid seller ID' },
        { status: 400 }
      );
    }

    // Fetch seller profile info - use only fields that exist
    const sellerResult = await sql`
      SELECT 
        id, 
        name, 
        email,
        avatar_url
      FROM customers
      WHERE id = ${sellerId}
    `;

    const seller = sellerResult.rows[0];
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Fetch seller's active products count
    const productsCountResult = await sql`
      SELECT COUNT(*) as count
      FROM shop_products
      WHERE seller_id = ${sellerId} 
        AND status IN ('active', 'moderation')
    `;

    const productCount = productsCountResult.rows[0]?.count || 0;

    // Fetch seller's active products with basic info
    const productsResult = await sql`
      SELECT 
        sp.id,
        sp.title,
        sp.slug,
        sp.price,
        sp.original_price,
        sp.currency,
        sp.rating,
        sp.review_count,
        sp.sale_count,
        sp.stock_quantity,
        sp.is_featured,
        sp.status,
        sp.category_id,
        sc.name as category_name,
        spi.image_url as primary_image
      FROM shop_products sp
      LEFT JOIN shop_categories sc ON sp.category_id = sc.id
      LEFT JOIN shop_product_images spi ON sp.id = spi.product_id AND spi.is_primary = TRUE
      WHERE sp.seller_id = ${sellerId}
        AND sp.status IN ('active', 'moderation')
      ORDER BY sp.created_at DESC
      LIMIT 20
    `;

    const products = productsResult.rows;

    // Calculate discount for products
    const productsWithDiscount = products.map(p => ({
      ...p,
      discount: p.original_price && Number(p.original_price) > Number(p.price)
        ? Math.round(((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100)
        : 0,
    }));

    return NextResponse.json({
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        avatar_url: seller.avatar_url,
        product_count: productCount,
      },
      products: productsWithDiscount,
    });
  } catch (error) {
    console.error('[GET /api/sellers/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
