'use server';

import { sql } from '@/lib/db';

export async function createInvoice(
  customerId: number,
  amount: number,
  description: string,
  expiryMinutes: number
) {
  try {
    if (amount <= 0) {
      return { error: 'Сума повинна бути більше нуля' };
    }

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const result = await sql`
      INSERT INTO invoices (creator_customer_id, amount, description, status, expires_at)
      VALUES (${customerId}, ${amount}, ${description}, 'pending', ${expiresAt})
      RETURNING id, creator_customer_id, amount, description, status, created_at, expires_at
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
      SELECT id, creator_customer_id, amount, status, expires_at
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

    // Get payer's card balance
    const payerCardResult = await sql`
      SELECT id, balance FROM user_cards WHERE customer_id = ${payerCustomerId}
    `;

    const payerCard = payerCardResult.rows?.[0];

    if (!payerCard) {
      return { error: 'Карта не знайдена' };
    }

    if (payerCard.balance < invoice.amount) {
      return { error: 'Недостатньо коштів на балансі' };
    }

    // Update invoice status
    await sql`
      UPDATE invoices SET status = 'paid' WHERE id = ${invoiceId}
    `;

    // Deduct from payer
    const newPayerBalance = payerCard.balance - invoice.amount;
    await sql`
      UPDATE user_cards SET balance = ${newPayerBalance} WHERE id = ${payerCard.id}
    `;

    // Add to creator
    const creatorCardResult = await sql`
      SELECT id, balance FROM user_cards WHERE customer_id = ${invoice.creator_customer_id}
    `;

    const creatorCard = creatorCardResult.rows?.[0];

    if (creatorCard) {
      const newCreatorBalance = creatorCard.balance + invoice.amount;
      await sql`
        UPDATE user_cards SET balance = ${newCreatorBalance} WHERE id = ${creatorCard.id}
      `;
    }

    // Create transaction for payer
    await sql`
      INSERT INTO transactions (customer_id, type, amount, invoice_id, description, created_at)
      VALUES (${payerCustomerId}, 'payment_sent', ${invoice.amount}, ${invoiceId}, ${'Оплата за інвойс'}, NOW())
    `;

    // Create transaction for creator
    await sql`
      INSERT INTO transactions (customer_id, type, amount, invoice_id, description, created_at)
      VALUES (${invoice.creator_customer_id}, 'payment_received', ${invoice.amount}, ${invoiceId}, ${'Отримано платіж'}, NOW())
    `;

    return {
      success: true,
      message: 'Оплата успішно проведена',
    };
  } catch (error) {
    console.error('Error paying invoice:', error);
    return { error: 'Помилка при обробці платежу' };
  }
}
