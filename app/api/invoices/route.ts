import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { updateCabinetTask } from '@/lib/cabinet-tasks';

export async function POST(request: NextRequest) {
  try {
    console.log(`[POST /api/invoices] Request received`);
    const body = await request.json();
    console.log(`[POST /api/invoices] Body:`, body);
    
    const sessionCustomer = await getSessionCustomer();
    const { customerId, cardId, amount, description, expiryMinutes } = body;
    if (!sessionCustomer || Number(customerId) !== Number(sessionCustomer.id)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate required fields
    if (!customerId || !cardId || amount === undefined) {
      console.warn(`[POST /api/invoices] ❌ Missing fields - customerId: ${customerId}, cardId: ${cardId}, amount: ${amount}`);
      return NextResponse.json(
        { error: 'Missing required fields: customerId, cardId and amount' },
        { status: 400 }
      );
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.warn(`[POST /api/invoices] ❌ Invalid amount: ${amount}`);
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (numAmount > 999999.99) {
      console.warn(`[POST /api/invoices] ❌ Amount too large: ${numAmount}`);
      return NextResponse.json(
        { error: 'Amount exceeds maximum limit' },
        { status: 400 }
      );
    }

    // Validate expiry minutes
    const expiryMin = parseInt(expiryMinutes) || 30;
    if (expiryMin < 1 || expiryMin > 43200) { // Max 30 days
      console.warn(`[POST /api/invoices] ❌ Invalid expiry: ${expiryMin}`);
      return NextResponse.json(
        { error: 'Expiry time must be between 1 minute and 30 days' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + expiryMin * 60 * 1000);
    console.log(`[POST /api/invoices] Creating invoice with:`, { customerId, cardId, numAmount, description, expiresAt });

    const result = await sql`
      INSERT INTO invoices (creator_customer_id, creator_card_id, amount, description, status, expires_at)
      VALUES (${customerId}, ${cardId}, ${numAmount}, ${description || ''}, 'pending', ${expiresAt})
      RETURNING id, creator_customer_id, creator_card_id, amount, description, status, created_at, expires_at
    `;

    console.log(`[POST /api/invoices] INSERT result:`, result);

    if (!result.rows.length) {
      console.error(`[POST /api/invoices] ❌ No rows returned after INSERT`);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    const invoice = result.rows[0];
    await updateCabinetTask(sessionCustomer.id, 'create_first_invoice', 100);
    console.log(`[POST /api/invoices] ✅ Invoice created:`, invoice);
    
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lummetra.com'}/mycabinet/pay-invoice/${invoice.id}`;

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        paymentUrl,
      },
    });
  } catch (error) {
    console.error('[POST /api/invoices] ❌ Error creating invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[POST /api/invoices] Error details:', errorMessage);
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

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

    const result = await sql`
      SELECT id, creator_customer_id, creator_card_id, amount, description, status, created_at, expires_at
      FROM invoices
      WHERE creator_customer_id = ${parseInt(customerId)}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      invoices: result.rows || [],
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
