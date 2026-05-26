// POST /api/shop/products/buy
// Purchase a product with INPOM balance

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface BuyProductRequest {
  productId: number;
  quantity: number;
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

    const body: BuyProductRequest = await request.json();

    if (!body.productId || !body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid product ID or quantity' },
        { status: 400 }
      );
    }

    console.log(
      `[Buy Product API] Customer ${customer.id} buying product ${body.productId}, quantity: ${body.quantity}`
    );

    // Fetch product details
    const productResult = await sql`
      SELECT id, seller_id, title, price, stock_quantity, status
      FROM shop_products
      WHERE id = ${body.productId}
    `;

    if (!productResult.rows || productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult.rows[0];

    // Check if product is active
    if (product.status !== 'active') {
      return NextResponse.json(
        { error: 'Product is not available for purchase' },
        { status: 400 }
      );
    }

    // Check if buyer is the seller
    if (product.seller_id === customer.id) {
      return NextResponse.json(
        { error: 'You cannot buy your own product' },
        { status: 400 }
      );
    }

    // Check stock
    if (product.stock_quantity < body.quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = product.price * body.quantity;

    // Get buyer's balance
    const buyerCardResult = await sql`
      SELECT id, balance FROM user_cards
      WHERE customer_id = ${customer.id}
      LIMIT 1
    `;

    if (!buyerCardResult.rows || buyerCardResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User card not found' },
        { status: 404 }
      );
    }

    const buyerCard = buyerCardResult.rows[0];

    // Check if buyer has enough balance
    if (buyerCard.balance < totalPrice) {
      return NextResponse.json(
        { error: 'Insufficient INPOM balance' },
        { status: 400 }
      );
    }

    // Get seller's card
    const sellerCardResult = await sql`
      SELECT id FROM user_cards
      WHERE customer_id = ${product.seller_id}
      LIMIT 1
    `;

    if (!sellerCardResult.rows || sellerCardResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Seller card not found' },
        { status: 404 }
      );
    }

    const sellerCard = sellerCardResult.rows[0];

    // Create transaction record
    const transactionResult = await sql`
      INSERT INTO shop_transactions (
        product_id, buyer_id, seller_id, quantity, price_per_unit, total_price, status
      )
      VALUES (
        ${body.productId},
        ${customer.id},
        ${product.seller_id},
        ${body.quantity},
        ${product.price},
        ${totalPrice},
        'confirmed'
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
    await sql`
      UPDATE user_cards
      SET balance = balance + ${totalPrice}
      WHERE id = ${sellerCard.id}
    `;

    // Create transaction records for balance history
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

    await sql`
      INSERT INTO transactions (customer_id, card_id, type, amount, description, created_at)
      VALUES (
        ${product.seller_id},
        ${sellerCard.id},
        'product_sale',
        ${totalPrice},
        ${'Продаж продукту: ' + product.title},
        NOW()
      )
    `;

    // Update product sale count and stock
    await sql`
      UPDATE shop_products
      SET sale_count = sale_count + ${body.quantity},
          stock_quantity = stock_quantity - ${body.quantity}
      WHERE id = ${body.productId}
    `;

    console.log(
      `[Buy Product API] ✅ Purchase completed: Transaction ID=${transactionId}, Total=${totalPrice} INPOM`
    );

    return NextResponse.json(
      {
        success: true,
        transactionId,
        newBalance: newBuyerBalance,
        message: 'Product purchased successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Buy Product API] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to purchase product',
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
