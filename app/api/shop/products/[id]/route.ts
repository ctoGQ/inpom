import { getSessionCustomer } from '@/lib/auth';
import { sql, query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface UpdateProductRequest {
  title?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price?: number;
  original_price?: number;
  currency?: string;
  stock_quantity?: number;
  sku?: string;
  product_type?: string;
  status?: string;
  is_featured?: boolean;
  category_id?: number;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to current user
    const productResult = await sql`
      SELECT id, seller_id
      FROM shop_products
      WHERE id = ${productId}
    `;

    const product = productResult.rows[0];
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.seller_id !== customer.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this product' },
        { status: 403 }
      );
    }

    const body: UpdateProductRequest = await request.json();

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const params_array: any[] = [];
    let paramIdx = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIdx}`);
      params_array.push(body.title);
      paramIdx++;
    }
    if (body.slug !== undefined) {
      updates.push(`slug = $${paramIdx}`);
      params_array.push(body.slug);
      paramIdx++;
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIdx}`);
      params_array.push(body.description);
      paramIdx++;
    }
    if (body.short_description !== undefined) {
      updates.push(`short_description = $${paramIdx}`);
      params_array.push(body.short_description);
      paramIdx++;
    }
    if (body.price !== undefined) {
      updates.push(`price = $${paramIdx}`);
      params_array.push(body.price);
      paramIdx++;
    }
    if (body.original_price !== undefined) {
      updates.push(`original_price = $${paramIdx}`);
      params_array.push(body.original_price);
      paramIdx++;
    }
    if (body.currency !== undefined) {
      updates.push(`currency = $${paramIdx}`);
      params_array.push(body.currency);
      paramIdx++;
    }
    if (body.stock_quantity !== undefined) {
      updates.push(`stock_quantity = $${paramIdx}`);
      params_array.push(body.stock_quantity);
      paramIdx++;
    }
    if (body.sku !== undefined) {
      updates.push(`sku = $${paramIdx}`);
      params_array.push(body.sku);
      paramIdx++;
    }
    if (body.product_type !== undefined) {
      updates.push(`product_type = $${paramIdx}`);
      params_array.push(body.product_type);
      paramIdx++;
    }
    if (body.status !== undefined) {
      updates.push(`status = $${paramIdx}`);
      params_array.push(body.status);
      paramIdx++;
    }
    if (body.is_featured !== undefined) {
      updates.push(`is_featured = $${paramIdx}`);
      params_array.push(body.is_featured);
      paramIdx++;
    }
    if (body.category_id !== undefined) {
      updates.push(`category_id = $${paramIdx}`);
      params_array.push(body.category_id);
      paramIdx++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add ID to params for WHERE clause
    params_array.push(productId);

    // Execute update
    const updateQuery = `
      UPDATE shop_products
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIdx}
      RETURNING *
    `;

    const result = await query(updateQuery, params_array);

    if (!result.rows.length) {
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error('[PUT /api/shop/products/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
