// PUT /api/shop/products/update
// Update a product (seller only)

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface UpdateProductRequest {
  productId: number;
  title?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  originalPrice?: number;
  stockQuantity?: number;
  status?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UpdateProductRequest = await request.json();

    if (!body.productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productId = body.productId;

    // Verify the product belongs to this seller
    const productResult = await sql`
      SELECT id, seller_id FROM shop_products WHERE id = ${productId}
    `;

    if (!productResult.rows || productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult.rows[0];

    if (product.seller_id !== customer.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(body.title);
      paramIndex++;
    }

    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(body.description);
      paramIndex++;
    }

    if (body.shortDescription !== undefined) {
      updates.push(`short_description = $${paramIndex}`);
      values.push(body.shortDescription);
      paramIndex++;
    }

    if (body.price !== undefined) {
      updates.push(`price = $${paramIndex}`);
      values.push(body.price);
      paramIndex++;
    }

    if (body.originalPrice !== undefined) {
      updates.push(`original_price = $${paramIndex}`);
      values.push(body.originalPrice);
      paramIndex++;
    }

    if (body.stockQuantity !== undefined) {
      updates.push(`stock_quantity = $${paramIndex}`);
      values.push(body.stockQuantity);
      paramIndex++;
    }

    if (body.status !== undefined && ['active', 'draft', 'inactive'].includes(body.status)) {
      updates.push(`status = $${paramIndex}`);
      values.push(body.status);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(productId);

    const query = `
      UPDATE shop_products
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, price, status
    `;

    const updateResult = await sql.unsafe(query, values);

    if (!updateResult.rows || updateResult.rows.length === 0) {
      throw new Error('Failed to update product');
    }

    console.log(
      `[Update Product API] ✅ Product updated: ID=${productId} by seller ${customer.id}`
    );

    return NextResponse.json(
      {
        success: true,
        product: updateResult.rows[0],
        message: 'Product updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Update Product API] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update product',
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
