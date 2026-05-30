// POST /api/shop/purchase
// Create a product purchase transaction

import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface PurchaseRequest {
  productId: number;
  quantity: number;
  sellerId: number;
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      console.error('[POST /api/shop/purchase] Unauthorized - no customer session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PurchaseRequest = await request.json();
    const { productId, quantity, sellerId, amount, currency } = body;

    console.log('[POST /api/shop/purchase] Request:', { productId, quantity, sellerId, amount, customerId: customer.id });

    if (!productId || !quantity || quantity <= 0 || !sellerId || !amount) {
      return NextResponse.json(
        { error: 'Invalid product, quantity, seller, or amount' },
        { status: 400 }
      );
    }

    // Prevent self-purchase
    if (customer.id === sellerId) {
      return NextResponse.json(
        { error: 'Cannot purchase your own product' },
        { status: 400 }
      );
    }

    // Get product details
    const productResult = await sql`
      SELECT id, title, seller_id, stock_quantity, price, currency
      FROM shop_products
      WHERE id = ${productId}
    `;

    if (!productResult.rows || productResult.rows.length === 0) {
      console.error('[POST /api/shop/purchase] Product not found:', productId);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = productResult.rows[0];
    console.log('[POST /api/shop/purchase] Product found:', product);

    // Check stock
    if (Number(product.stock_quantity) < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Get buyer's balance from customers table (simpler approach)
    const buyerResult = await sql`
      SELECT id, balance
      FROM customers
      WHERE id = ${customer.id}
    `;

    if (!buyerResult.rows || buyerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Buyer account not found' }, { status: 400 });
    }

    const buyer = buyerResult.rows[0];
    const totalPrice = amount * quantity;

    console.log('[POST /api/shop/purchase] Buyer balance:', buyer.balance, 'Total price:', totalPrice);

    // Check balance
    if (Number(buyer.balance) < totalPrice) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Get seller's account
    const sellerResult = await sql`
      SELECT id, balance
      FROM customers
      WHERE id = ${sellerId}
    `;

    if (!sellerResult.rows || sellerResult.rows.length === 0) {
      console.error('[POST /api/shop/purchase] Seller not found:', sellerId);
      return NextResponse.json({ error: 'Seller account not found' }, { status: 400 });
    }

    const seller = sellerResult.rows[0];

    // Create shop transaction record (for product purchase)
    const shopTransactionResult = await sql`
      INSERT INTO shop_transactions (
        product_id,
        buyer_id,
        seller_id,
        quantity,
        price_per_unit,
        total_price,
        status,
        transaction_date
      )
      VALUES (
        ${productId},
        ${customer.id},
        ${sellerId},
        ${quantity},
        ${amount},
        ${totalPrice},
        'confirmed',
        NOW()
      )
      RETURNING id
    `;

    if (!shopTransactionResult.rows || shopTransactionResult.rows.length === 0) {
      throw new Error('Failed to create shop transaction');
    }

    const shopTransactionId = shopTransactionResult.rows[0].id;
    console.log('[POST /api/shop/purchase] Created shop transaction:', shopTransactionId);

    // Deduct from buyer's balance
    const newBuyerBalance = Number(buyer.balance) - totalPrice;
    await sql`
      UPDATE customers
      SET balance = ${newBuyerBalance}
      WHERE id = ${customer.id}
    `;

    // Add to seller's balance
    const newSellerBalance = Number(seller.balance) + totalPrice;
    await sql`
      UPDATE customers
      SET balance = ${newSellerBalance}
      WHERE id = ${sellerId}
    `;

    // Update product stock and increment sale count
    const newStock = Number(product.stock_quantity) - quantity;
    await sql`
      UPDATE shop_products
      SET stock_quantity = ${newStock}, sale_count = COALESCE(sale_count, 0) + ${quantity}
      WHERE id = ${productId}
    `;

    console.log('[POST /api/shop/purchase] ✅ Purchase successful - Transaction:', shopTransactionId);

    return NextResponse.json(
      {
        success: true,
        transactionId: shopTransactionId,
        message: 'Purchase successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/shop/purchase] ❌ Error:', error instanceof Error ? error.message : String(error));
    console.error('[POST /api/shop/purchase] Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
