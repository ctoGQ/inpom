// GET /api/onboarding/questions
// Fetch all onboarding questionnaire questions and answer options

import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[Onboarding API] Fetching all questions');

    const result = await sql`
      SELECT 
        id,
        question_number,
        question_text,
        answer_option_1,
        answer_option_2,
        answer_option_3,
        category
      FROM onboarding_questions
      ORDER BY question_number ASC
    `;

    if (!result.rows || result.rows.length === 0) {
      console.warn('[Onboarding API] No questions found');
      return NextResponse.json(
        { error: 'No questions found' },
        { status: 404 }
      );
    }

    console.log(
      `[Onboarding API] ✅ Fetched ${result.rows.length} questions`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[Onboarding API] ❌ Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
