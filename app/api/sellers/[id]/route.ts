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

    // Fetch seller profile info
    const sellerResult = await sql`
      SELECT 
        id, 
        name, 
        email,
        avatar_url,
        bio,
        created_at,
        rating,
        review_count
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
        id,
        title,
        slug,
        price,
        original_price,
        currency,
        rating,
        review_count,
        sale_count,
        stock_quantity,
        is_featured,
        status,
        category_id,
        (SELECT name FROM shop_categories WHERE id = shop_products.category_id) as category_name
      FROM shop_products
      WHERE seller_id = ${sellerId}
        AND status IN ('active', 'moderation')
      ORDER BY created_at DESC
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
        bio: seller.bio || null,
        created_at: seller.created_at,
        rating: seller.rating || 0,
        review_count: seller.review_count || 0,
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
