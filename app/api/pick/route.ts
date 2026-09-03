'use server'

import { NextResponse } from 'next/server'
import { getSessionCustomer } from '@/lib/auth'
import { sql } from '@/lib/db'

const DAILY_LIMIT = 50

export async function GET() {
  const customer = await getSessionCustomer()
  if (!customer) return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })

  const progress = await sql`
    SELECT response_count, rewarded_at FROM pick_daily_progress
    WHERE customer_id = ${customer.id} AND day_key = CURRENT_DATE
  `
  const cards = await sql`
    SELECT p.id, p.title, p.description, p.image_url, c.name AS category
    FROM pick_cards p JOIN shop_categories c ON c.id = p.category_id
    WHERE p.is_active = true AND NOT EXISTS (
      SELECT 1 FROM pick_responses r WHERE r.customer_id = ${customer.id} AND r.pick_card_id = p.id
    )
    ORDER BY p.display_order, p.id LIMIT 3
  `
  const transactions = await sql`
    SELECT id, amount, description, created_at FROM transactions
    WHERE customer_id = ${customer.id} AND type = 'deposit' AND description ILIKE '%Pick%'
    ORDER BY created_at DESC LIMIT 10
  `
  return NextResponse.json({
    cards: cards.rows,
    progress: progress.rows[0] || { response_count: 0, rewarded_at: null },
    transactions: transactions.rows,
    dailyLimit: DAILY_LIMIT,
  })
}

export async function POST(request: Request) {
  const customer = await getSessionCustomer()
  if (!customer) return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const cardId = Number(body?.cardId)
  const choice = body?.choice
  if (!Number.isInteger(cardId) || !['like', 'dislike'].includes(choice)) {
    return NextResponse.json({ error: 'Некорректный выбор' }, { status: 400 })
  }

  const result = await sql`
    INSERT INTO pick_responses (customer_id, pick_card_id, choice)
    VALUES (${customer.id}, ${cardId}, ${choice})
    ON CONFLICT (customer_id, pick_card_id) DO NOTHING
    RETURNING id
  `
  if (!result.rows.length) return NextResponse.json({ error: 'Карточка уже оценена' }, { status: 409 })

  const progress = await sql`
    INSERT INTO pick_daily_progress (customer_id, day_key, response_count)
    VALUES (${customer.id}, CURRENT_DATE, 1)
    ON CONFLICT (customer_id, day_key) DO UPDATE SET
      response_count = LEAST(pick_daily_progress.response_count + 1, ${DAILY_LIMIT}), updated_at = NOW()
    RETURNING response_count, rewarded_at
  `
  const current = progress.rows[0]
  let rewarded = false
  if (Number(current.response_count) >= DAILY_LIMIT && !current.rewarded_at) {
    const card = await sql`
      SELECT id FROM user_cards WHERE customer_id = ${customer.id} ORDER BY created_at ASC LIMIT 1
    `
    const activeCardId = card.rows[0]?.id
    if (activeCardId) {
      const transaction = await sql`
        INSERT INTO transactions (customer_id, card_id, type, amount, description, created_at)
        VALUES (${customer.id}, ${activeCardId}, 'deposit', 5, 'Pick daily reward — 50 choices', NOW()) RETURNING id
      `
      await sql`
        UPDATE user_cards SET balance = balance + 5 WHERE id = ${activeCardId} AND customer_id = ${customer.id}
      `
      await sql`
        UPDATE pick_daily_progress SET rewarded_at = NOW(), reward_transaction_id = ${transaction.rows[0].id}, updated_at = NOW()
        WHERE customer_id = ${customer.id} AND day_key = CURRENT_DATE AND rewarded_at IS NULL
      `
      rewarded = true
    }
  }
  return NextResponse.json({ success: true, responseCount: current.response_count, rewarded })
}
