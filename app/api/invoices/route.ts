import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, amount, description, expiryMinutes } = body;

    if (!customerId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + (expiryMinutes || 30) * 60 * 1000);

    const result = await sql`
      INSERT INTO invoices (creator_customer_id, amount, description, status, expires_at)
      VALUES (${customerId}, ${amount}, ${description || ''}, 'pending', ${expiresAt})
      RETURNING id, creator_customer_id, amount, description, status, created_at, expires_at
    `;

    if (!result.rows.length) {
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    const invoice = result.rows[0];
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mycabinet/pay-invoice/${invoice.id}`;

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        paymentUrl,
      },
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      SELECT id, creator_customer_id, amount, description, status, created_at, expires_at
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
