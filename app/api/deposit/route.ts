import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[POST /api/deposit] body:', body);
    const { amount, paymentMethod, cardId } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Сума повинна бути більше нуля' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Спосіб оплати не вибран' },
        { status: 400 }
      );
    }

    // Get the card (if cardId provided, use that one, otherwise get first card)
    let card;
    if (cardId) {
      const cardResult = await sql`
        SELECT id, balance, customer_id FROM user_cards WHERE id = ${cardId} AND customer_id = ${customer.id}
      `;
      card = cardResult.rows?.[0];
      console.log('[POST /api/deposit] looked up card by id:', cardId, 'found:', !!card);
    } else {
      const cardResult = await sql`
        SELECT id, balance, customer_id FROM user_cards WHERE customer_id = ${customer.id} LIMIT 1
      `;
      card = cardResult.rows?.[0];
      console.log('[POST /api/deposit] no cardId provided, using first card:', card?.id);
    }

    if (!card) {
      return NextResponse.json(
        { error: 'Карта не знайдена' },
        { status: 404 }
      );
    }

    // Parse balance
    const currentBalance = parseFloat(card.balance);
    const depositAmount = parseFloat(amount);

    if (isNaN(currentBalance) || isNaN(depositAmount)) {
      return NextResponse.json(
        { error: 'Помилка при конвертації суми' },
        { status: 400 }
      );
    }

    // Update balance
    const newBalance = currentBalance + depositAmount;
    await sql`
      UPDATE user_cards SET balance = ${newBalance}, updated_at = NOW() WHERE id = ${card.id}
    `;

    // Confirm updated card
    try {
      const confirm = await sql`
        SELECT id, card_type, balance FROM user_cards WHERE id = ${card.id}
      `;
      console.log('[POST /api/deposit] Updated card:', confirm.rows?.[0]);
    } catch (err) {
      console.error('[POST /api/deposit] Error confirming updated card:', err);
    }

    // Create deposit transaction
    const description = `Депозит через ${paymentMethod}`;
    await sql`
      INSERT INTO transactions (customer_id, card_id, type, amount, description, created_at)
      VALUES (${customer.id}, ${card.id}, 'deposit', ${depositAmount}, ${description}, NOW())
    `;

    return NextResponse.json({
      success: true,
      message: 'Депозит успішно поповнено',
      cardId: card.id,
      newBalance,
      depositAmount,
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: 'Помилка при обробці депозиту' },
      { status: 500 }
    );
  }
}
