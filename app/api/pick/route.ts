'use server'

import { NextResponse } from 'next/server'
import { getSessionCustomer } from '@/lib/auth'
import { sql } from '@/lib/db'
import { updateCabinetTask } from '@/lib/cabinet-tasks'

const DAILY_LIMIT = 50
const PAGE_SIZE = 8

type Cursor = { displayOrder: number; id: number }

function parseCursor(value: string | null): Cursor | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    if (Number.isInteger(parsed.displayOrder) && Number.isInteger(parsed.id)) return parsed
  } catch {}
  return null
}

function encodeCursor(card: { display_order: number; id: number }) {
  return Buffer.from(JSON.stringify({ displayOrder: card.display_order, id: card.id })).toString('base64url')
}

export async function GET(request: Request) {
  const customer = await getSessionCustomer()
  if (!customer) return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })

  const cursor = parseCursor(new URL(request.url).searchParams.get('cursor'))
  const progress = await sql`
    SELECT response_count, rewarded_at FROM pick_daily_progress
    WHERE customer_id = ${customer.id} AND day_key = CURRENT_DATE
  `
  const cards = cursor
    ? await sql`
      SELECT p.id, p.title, p.description, p.image_url, c.name AS category, p.display_order
      FROM pick_cards p JOIN shop_categories c ON c.id = p.category_id
      WHERE p.is_active = true AND NOT EXISTS (
        SELECT 1 FROM pick_responses r WHERE r.customer_id = ${customer.id} AND r.pick_card_id = p.id
      ) AND (p.display_order > ${cursor.displayOrder} OR (p.display_order = ${cursor.displayOrder} AND p.id > ${cursor.id}))
      ORDER BY p.display_order, p.id LIMIT ${PAGE_SIZE}
    `
    : await sql`
      SELECT p.id, p.title, p.description, p.image_url, c.name AS category, p.display_order
      FROM pick_cards p JOIN shop_categories c ON c.id = p.category_id
      WHERE p.is_active = true AND NOT EXISTS (
        SELECT 1 FROM pick_responses r WHERE r.customer_id = ${customer.id} AND r.pick_card_id = p.id
      )
      ORDER BY p.display_order, p.id LIMIT ${PAGE_SIZE}
    `

  const lastCard = cards.rows[cards.rows.length - 1]
  return NextResponse.json({
    cards: cards.rows.map(({ display_order: _displayOrder, ...card }) => card),
    nextCursor: lastCard && cards.rows.length === PAGE_SIZE ? encodeCursor(lastCard) : null,
    hasMore: cards.rows.length === PAGE_SIZE,
    progress: progress.rows[0] || { response_count: 0, rewarded_at: null },
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
      await sql`UPDATE user_cards SET balance = balance + 5 WHERE id = ${activeCardId} AND customer_id = ${customer.id}`
      await sql`
        UPDATE pick_daily_progress SET rewarded_at = NOW(), reward_transaction_id = ${transaction.rows[0].id}, updated_at = NOW()
        WHERE customer_id = ${customer.id} AND day_key = CURRENT_DATE AND rewarded_at IS NULL
      `
      rewarded = true
    }
  }
  const totalPicks = await sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM pick_responses WHERE customer_id = ${customer.id}`
  const taskReward = await updateCabinetTask(customer.id, 'first_50_picks', Math.min(100, (Number(totalPicks.rows[0]?.count || 0) / 50) * 100))
  return NextResponse.json({ success: true, responseCount: current.response_count, rewarded, taskRewarded: taskReward.rewarded })
}
