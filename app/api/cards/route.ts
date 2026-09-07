import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';
import { updateCabinetTask } from '@/lib/cabinet-tasks';

export async function POST(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardType } = body;

    if (!cardType || !['gold', 'business'].includes(cardType)) {
      return NextResponse.json({ error: 'Invalid card type' }, { status: 400 });
    }

    // Insert new card with zero balance
    const result = await sql`
      INSERT INTO user_cards (customer_id, card_type, balance, created_at, updated_at)
      VALUES (${customer.id}, ${cardType}, 0.00, NOW(), NOW())
      RETURNING id, card_type, balance
    `;

    const newCard = result.rows?.[0];
    const taskReward = cardType === 'gold' ? await updateCabinetTask(customer.id, 'open_gold_card', 100) : null;

    return NextResponse.json({ success: true, card: newCard, taskRewarded: taskReward?.rewarded ?? false });
  } catch (error) {
    console.error('Error creating user card:', error);
    const message = (error as any)?.message || String(error);
    const payload: any = { error: 'Failed to create card' };
    if (process.env.NODE_ENV !== 'production') {
      payload.detail = message;
      payload.stack = (error as any)?.stack;
    }
    return NextResponse.json(payload, { status: 500 });
  }
}
