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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PurchaseRequest = await request.json();
    const { productId, quantity, sellerId, amount, currency } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid product or quantity' },
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
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = productResult.rows[0];

    // Check stock
    if (product.stock_quantity < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Get buyer's card
    const buyerCardResult = await sql`
      SELECT id, balance FROM user_cards
      WHERE customer_id = ${customer.id}
      ORDER BY created_at ASC
      LIMIT 1
    `;

    if (!buyerCardResult.rows || buyerCardResult.rows.length === 0) {
      return NextResponse.json({ error: 'Buyer card not found' }, { status: 400 });
    }

    const buyerCard = buyerCardResult.rows[0];
    const totalPrice = amount * quantity;

    // Check balance
    if (buyerCard.balance < totalPrice) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Get seller's card
    const sellerCardResult = await sql`
      SELECT id, balance FROM user_cards
      WHERE customer_id = ${sellerId}
      ORDER BY created_at ASC
      LIMIT 1
    `;

    if (!sellerCardResult.rows || sellerCardResult.rows.length === 0) {
      return NextResponse.json({ error: 'Seller card not found' }, { status: 400 });
    }

    const sellerCard = sellerCardResult.rows[0];

    // Create transaction record
    const transactionResult = await sql`
      INSERT INTO transactions (
        customer_id,
        buyer_id,
        seller_id,
        product_id,
        type,
        amount,
        quantity,
        description,
        created_at
      )
      VALUES (
        ${customer.id},
        ${customer.id},
        ${sellerId},
        ${productId},
        'purchase',
        ${totalPrice},
        ${quantity},
        ${`Покупка товара: ${product.title}`},
        NOW()
      )
      RETURNING id
    `;

    if (!transactionResult.rows || transactionResult.rows.length === 0) {
      throw new Error('Failed to create transaction');
    }

    const transactionId = transactionResult.rows[0].id;

    // Deduct from buyer's balance
    const newBuyerBalance = buyerCard.balance - totalPrice;
    await sql`
      UPDATE user_cards
      SET balance = ${newBuyerBalance}
      WHERE id = ${buyerCard.id}
    `;

    // Add to seller's balance
    const newSellerBalance = sellerCard.balance + totalPrice;
    await sql`
      UPDATE user_cards
      SET balance = ${newSellerBalance}
      WHERE id = ${sellerCard.id}
    `;

    // Update product stock and increment sale count
    const newStock = product.stock_quantity - quantity;
    await sql`
      UPDATE shop_products
      SET stock_quantity = ${newStock}, sale_count = COALESCE(sale_count, 0) + ${quantity}
      WHERE id = ${productId}
    `;

    return NextResponse.json(
      {
        success: true,
        transactionId,
        message: 'Purchase successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/shop/purchase] Error:', error instanceof Error ? error.message : String(error));
    console.error('[POST /api/shop/purchase] Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
