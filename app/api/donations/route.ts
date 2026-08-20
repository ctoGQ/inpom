import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { sql } from "@/lib/db"
import { getSessionCustomer } from "@/lib/auth"

const methods = new Set(["iban", "card", "crypto"])
const currencies = new Set(["UAH", "EUR", "USD"])

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type")
  const currency = request.nextUrl.searchParams.get("currency")
  if (!type || !methods.has(type) || !currency || !currencies.has(currency)) return NextResponse.json({ error: "Некоректні параметри" }, { status: 400 })
  const result = await sql`SELECT id, method_type, currency, label, recipient_name, details, expires_minutes FROM donation_payment_methods WHERE method_type = ${type} AND currency = ${currency} AND is_active = true ORDER BY id ASC LIMIT 1`
  if (!result.rows.length) return NextResponse.json({ error: "Реквізити для цього способу ще не налаштовані" }, { status: 404 })
  const method = result.rows[0]
  return NextResponse.json({ method, expiresAt: new Date(Date.now() + Number(method.expires_minutes || 30) * 60000).toISOString() })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const amount = Number(body.amount)
    const type = String(body.methodType || "")
    const currency = String(body.currency || "")
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000 || !methods.has(type) || !currencies.has(currency)) return NextResponse.json({ error: "Перевірте суму, валюту та спосіб оплати" }, { status: 400 })
    const method = await sql`SELECT id, label, recipient_name, details, expires_minutes FROM donation_payment_methods WHERE method_type = ${type} AND currency = ${currency} AND is_active = true LIMIT 1`
    if (!method.rows.length) return NextResponse.json({ error: "Реквізити для цього способу ще не налаштовані" }, { status: 404 })
    const customer = await getSessionCustomer().catch(() => null)
    const row = method.rows[0]
    const reference = `INPOM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
    const expiresAt = new Date(Date.now() + Number(row.expires_minutes || 30) * 60000)
    await sql`INSERT INTO donation_orders (reference, user_id, email, donor_name, amount, currency, method_type, payment_method_id, payment_details_snapshot, expires_at) VALUES (${reference}, ${customer?.id ? String(customer.id) : null}, ${body.email || customer?.email || null}, ${body.name || customer?.name || null}, ${amount.toFixed(2)}, ${currency}, ${type}, ${row.id}, ${JSON.stringify({ label: row.label, recipientName: row.recipient_name, details: row.details })}, ${expiresAt})`
    return NextResponse.json({ reference, expiresAt: expiresAt.toISOString(), status: "pending" })
  } catch (error) {
    console.error("[v0] donation order error", error)
    return NextResponse.json({ error: "Не вдалося створити заявку" }, { status: 500 })
  }
}
