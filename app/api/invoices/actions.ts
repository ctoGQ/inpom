'use server';

import { sql } from '@/lib/db';

export async function createInvoice(
  customerId: number,
  amount: number,
  description: string,
  expiryMinutes: number,
  cardId?: number
) {
  try {
    if (amount <= 0) {
      return { error: 'Сума повинна бути більше нуля' };
    }

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const result = await sql`
      INSERT INTO invoices (creator_customer_id, creator_card_id, amount, description, status, expires_at)
      VALUES (${customerId}, ${cardId || null}, ${amount}, ${description}, 'pending', ${expiresAt})
      RETURNING id, creator_customer_id, creator_card_id, amount, description, status, created_at, expires_at
    `;

    if (!result.rows.length) {
      return { error: 'Помилка при створенні інвойса' };
    }

    const invoice = result.rows[0];

    // Generate QR code data with payment link
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lummetra.com'}/mycabinet/pay-invoice/${invoice.id}`;

    return {
      success: true,
      invoice: {
        ...invoice,
        paymentUrl,
      },
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { error: 'Помилка при створенні інвойса' };
  }
}

export async function payInvoice(invoiceId: number, payerCustomerId: number) {
  try {
    // Get invoice details
    const invoiceResult = await sql`
      SELECT id, creator_customer_id, creator_card_id, amount, status, expires_at
      FROM invoices
      WHERE id = ${invoiceId}
    `;

    const invoice = invoiceResult.rows?.[0];

    if (!invoice) {
      return { error: 'Інвойс не знайдено' };
    }

    if (invoice.status === 'paid') {
      return { error: 'Цей інвойс уже оплачений' };
    }

    if (invoice.expires_at && new Date(invoice.expires_at) < new Date()) {
      return { error: 'Термін дії інвойса закінчився' };
    }

    // Get payer's card balance - use the first card or create one
    const payerCardResult = await sql`
      SELECT id, balance FROM user_cards WHERE customer_id = ${payerCustomerId} LIMIT 1
    `;

    const payerCard = payerCardResult.rows?.[0];

    if (!payerCard) {
      return { error: 'Карта не знайдена' };
    }

    // Parse amounts from DB (they come as strings)
    const payerBalance = parseFloat(payerCard.balance);
    const invoiceAmount = parseFloat(invoice.amount);

    console.log(`[PayInvoiceAction] Balance check:`, {
      payerBalance,
      invoiceAmount,
      payerCardBalance: payerCard.balance,
      invoiceAmount: invoice.amount,
    });

    if (isNaN(payerBalance) || isNaN(invoiceAmount)) {
      return { error: 'Помилка при конвертації суми' };
    }

    if (payerBalance < invoiceAmount) {
      return { 
        error: `Недостатньо коштів на балансі. Потрібно ${invoiceAmount.toFixed(2)} inpom, а на балансі ${payerBalance.toFixed(2)} inpom`,
        code: 'INSUFFICIENT_BALANCE'
      };
    }

    // Update invoice status
    await sql`
      UPDATE invoices SET status = 'paid', updated_at = NOW() WHERE id = ${invoiceId}
    `;

    // Deduct from payer
    const newPayerBalance = payerBalance - invoiceAmount;
    console.log(`[PayInvoiceAction] Updating payer balance:`, {
      payerId: payerCustomerId,
      oldBalance: payerBalance,
      amount: invoiceAmount,
      newBalance: newPayerBalance
    });

    await sql`
      UPDATE user_cards SET balance = ${newPayerBalance}, updated_at = NOW() WHERE id = ${payerCard.id}
    `;

    // Add to creator
    let creatorCard = null;
    
    // If invoice has creator_card_id, use that specific card
    if (invoice.creator_card_id) {
      const creatorCardResult = await sql`
        SELECT id, balance FROM user_cards WHERE id = ${invoice.creator_card_id}
      `;
      creatorCard = creatorCardResult.rows?.[0];
    } else {
      // Otherwise use the first card of the creator
      const creatorCardResult = await sql`
        SELECT id, balance FROM user_cards WHERE customer_id = ${invoice.creator_customer_id} LIMIT 1
      `;
      creatorCard = creatorCardResult.rows?.[0];
    }

    if (creatorCard) {
      const creatorBalance = parseFloat(creatorCard.balance);
      const newCreatorBalance = creatorBalance + invoiceAmount;
      
      console.log(`[PayInvoiceAction] Updating creator balance:`, {
        creatorId: invoice.creator_customer_id,
        oldBalance: creatorBalance,
        amount: invoiceAmount,
        newBalance: newCreatorBalance
      });

      await sql`
        UPDATE user_cards SET balance = ${newCreatorBalance}, updated_at = NOW() WHERE id = ${creatorCard.id}
      `;
    } else {
      console.log(`[PayInvoiceAction] Creating card for creator:`, invoice.creator_customer_id);
      
      await sql`
        INSERT INTO user_cards (customer_id, card_type, balance, created_at, updated_at)
        VALUES (${invoice.creator_customer_id}, 'black', ${invoiceAmount}, NOW(), NOW())
      `;
      
      // Fetch the newly created card
      const newCardResult = await sql`
        SELECT id FROM user_cards WHERE customer_id = ${invoice.creator_customer_id} ORDER BY created_at DESC LIMIT 1
      `;
      creatorCard = newCardResult.rows?.[0];
    }

    // Create transaction for payer
    console.log(`[PayInvoiceAction] Creating payer transaction`);
    await sql`
      INSERT INTO transactions (customer_id, card_id, type, amount, invoice_id, description, created_at)
      VALUES (${payerCustomerId}, ${payerCard.id}, 'payment_sent', ${invoiceAmount}, ${invoiceId}, ${'Оплата за інвойс'}, NOW())
    `;

    // Create transaction for creator
    console.log(`[PayInvoiceAction] Creating creator transaction`);
    if (creatorCard) {
      await sql`
        INSERT INTO transactions (customer_id, card_id, type, amount, invoice_id, description, created_at)
        VALUES (${invoice.creator_customer_id}, ${creatorCard.id}, 'payment_received', ${invoiceAmount}, ${invoiceId}, ${'Отримано платіж'}, NOW())
      `;
    }

    console.log(`[PayInvoiceAction] ✅ Payment processed successfully`);

    return {
      success: true,
      message: 'Оплата успішно проведена',
      payerNewBalance: newPayerBalance,
      creatorNewBalance: creatorCard ? parseFloat(creatorCard.balance) + invoiceAmount : invoiceAmount,
    };
  } catch (error) {
    console.error('Error paying invoice:', error);
    return { error: 'Помилка при обробці платежу' };
  }
}
