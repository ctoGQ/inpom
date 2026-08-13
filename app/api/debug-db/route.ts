import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`SELECT NOW() as now`;
    return NextResponse.json({ ok: true, now: result.rows?.[0] });
  } catch (error) {
    console.error('Debug DB error:', error);
    const message = (error as any)?.message || String(error);
    return NextResponse.json({ ok: false, error: message, stack: (error as any)?.stack }, { status: 500 });
  }
}
