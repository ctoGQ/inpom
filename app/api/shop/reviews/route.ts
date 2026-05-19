// POST /api/shop/reviews
// Submit a product review

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface ReviewRequest {
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ReviewRequest = await request.json();
    const { productId, rating, title, comment } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid product ID or rating' },
        { status: 400 }
      );
    }

    console.log(
      `[Shop Review API] Customer ${customer.id} reviewing product ${productId}`
    );

    // Check if user already reviewed this product
    const existingReview = await sql`
      SELECT id FROM shop_product_reviews
      WHERE product_id = ${productId} AND reviewer_id = ${customer.id}
    `;

    if (existingReview.rows && existingReview.rows.length > 0) {
      // Update existing review
      await sql`
        UPDATE shop_product_reviews
        SET rating = ${rating}, title = ${title || null}, comment = ${comment || null}, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${productId} AND reviewer_id = ${customer.id}
      `;

      console.log(`[Shop Review API] ✅ Updated review`);
    } else {
      // Insert new review
      await sql`
        INSERT INTO shop_product_reviews (product_id, reviewer_id, rating, title, comment, status)
        VALUES (${productId}, ${customer.id}, ${rating}, ${title || null}, ${comment || null}, 'approved')
      `;

      console.log(`[Shop Review API] ✅ Created new review`);
    }

    return NextResponse.json(
      { success: true, message: 'Review submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Shop Review API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET - fetch product reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    console.log(
      `[Shop Review API] Fetching reviews for product ${productId}`
    );

    const result = await sql`
      SELECT 
        id, rating, title, comment, is_verified_purchase, helpful_count, unhelpful_count,
        created_at,
        (SELECT name FROM customers WHERE id = reviewer_id) as reviewer_name
      FROM shop_product_reviews
      WHERE product_id = ${parseInt(productId)} AND status = 'approved'
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total FROM shop_product_reviews
      WHERE product_id = ${parseInt(productId)} AND status = 'approved'
    `;

    const total = countResult.rows?.[0]?.total || 0;

    console.log(
      `[Shop Review API] ✅ Fetched ${result.rows?.length || 0} reviews`
    );

    return NextResponse.json({
      reviews: result.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Shop Review API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
