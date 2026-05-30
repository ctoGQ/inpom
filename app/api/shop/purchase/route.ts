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

    const totalPrice = amount * quantity;

    // Get buyer's card (black card)
    const buyerCardResult = await sql`
      SELECT id, balance FROM user_cards
      WHERE customer_id = ${customer.id}
      LIMIT 1
    `;

    if (!buyerCardResult.rows || buyerCardResult.rows.length === 0) {
      return NextResponse.json({ error: 'User card not found' }, { status: 404 });
    }

    const buyerCard = buyerCardResult.rows[0];

    console.log('[POST /api/shop/purchase] Buyer card balance:', buyerCard.balance, 'Total price:', totalPrice);

    // Check balance
    if (Number(buyerCard.balance) < totalPrice) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Get seller's card
    const sellerCardResult = await sql`
      SELECT id FROM user_cards
      WHERE customer_id = ${sellerId}
      LIMIT 1
    `;

    if (!sellerCardResult.rows || sellerCardResult.rows.length === 0) {
      console.error('[POST /api/shop/purchase] Seller card not found:', sellerId);
      return NextResponse.json({ error: 'Seller card not found' }, { status: 404 });
    }

    const sellerCard = sellerCardResult.rows[0];

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

    // Deduct from buyer's card balance
    const newBuyerBalance = Number(buyerCard.balance) - totalPrice;
    await sql`
      UPDATE user_cards
      SET balance = ${newBuyerBalance}
      WHERE id = ${buyerCard.id}
    `;

    // Add to seller's card balance
    await sql`
      UPDATE user_cards
      SET balance = balance + ${totalPrice}
      WHERE id = ${sellerCard.id}
    `;

    // Create transaction records for buyer
    await sql`
      INSERT INTO transactions (customer_id, card_id, type, amount, description, created_at)
      VALUES (
        ${customer.id},
        ${buyerCard.id},
        'product_purchase',
        ${totalPrice},
        ${'Покупка продукту: ' + product.title},
        NOW()
      )
    `;

    // Create transaction records for seller
    await sql`
      INSERT INTO transactions (customer_id, card_id, type, amount, description, created_at)
      VALUES (
        ${sellerId},
        ${sellerCard.id},
        'product_sale',
        ${totalPrice},
        ${'Продаж продукту: ' + product.title},
        NOW()
      )
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
