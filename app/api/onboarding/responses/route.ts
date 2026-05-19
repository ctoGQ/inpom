// GET /api/onboarding/responses
// Fetch customer's onboarding responses

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const customer = await getSessionCustomer();

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(
      `[Onboarding Responses] Fetching responses for customer ${customer.id}`
    );

    const result = await sql`
      SELECT 
        id,
        customer_id,
        question_1_answer,
        question_2_answer,
        question_3_answer,
        question_4_answer,
        question_5_answer,
        question_6_answer,
        question_7_answer,
        question_8_answer,
        question_9_answer,
        question_10_answer,
        completed_at,
        created_at,
        updated_at
      FROM customer_onboarding_responses
      WHERE customer_id = ${customer.id}
    `;

    if (!result.rows || result.rows.length === 0) {
      console.log(
        `[Onboarding Responses] No responses found for customer ${customer.id}`
      );
      return NextResponse.json(
        { message: 'No responses found', completed: false },
        { status: 200 }
      );
    }

    console.log(
      `[Onboarding Responses] ✅ Found responses for customer ${customer.id}`
    );

    return NextResponse.json(
      {
        completed: true,
        ...result.rows[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Onboarding Responses] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
