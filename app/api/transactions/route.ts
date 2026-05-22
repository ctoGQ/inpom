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

    // Fetch transactions for this card's customer (not just this card, since old transactions lack card_id)
    // Get customer_id from card
    const cardResult = await sql`
      SELECT customer_id FROM user_cards WHERE id = ${parseInt(cardId)} AND customer_id = ${customer.id}
    `;
    
    if (cardResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }
    
    const customerId = cardResult.rows[0].customer_id;
    
    const result = await sql`
      SELECT 
        t.id, 
        t.type, 
        t.amount, 
        t.description, 
        t.created_at, 
        t.invoice_id,
        CASE 
          WHEN t.type = 'payment_sent' THEN i.creator_customer_id
          WHEN t.type = 'payment_received' THEN (
            SELECT customer_id FROM transactions t2 
            WHERE t2.invoice_id = t.invoice_id 
            AND t2.type = 'payment_sent' 
            LIMIT 1
          )
          ELSE NULL
        END as other_customer_id
      FROM transactions t
      LEFT JOIN invoices i ON t.invoice_id = i.id
      WHERE t.customer_id = ${customerId}
      ORDER BY t.created_at DESC
      LIMIT ${parseInt(limit)}
    `;

    // Enrich with customer details
    const enriched = await Promise.all(
      (result.rows || []).map(async (transaction: any) => {
        if (transaction.other_customer_id) {
          try {
            const customerResult = await sql`
              SELECT name, avatar FROM customers WHERE id = ${transaction.other_customer_id}
            `;
            const otherCustomer = customerResult.rows?.[0];
            return {
              ...transaction,
              other_customer_name: otherCustomer?.name || 'Unknown',
              other_customer_avatar: otherCustomer?.avatar || null,
            };
          } catch (error) {
            console.error('Error fetching other customer:', error);
            return {
              ...transaction,
              other_customer_name: 'Unknown',
              other_customer_avatar: null,
            };
          }
        }
        return {
          ...transaction,
          other_customer_name: 'Unknown',
          other_customer_avatar: null,
        };
      })
    );

    return NextResponse.json({
      transactions: enriched,
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
