// POST/DELETE /api/shop/wishlist
// Add or remove product from wishlist

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    console.log(
      `[Wishlist API] Customer ${customer.id} adding product ${productId}`
    );

    // Insert to wishlist
    const result = await sql`
      INSERT INTO shop_wishlist (customer_id, product_id)
      VALUES (${customer.id}, ${productId})
      ON CONFLICT (customer_id, product_id) DO NOTHING
      RETURNING id
    `;

    console.log(
      `[Wishlist API] ✅ Added to wishlist: ${result.rows?.length > 0 ? 'new' : 'already'}`
    );

    return NextResponse.json(
      { success: true, message: 'Added to wishlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Wishlist API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    console.log(
      `[Wishlist API] Customer ${customer.id} removing product ${productId}`
    );

    // Delete from wishlist
    await sql`
      DELETE FROM shop_wishlist
      WHERE customer_id = ${customer.id} AND product_id = ${productId}
    `;

    console.log(`[Wishlist API] ✅ Removed from wishlist`);

    return NextResponse.json(
      { success: true, message: 'Removed from wishlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Wishlist API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}

// GET - fetch user's wishlist
export async function GET(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[Wishlist API] Fetching wishlist for customer ${customer.id}`);

    const result = await sql`
      SELECT 
        p.id, p.title, p.slug, p.price, p.rating, p.review_count,
        p.created_at,
        spi.image_url as primary_image,
        w.added_at
      FROM shop_wishlist w
      JOIN shop_products p ON w.product_id = p.id
      LEFT JOIN shop_product_images spi ON p.id = spi.product_id AND spi.is_primary = TRUE
      WHERE w.customer_id = ${customer.id}
      ORDER BY w.added_at DESC
    `;

    console.log(
      `[Wishlist API] ✅ Fetched ${result.rows?.length || 0} wishlist items`
    );

    return NextResponse.json({
      wishlist: result.rows || [],
      count: result.rows?.length || 0
    });
  } catch (error) {
    console.error('[Wishlist API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}
