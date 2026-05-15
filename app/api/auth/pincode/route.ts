import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer, hashPassword, verifyPassword } from '@/lib/auth';
import { sql } from '@/lib/db';
import crypto from 'crypto';

export async function PUT(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPin, newPin } = body;

    if (!newPin) {
      return NextResponse.json(
        { error: 'PIN-код не можна залишати порожнім' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(newPin)) {
      return NextResponse.json(
        { error: 'PIN-код повинен містити рівно 6 цифр' },
        { status: 400 }
      );
    }

    // If currentPin is provided, verify it
    if (currentPin) {
      if (!/^\d{6}$/.test(currentPin)) {
        return NextResponse.json(
          { error: 'Поточний PIN-код невалідний' },
          { status: 400 }
        );
      }

      // Check if customer has existing pincode
      const result = await sql`
        SELECT pincode_hash FROM customers WHERE id = ${customer.id}
      `;

      const customerData = result.rows?.[0];

      if (!customerData?.pincode_hash) {
        return NextResponse.json(
          { error: 'Поточного PIN-коду не встановлено' },
          { status: 400 }
        );
      }

      // Verify current PIN
      const isPinValid = await verifyPassword(currentPin, customerData.pincode_hash);

      if (!isPinValid) {
        return NextResponse.json(
          { error: 'Неправильний поточний PIN-код' },
          { status: 400 }
        );
      }
    }

    // Hash new pincode
    const hashedPin = await hashPassword(newPin);

    // Update pincode
    await sql`
      UPDATE customers
      SET pincode_hash = ${hashedPin}, updated_at = NOW()
      WHERE id = ${customer.id}
    `;

    return NextResponse.json({
      message: 'PIN-код успішно встановлено',
    });
  } catch (error) {
    console.error('Error setting pincode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
