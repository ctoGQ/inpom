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

    // Validate required fields
    if (!cardId || !customerId || !withdrawType || !amount || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate withdrawal type
    if (!['card', 'iban'].includes(withdrawType)) {
      return NextResponse.json(
        { error: 'Invalid withdrawal type' },
        { status: 400 }
      );
    }

    // Validate method-specific fields
    if (withdrawType === 'card' && (!cardNumber || !cardExpiry)) {
      return NextResponse.json(
        { error: 'Card details are required' },
        { status: 400 }
      );
    }

    if (withdrawType === 'iban' && (!iban || !bankName || !swiftCode)) {
      return NextResponse.json(
        { error: 'IBAN details are required' },
        { status: 400 }
      );
    }

    const amountNum = parseFloat(amount);
    const commissionNum = parseFloat(commission);
    const totalAmount = amountNum + commissionNum;

    if (amountNum <= 0 || !isFinite(amountNum)) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check card exists and belongs to customer
    const cardResult = await sql`
      SELECT id, balance FROM user_cards 
      WHERE id = ${parseInt(cardId)} AND customer_id = ${customerId}
    `;

    if (!cardResult.rows?.length) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const card = cardResult.rows[0];
    const cardBalance = parseFloat(card.balance);

    if (cardBalance < totalAmount) {
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
        ${parseInt(cardId)},
        ${customerId},
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
      WHERE id = ${parseInt(cardId)}
    `;

    // Create transaction record
    await sql`
      INSERT INTO transactions (
        customer_id,
        card_id,
        type,
        amount,
        description,
        created_at
      ) VALUES (
        ${customerId},
        ${parseInt(cardId)},
        'withdraw',
        ${amountNum},
        ${'Withdrawal to ' + (withdrawType === 'card' ? 'card' : 'IBAN')},
        NOW()
      )
    `;

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
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
