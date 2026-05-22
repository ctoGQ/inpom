import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, payerCustomerId } = body;

    // Validate required fields
    if (!invoiceId || !payerCustomerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const invoiceIdNum = parseInt(invoiceId);
    const payerIdNum = parseInt(payerCustomerId);

    if (isNaN(invoiceIdNum) || isNaN(payerIdNum)) {
      return NextResponse.json(
        { error: 'Invalid invoice or payer ID' },
        { status: 400 }
      );
    }

    // Get invoice details
    const invoiceResult = await sql`
      SELECT id, creator_customer_id, amount, status, expires_at, description
      FROM invoices
      WHERE id = ${invoiceIdNum}
    `;

    const invoice = invoiceResult.rows?.[0];

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if payer is trying to pay their own invoice
    if (invoice.creator_customer_id === payerIdNum) {
      return NextResponse.json(
        { error: 'You cannot pay your own invoice' },
        { status: 400 }
      );
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'This invoice has already been paid' },
        { status: 400 }
      );
    }

    if (invoice.expires_at && new Date(invoice.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invoice has expired' },
        { status: 400 }
      );
    }

    // Get payer's card
    const payerCardResult = await sql`
      SELECT id, balance FROM user_cards WHERE customer_id = ${payerIdNum}
    `;

    const payerCard = payerCardResult.rows?.[0];

    if (!payerCard) {
      return NextResponse.json(
        { error: 'Your card not found. Please contact support' },
        { status: 404 }
      );
    }

    const payerBalance = parseFloat(payerCard.balance);
    const invoiceAmount = parseFloat(invoice.amount);

    console.log(`[PayInvoice] Balance conversion:`, {
      payerBalance,
      invoiceAmount,
      payerCardBalance: payerCard.balance,
      invoiceAmount: invoice.amount,
      balanceTypes: { payer: typeof payerBalance, invoice: typeof invoiceAmount }
    });

    if (payerBalance < invoiceAmount) {
      return NextResponse.json(
        {
          error: `Insufficient balance. You need ${invoiceAmount.toFixed(2)} inpom but have only ${payerBalance.toFixed(2)} inpom`,
          code: 'INSUFFICIENT_BALANCE',
          needed: invoiceAmount,
          available: payerBalance,
        },
        { status: 400 }
      );
    }

    // Update invoice status
    await sql`
      UPDATE invoices 
      SET status = 'paid', updated_at = NOW() 
      WHERE id = ${invoiceIdNum}
    `;

    // Deduct from payer
    const newPayerBalance = payerBalance - invoiceAmount;
    console.log(`[PayInvoice] Updating payer balance:`, {
      payerId: payerIdNum,
      oldBalance: payerBalance,
      amount: invoiceAmount,
      newBalance: newPayerBalance
    });

    await sql`
      UPDATE user_cards 
      SET balance = ${newPayerBalance}, updated_at = NOW() 
      WHERE id = ${payerCard.id}
    `;

    // Get creator's card
    let creatorCard = null;
    const creatorCardResult = await sql`
      SELECT id, balance FROM user_cards WHERE customer_id = ${invoice.creator_customer_id}
    `;

    creatorCard = creatorCardResult.rows?.[0];

    if (creatorCard) {
      const creatorBalance = parseFloat(creatorCard.balance);
      const newCreatorBalance = creatorBalance + invoiceAmount;
      
      console.log(`[PayInvoice] Updating creator balance:`, {
        creatorId: invoice.creator_customer_id,
        oldBalance: creatorBalance,
        amount: invoiceAmount,
        newBalance: newCreatorBalance
      });

      await sql`
        UPDATE user_cards 
        SET balance = ${newCreatorBalance}, updated_at = NOW() 
        WHERE id = ${creatorCard.id}
      `;
    } else {
      // Create card for creator if doesn't exist
      console.log(`[PayInvoice] Creating new card for creator:`, invoice.creator_customer_id);
      
      await sql`
        INSERT INTO user_cards (customer_id, card_type, balance, created_at, updated_at)
        VALUES (${invoice.creator_customer_id}, 'black', ${invoiceAmount}, NOW(), NOW())
      `;

      // Fetch the newly created card to get its ID
      const newCardResult = await sql`
        SELECT id, balance FROM user_cards WHERE customer_id = ${invoice.creator_customer_id} ORDER BY created_at DESC LIMIT 1
      `;
      creatorCard = newCardResult.rows?.[0];
    }

    // Create transaction for payer
    console.log(`[PayInvoice] Creating payer transaction`);
    try {
      await sql`
        INSERT INTO transactions (customer_id, card_id, type, amount, invoice_id, description, created_at, payer_customer_id)
        VALUES (${payerIdNum}, ${payerCard.id}, 'payment_sent', ${invoiceAmount}, ${invoiceIdNum}, ${`Payment for invoice #${invoiceIdNum}`}, NOW(), ${payerIdNum})
      `;
    } catch (txError: any) {
      // If payer_customer_id column doesn't exist, insert without it
      if (txError?.message?.includes('payer_customer_id')) {
        console.log('[PayInvoice] Inserting without payer_customer_id column');
        await sql`
          INSERT INTO transactions (customer_id, card_id, type, amount, invoice_id, description, created_at)
          VALUES (${payerIdNum}, ${payerCard.id}, 'payment_sent', ${invoiceAmount}, ${invoiceIdNum}, ${`Payment for invoice #${invoiceIdNum}`}, NOW())
        `;
      } else {
        throw txError;
      }
    }

    // Create transaction for creator
    console.log(`[PayInvoice] Creating creator transaction`);
    if (creatorCard) {
      try {
        await sql`
          INSERT INTO transactions (customer_id, card_id, type, amount, invoice_id, description, created_at, payer_customer_id)
          VALUES (${invoice.creator_customer_id}, ${creatorCard.id}, 'payment_received', ${invoiceAmount}, ${invoiceIdNum}, ${`Payment received for invoice #${invoiceIdNum}`}, NOW(), ${payerIdNum})
        `;
      } catch (txError: any) {
        // If payer_customer_id column doesn't exist, insert without it
        if (txError?.message?.includes('payer_customer_id')) {
          console.log('[PayInvoice] Inserting without payer_customer_id column');
          await sql`
            INSERT INTO transactions (customer_id, card_id, type, amount, invoice_id, description, created_at)
            VALUES (${invoice.creator_customer_id}, ${creatorCard.id}, 'payment_received', ${invoiceAmount}, ${invoiceIdNum}, ${`Payment received for invoice #${invoiceIdNum}`}, NOW())
          `;
        } else {
          throw txError;
        }
      }
    }

    console.log(`[PayInvoice] ✅ Payment processed successfully`);

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      invoice: {
        id: invoice.id,
        status: 'paid',
      },
      payerNewBalance: newPayerBalance,
      creatorNewBalance: creatorCard ? parseFloat(creatorCard.balance) + invoiceAmount : invoiceAmount,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing payment' },
      { status: 500 }
    );
  }
}
