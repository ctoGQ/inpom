import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Ім\'я не можна залишати порожнім' },
        { status: 400 }
      );
    }

    await sql`
      UPDATE customers
      SET name = ${name.trim()}, updated_at = NOW()
      WHERE id = ${customer.id}
    `;

    return NextResponse.json({
      message: 'Profile updated successfully',
      customer: {
        id: customer.id,
        name: name.trim(),
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
