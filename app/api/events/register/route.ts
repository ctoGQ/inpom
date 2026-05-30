import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const customer = await getSessionCustomer();

    if (!customer) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { eventId, ticketId, fullName, email, phone, companyName, specialRequirements } = body;

    if (!eventId || !ticketId || !fullName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get ticket details to check price
    const ticketResult = await sql`
      SELECT et.id, et.price, et.quantity_available, 
             COALESCE(COUNT(er.id), 0) as quantity_sold
      FROM event_tickets et
      LEFT JOIN event_registrations er ON et.id = er.ticket_id AND er.status = 'confirmed'
      WHERE et.id = ${ticketId} AND et.event_id = ${eventId}
      GROUP BY et.id
    `;

    if (ticketResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticket = ticketResult.rows[0];

    // Check ticket availability
    if (ticket.quantity_sold >= ticket.quantity_available) {
      return NextResponse.json(
        { error: 'Ticket sold out' },
        { status: 400 }
      );
    }

    // Check customer balance
    const customerResult = await sql`
      SELECT balance FROM customers WHERE id = ${customer.id}
    `;

    if (customerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customerBalance = customerResult.rows[0].balance;

    if (customerBalance < ticket.price) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Generate QR code
    const qrCodeData = `EVENT-${eventId}-TICKET-${ticketId}-${customer.id}-${Date.now()}`;
    const qrCode = crypto.createHash('sha256').update(qrCodeData).digest('hex').substring(0, 16).toUpperCase();

    // Create registration
    const registrationResult = await sql`
      INSERT INTO event_registrations (
        event_id,
        ticket_id,
        customer_id,
        full_name,
        email,
        phone,
        company_name,
        special_requirements,
        qr_code,
        payment_status,
        status,
        created_at,
        updated_at
      ) VALUES (${eventId}, ${ticketId}, ${customer.id}, ${fullName}, ${email}, ${phone}, ${companyName || null}, ${specialRequirements || null}, ${qrCode}, 'completed', 'confirmed', NOW(), NOW())
      RETURNING id
    `;

    const registrationId = registrationResult.rows[0].id;

    // Deduct from customer balance
    const newBalance = customerBalance - ticket.price;
    await sql`
      UPDATE customers 
      SET balance = ${newBalance}, updated_at = NOW()
      WHERE id = ${customer.id}
    `;

    // Record transaction
    await sql`
      INSERT INTO transactions (
        customer_id,
        transaction_type,
        amount,
        reference_type,
        reference_id,
        description,
        status,
        created_at,
        updated_at
      ) VALUES (${customer.id}, 'debit', ${ticket.price}, 'event_registration', ${registrationId}, ${'Event ticket purchase'}, 'completed', NOW(), NOW())
    `;

    return NextResponse.json({
      registrationId,
      message: 'Registration successful',
      newBalance,
      qrCode,
    });
  } catch (err) {
    console.error('Error registering for event:', err);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}
