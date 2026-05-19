// POST /api/onboarding/submit
// Save customer's onboarding questionnaire responses

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface SubmitRequest {
  customerId: number;
  answers: Record<number, string>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SubmitRequest = await request.json();
    const { customerId, answers } = body;

    // Security: Ensure customer can only submit their own responses
    if (customerId !== customer.id) {
      console.warn(
        `[Onboarding Submit] ❌ Customer ${customer.id} attempted to submit for ${customerId}`
      );
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    console.log(
      `[Onboarding Submit] Processing for customer ${customerId}`
    );

    // Validate we have all 10 answers
    const answerCount = Object.keys(answers).length;
    if (answerCount < 10) {
      console.warn(
        `[Onboarding Submit] ❌ Incomplete responses: ${answerCount}/10`
      );
      return NextResponse.json(
        { error: `Incomplete responses: ${answerCount}/10 answers provided` },
        { status: 400 }
      );
    }

    // Check if customer already completed onboarding
    const existingResponse = await sql`
      SELECT id FROM customer_onboarding_responses 
      WHERE customer_id = ${customerId}
    `;

    if (existingResponse.rows && existingResponse.rows.length > 0) {
      console.log(
        `[Onboarding Submit] Customer already completed onboarding, updating`
      );

      // Update existing responses
      await sql`
        UPDATE customer_onboarding_responses
        SET 
          question_1_answer = ${answers[1] || null},
          question_2_answer = ${answers[2] || null},
          question_3_answer = ${answers[3] || null},
          question_4_answer = ${answers[4] || null},
          question_5_answer = ${answers[5] || null},
          question_6_answer = ${answers[6] || null},
          question_7_answer = ${answers[7] || null},
          question_8_answer = ${answers[8] || null},
          question_9_answer = ${answers[9] || null},
          question_10_answer = ${answers[10] || null},
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE customer_id = ${customerId}
      `;
    } else {
      // Insert new responses
      await sql`
        INSERT INTO customer_onboarding_responses
        (customer_id, question_1_answer, question_2_answer, question_3_answer,
         question_4_answer, question_5_answer, question_6_answer, question_7_answer,
         question_8_answer, question_9_answer, question_10_answer, completed_at)
        VALUES
        (${customerId}, ${answers[1] || null}, ${answers[2] || null}, ${answers[3] || null},
         ${answers[4] || null}, ${answers[5] || null}, ${answers[6] || null},
         ${answers[7] || null}, ${answers[8] || null}, ${answers[9] || null},
         ${answers[10] || null}, CURRENT_TIMESTAMP)
      `;
    }

    // Update customer onboarding_completed flag (if column exists)
    try {
      await sql`
        UPDATE customers
        SET 
          onboarding_completed = TRUE,
          onboarding_completed_at = CURRENT_TIMESTAMP
        WHERE id = ${customerId}
      `;
    } catch (error) {
      console.log(
        '[Onboarding Submit] Column onboarding_completed may not exist yet'
      );
    }

    console.log(
      `[Onboarding Submit] ✅ Successfully saved responses for customer ${customerId}`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Responses saved successfully',
        customerId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Onboarding Submit] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save responses',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined
      },
      { status: 500 }
    );
  }
}
