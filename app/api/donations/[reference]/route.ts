import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(_request: NextRequest, context: { params: Promise<{ reference: string }> }) {
  const { reference } = await context.params
  const result = await sql`SELECT reference, amount, currency, method_type, status, created_at, updated_at FROM donation_orders WHERE reference = ${reference} LIMIT 1`
  if (!result.rows.length) return NextResponse.json({ error: "Заявку не знайдено" }, { status: 404 })
  const donation = result.rows[0]
  await sql`UPDATE transactions SET status = ${donation.status} WHERE donation_reference = ${reference}`
  return NextResponse.json({ donation })
}
