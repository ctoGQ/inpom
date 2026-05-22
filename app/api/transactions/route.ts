import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const cardId = searchParams.get('cardId');
    const limit = searchParams.get('limit') || '20';

    if (!cardId) {
      return NextResponse.json(
        { error: 'cardId is required' },
        { status: 400 }
      );
    }

    // Verify the card belongs to the customer
    const cardResult = await sql`
      SELECT id FROM user_cards WHERE id = ${parseInt(cardId)} AND customer_id = ${customer.id}
    `;

    if (cardResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Fetch transactions for this card
    const result = await sql`
      SELECT id, type, amount, description, created_at, invoice_id
      FROM transactions
      WHERE card_id = ${parseInt(cardId)}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)}
    `;

    return NextResponse.json({
      transactions: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
