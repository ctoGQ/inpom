import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
        { status: 400 }
      );
    }

    const customerIdNum = parseInt(customerId);
    if (isNaN(customerIdNum)) {
      return NextResponse.json(
        { error: 'Invalid customerId' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT id, balance, card_type FROM user_cards WHERE customer_id = ${customerIdNum}
    `;

    if (!result.rows || result.rows.length === 0) {
      // Return 0 balance if card doesn't exist
      return NextResponse.json({
        balance: 0,
        cardType: 'black',
      });
    }

    const card = result.rows[0];
    return NextResponse.json({
      balance: parseFloat(card.balance) || 0,
      cardType: card.card_type || 'black',
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
