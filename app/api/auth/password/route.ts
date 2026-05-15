import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer, hashPassword, verifyPassword } from '@/lib/auth';
import { sql } from '@/lib/db';

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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Старий та новий паролі обов\'язкові' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Новий пароль повинен містити мінімум 6 символів' },
        { status: 400 }
      );
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, customer.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неправильний поточний пароль' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await sql`
      UPDATE customers
      SET password_hash = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${customer.id}
    `;

    return NextResponse.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
