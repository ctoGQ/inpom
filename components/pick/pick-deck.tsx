'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Sparkles, WalletCards } from 'lucide-react'

type Card = { id: number; title: string; description: string; image_url: string; category: string }
type Transaction = { id: number; amount: number; description: string; created_at: string }

type Position = { x: number; y: number }

export function PickDeck() {
  const [cards, setCards] = useState<Card[]>([])
  const [progress, setProgress] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [rewarded, setRewarded] = useState(false)
  const [drag, setDrag] = useState<Position>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const origin = useRef<Position | null>(null)
  const sending = useRef(false)

  async function load() {
    const response = await fetch('/api/pick')
    if (!response.ok) return
    const data = await response.json()
    setCards(data.cards)
    setProgress(Number(data.progress.response_count) || 0)
    setTransactions(data.transactions)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function choose(choice: 'like' | 'dislike') {
    if (sending.current) return
    const card = cards[0]
    if (!card) return
    sending.current = true
    setCards((current) => current.slice(1))
    setDrag({ x: choice === 'like' ? 900 : -900, y: drag.y })
    const response = await fetch('/api/pick', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId: card.id, choice }) })
    sending.current = false
    if (!response.ok) return
    const data = await response.json()
    setProgress(data.responseCount)
    if (data.rewarded) { setRewarded(true); setTimeout(load, 700) }
    else if (cards.length <= 2) load()
  }

  function pointerDown(event: React.PointerEvent<HTMLElement>) {
    if (sending.current || !cards[0]) return
    event.currentTarget.setPointerCapture(event.pointerId)
    origin.current = { x: event.clientX, y: event.clientY }
    setDragging(true)
  }

  function pointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!origin.current || !dragging) return
    setDrag({ x: event.clientX - origin.current.x, y: event.clientY - origin.current.y })
  }

  function pointerUp() {
    if (!origin.current) return
    const x = drag.x
    origin.current = null
    setDragging(false)
    if (Math.abs(x) > 110) choose(x > 0 ? 'like' : 'dislike')
    else setDrag({ x: 0, y: 0 })
  }

  if (loading) return <div className="flex min-h-[520px] items-center justify-center text-muted-foreground">Загружаем новые интересы…</div>
  const card = cards[0]
  const percent = Math.min(progress / 50 * 100, 100)
  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-20">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">INPOM / discovery</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Что тебе близко?</h1><p className="mt-2 text-sm text-muted-foreground">Потяни карточку влево или вправо — только свайпом.</p></div>
      {!rewarded && <div className="min-w-56 rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between text-sm"><span>Дневная миссия</span><span className="font-mono text-primary">{progress}/50</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">50 ответов = +5 INPOM</p></div>}
    </div>
    {rewarded && <div className="mission-complete rounded-2xl border border-primary/30 bg-primary/10 p-5 text-primary"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check /></span><div><p className="font-semibold">Дневная миссия выполнена</p><p className="mt-1 text-sm text-primary/80">+5 INPOM начислено. Продолжайте — новые интересы уже ждут.</p></div></div></div>}
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="flex min-h-[560px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-card/60 p-5">
        {card ? <div className="relative w-full max-w-[340px] touch-none select-none" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} style={{ transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${drag.x / 18}deg)`, transition: dragging ? 'none' : 'transform 420ms cubic-bezier(.2,.8,.2,1)' }}><div className="pointer-events-none absolute left-5 top-6 z-10 rotate-[-12deg] rounded-lg border-2 border-primary px-3 py-1 text-xl font-black tracking-widest text-primary" style={{ opacity: Math.min(Math.max(drag.x / 100, 0), 1) }}>LIKE</div><div className="pointer-events-none absolute right-5 top-6 z-10 rotate-[12deg] rounded-lg border-2 border-destructive px-3 py-1 text-xl font-black tracking-widest text-destructive" style={{ opacity: Math.min(Math.max(-drag.x / 100, 0), 1) }}>NOPE</div><article className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted shadow-2xl"><img draggable={false} src={card.image_url} alt={`Иллюстрация категории ${card.title}`} className="size-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent p-6 pt-24"><p className="font-mono text-xs uppercase tracking-widest text-primary">{card.category}</p><h2 className="mt-2 text-2xl font-semibold text-foreground">{card.title}</h2><p className="mt-2 text-sm leading-6 text-foreground/80">{card.description}</p></div></article></div> : <div className="text-center"><WalletCards className="mx-auto size-10 text-primary" /><h2 className="mt-4 text-xl font-semibold">Все доступные карточки просмотрены</h2><p className="mt-2 text-sm text-muted-foreground">Новые категории появятся в следующем обновлении.</p></div>}
        <p className="mt-5 text-center text-xs text-muted-foreground">Свайпни вправо, если нравится · влево, если нет</p>
      </section>
      <aside className="rounded-3xl border border-border bg-card p-5"><div className="flex items-center gap-2"><WalletCards className="size-4 text-primary" /><h2 className="font-semibold">Последние бонусы</h2></div><div className="mt-5 flex flex-col gap-3">{transactions.length ? transactions.map((transaction) => <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-3 text-sm"><div><p>{transaction.description}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleDateString('ru-RU')}</p></div><span className="font-mono text-primary">+{transaction.amount}</span></div>) : <p className="text-sm leading-6 text-muted-foreground">Здесь появится депозит после 50 выборов.</p>}</div></aside>
    </div>
  </div>
}
