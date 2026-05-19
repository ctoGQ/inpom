// POST /api/shop/products
// Create a new product listing

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface CreateProductRequest {
  title: string;
  categoryId: number;
  price: number;
  description: string;
  shortDescription?: string;
  originalPrice?: number;
  stockQuantity?: number;
  sku?: string;
  attributes?: Array<{ name: string; value: string }>;
  images?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateProductRequest = await request.json();

    console.log(`[Create Product API] Customer ${customer.id} creating product:`, {
      title: body.title,
      categoryId: body.categoryId,
      price: body.price
    });

    // Validate required fields
    if (!body.title || !body.categoryId || !body.price || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryCheck = await sql`
      SELECT id FROM shop_categories WHERE id = ${body.categoryId}
    `;

    if (!categoryCheck.rows || categoryCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Create slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .substring(0, 200);

    // Insert product
    const productResult = await sql`
      INSERT INTO shop_products (
        seller_id, category_id, title, slug, description, short_description,
        price, original_price, stock_quantity, sku, status
      )
      VALUES (
        ${customer.id},
        ${body.categoryId},
        ${body.title},
        ${slug},
        ${body.description},
        ${body.shortDescription || null},
        ${body.price},
        ${body.originalPrice || null},
        ${body.stockQuantity || 0},
        ${body.sku || null},
        'moderation'
      )
      RETURNING id, title, slug, created_at
    `;

    if (!productResult.rows || productResult.rows.length === 0) {
      throw new Error('Failed to create product');
    }

    const productId = productResult.rows[0].id;

    // Insert attributes if provided
    if (body.attributes && body.attributes.length > 0) {
      for (let i = 0; i < body.attributes.length; i++) {
        const attr = body.attributes[i];
        await sql`
          INSERT INTO shop_product_attributes (
            product_id, attribute_name, attribute_value, display_order
          )
          VALUES (${productId}, ${attr.name}, ${attr.value}, ${i})
        `;
      }
    }

    // Insert images if provided
    if (body.images && body.images.length > 0) {
      for (let i = 0; i < body.images.length; i++) {
        const imageUrl = body.images[i];
        await sql`
          INSERT INTO shop_product_images (
            product_id, image_url, is_primary, display_order
          )
          VALUES (${productId}, ${imageUrl}, ${i === 0}, ${i})
        `;
      }
    }

    // Create seller rating record if not exists
    const sellerRatingCheck = await sql`
      SELECT id FROM shop_seller_ratings WHERE seller_id = ${customer.id}
    `;

    if (!sellerRatingCheck.rows || sellerRatingCheck.rows.length === 0) {
      await sql`
        INSERT INTO shop_seller_ratings (seller_id, average_rating, total_reviews)
        VALUES (${customer.id}, 0, 0)
      `;
    }

    console.log(
      `[Create Product API] ✅ Product created: ID=${productId}, Status=moderation`
    );

    return NextResponse.json(
      {
        success: true,
        productId,
        message: 'Product created successfully. It will appear in the shop after moderation.'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Create Product API] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create product',
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
