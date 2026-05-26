// DELETE /api/shop/products/delete
// Delete a product (seller only)

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface DeleteProductRequest {
  productId: number;
}

export async function DELETE(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: DeleteProductRequest = await request.json();

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

    // Delete product (cascades to images, attributes, etc.)
    await sql`
      DELETE FROM shop_products WHERE id = ${productId}
    `;

    console.log(
      `[Delete Product API] ✅ Product deleted: ID=${productId} by seller ${customer.id}`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Delete Product API] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete product',
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
