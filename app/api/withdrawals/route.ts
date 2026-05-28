import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cardId,
      customerId,
      withdrawType,
      amount,
      commission,
      firstName,
      lastName,
      cardNumber,
      cardExpiry,
      iban,
      bankName,
      swiftCode,
      notes,
    } = body;

    console.log('[Withdrawals API] Request body:', {
      cardId,
      customerId,
      withdrawType,
      amount,
      commission,
      firstName,
      lastName,
    });

    // Validate required fields
    if (!cardId || !customerId || !withdrawType || !amount || !firstName || !lastName) {
      console.error('[Withdrawals API] Missing required fields:', {
        cardId: !!cardId,
        customerId: !!customerId,
        withdrawType: !!withdrawType,
        amount: !!amount,
        firstName: !!firstName,
        lastName: !!lastName,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse numeric values
    const cardIdNum = parseInt(cardId, 10);
    const customerIdNum = parseInt(customerId, 10);
    const amountNum = parseFloat(amount);
    const commissionNum = parseFloat(commission);
    const totalAmount = amountNum + commissionNum;

    console.log('[Withdrawals API] Parsed values:', {
      cardIdNum,
      customerIdNum,
      amountNum,
      commissionNum,
      totalAmount,
    });

    if (isNaN(cardIdNum) || isNaN(customerIdNum)) {
      return NextResponse.json(
        { error: 'Invalid card ID or customer ID' },
        { status: 400 }
      );
    }

    if (amountNum <= 0 || !isFinite(amountNum)) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check card exists and belongs to customer
    const cardResult = await sql`
      SELECT id, balance FROM user_cards 
      WHERE id = ${cardIdNum} AND customer_id = ${customerIdNum}
    `;

    if (!cardResult.rows?.length) {
      console.error('[Withdrawals API] Card not found:', { cardIdNum, customerIdNum });
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const card = cardResult.rows[0];
    const cardBalance = parseFloat(card.balance);

    if (cardBalance < totalAmount) {
      console.error('[Withdrawals API] Insufficient balance:', {
        cardBalance,
        totalAmount,
      });
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal record
    const withdrawalResult = await sql`
      INSERT INTO withdrawals (
        card_id,
        customer_id,
        first_name,
        last_name,
        withdrawal_type,
        iban,
        bank_name,
        swift_code,
        card_number,
        card_expiry,
        amount,
        platform_fee,
        total_amount,
        status,
        notes,
        created_at,
        updated_at
      ) VALUES (
        ${cardIdNum},
        ${customerIdNum},
        ${firstName},
        ${lastName},
        ${withdrawType},
        ${withdrawType === 'iban' ? iban : null},
        ${withdrawType === 'iban' ? bankName : null},
        ${withdrawType === 'iban' ? swiftCode : null},
        ${withdrawType === 'card' ? cardNumber : null},
        ${withdrawType === 'card' ? cardExpiry : null},
        ${amountNum},
        ${commissionNum},
        ${totalAmount},
        'pending',
        ${notes || null},
        NOW(),
        NOW()
      )
      RETURNING id, status, created_at
    `;

    if (!withdrawalResult.rows?.length) {
      throw new Error('Failed to create withdrawal record');
    }

    const withdrawal = withdrawalResult.rows[0];

    // Deduct amount from card balance
    const newBalance = cardBalance - totalAmount;
    await sql`
      UPDATE user_cards 
      SET balance = ${newBalance}, updated_at = NOW() 
      WHERE id = ${cardIdNum}
    `;

    // Create transaction record
    const transactionResult = await sql`
      INSERT INTO transactions (
        customer_id,
        card_id,
        type,
        amount,
        description,
        created_at
      ) VALUES (
        ${customerIdNum},
        ${cardIdNum},
        'withdraw',
        ${amountNum},
        ${'Withdrawal to ' + (withdrawType === 'card' ? 'card' : 'IBAN')},
        NOW()
      )
      RETURNING id
    `;

    console.log('[Withdrawals API] Success:', {
      withdrawalId: withdrawal.id,
      transactionId: transactionResult.rows?.[0]?.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request created successfully',
      withdrawal: {
        id: withdrawal.id,
        status: withdrawal.status,
        amount: amountNum,
        commission: commissionNum,
        totalDeducted: totalAmount,
      },
    });
  } catch (error) {
    console.error('[Withdrawals API] Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
