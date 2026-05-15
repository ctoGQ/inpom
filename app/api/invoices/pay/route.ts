import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, payerCustomerId } = body;

    if (!invoiceId || !payerCustomerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get invoice details
    const invoiceResult = await sql`
      SELECT id, creator_customer_id, amount, status, expires_at
      FROM invoices
      WHERE id = ${invoiceId}
    `;

    const invoice = invoiceResult.rows?.[0];

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice already paid' },
        { status: 400 }
      );
    }

    if (invoice.expires_at && new Date(invoice.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invoice has expired' },
        { status: 400 }
      );
    }

    // Get payer's card
    const payerCardResult = await sql`
      SELECT id, balance FROM user_cards WHERE customer_id = ${payerCustomerId}
    `;

    const payerCard = payerCardResult.rows?.[0];

    if (!payerCard) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    if (payerCard.balance < invoice.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Update invoice status
    await sql`
      UPDATE invoices SET status = 'paid' WHERE id = ${invoiceId}
    `;

    // Deduct from payer
    const newPayerBalance = payerCard.balance - invoice.amount;
    await sql`
      UPDATE user_cards SET balance = ${newPayerBalance}, updated_at = NOW() WHERE id = ${payerCard.id}
    `;

    // Get creator's card
    const creatorCardResult = await sql`
      SELECT id, balance FROM user_cards WHERE customer_id = ${invoice.creator_customer_id}
    `;

    const creatorCard = creatorCardResult.rows?.[0];

    if (creatorCard) {
      const newCreatorBalance = creatorCard.balance + invoice.amount;
      await sql`
        UPDATE user_cards SET balance = ${newCreatorBalance}, updated_at = NOW() WHERE id = ${creatorCard.id}
      `;
    }

    // Create transaction for payer
    await sql`
      INSERT INTO transactions (customer_id, type, amount, invoice_id, related_customer_id, description)
      VALUES (${payerCustomerId}, 'payment_sent', ${invoice.amount}, ${invoiceId}, ${invoice.creator_customer_id}, 'Payment for invoice')
    `;

    // Create transaction for creator
    await sql`
      INSERT INTO transactions (customer_id, type, amount, invoice_id, related_customer_id, description)
      VALUES (${invoice.creator_customer_id}, 'payment_received', ${invoice.amount}, ${invoiceId}, ${payerCustomerId}, 'Payment received')
    `;

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
