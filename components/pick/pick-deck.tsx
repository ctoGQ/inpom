'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Sparkles, WalletCards } from 'lucide-react'

type Card = { id: number; title: string; description: string; image_url: string; category: string }
type Position = { x: number; y: number }

type PickResponse = {
  cards: Card[]
  nextCursor: string | null
  hasMore: boolean
  progress: { response_count: number; rewarded_at: string | null }
}

export function PickDeck() {
  const [cards, setCards] = useState<Card[]>([])
  const [progress, setProgress] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [rewarded, setRewarded] = useState(false)
  const [drag, setDrag] = useState<Position>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const origin = useRef<Position | null>(null)
  const sending = useRef(false)

  async function load(cursor?: string | null) {
    const response = await fetch(cursor ? `/api/pick?cursor=${encodeURIComponent(cursor)}` : '/api/pick')
    if (!response.ok) return
    const data = await response.json() as PickResponse
    setCards((current) => cursor ? [...current, ...data.cards] : data.cards)
    setNextCursor(data.nextCursor)
    setHasMore(data.hasMore)
    setProgress(Number(data.progress.response_count) || 0)
    setRewarded(Boolean(data.progress.rewarded_at))
    setLoading(false)
    setLoadingMore(false)
  }

  useEffect(() => { load() }, [])

  async function loadMore() {
    if (!nextCursor || !hasMore || loadingMore) return
    setLoadingMore(true)
    await load(nextCursor)
  }

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
    if (data.rewarded) setRewarded(true)
    setDrag({ x: 0, y: 0 })
    if (cards.length <= 2) loadMore()
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

  if (loading) return <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center text-muted-foreground">Загружаем новые интересы…</div>
  const card = cards[0]
  const percent = Math.min(progress / 50 * 100, 100)

  return <div className="pick-deck relative flex min-h-[100dvh] w-full min-w-0 flex-col items-center overflow-hidden px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(4.75rem+env(safe-area-inset-top))]">
    <div className="pick-mission fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center gap-3"><Sparkles className="size-4 shrink-0 text-primary" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between text-xs"><span className="font-medium">Дневная миссия</span><span className="font-mono text-primary">{progress}/50</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} /></div></div>{rewarded && <Check className="size-5 text-primary" />}</div>
    </div>
    <div className="pick-card-stage flex min-h-0 w-full min-w-0 max-w-[360px] flex-1 items-center justify-center overflow-visible">
      {card ? <div className="relative w-full touch-none select-none" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} style={{ transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${drag.x / 18}deg)`, transition: dragging ? 'none' : 'transform 420ms cubic-bezier(.2,.8,.2,1)' }}><div className="pointer-events-none absolute left-5 top-6 z-10 rotate-[-12deg] rounded-lg border-2 border-primary px-3 py-1 text-xl font-black tracking-widest text-primary" style={{ opacity: Math.min(Math.max(drag.x / 100, 0), 1) }}>LIKE</div><div className="pointer-events-none absolute right-5 top-6 z-10 rotate-[12deg] rounded-lg border-2 border-destructive px-3 py-1 text-xl font-black tracking-widest text-destructive" style={{ opacity: Math.min(Math.max(-drag.x / 100, 0), 1) }}>NOPE</div><article className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted shadow-2xl"><img draggable={false} src={card.image_url} alt={`Иллюстрация категории ${card.title}`} className="size-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent p-6 pt-24"><p className="font-mono text-xs uppercase tracking-widest text-primary">{card.category}</p><h2 className="mt-2 text-2xl font-semibold text-foreground">{card.title}</h2><p className="mt-2 text-sm leading-6 text-foreground/80">{card.description}</p></div></article></div> : <div className="text-center"><WalletCards className="mx-auto size-10 text-primary" /><h2 className="mt-4 text-xl font-semibold">Карточки закончились</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Мы показали все доступные интересы. Новые карточки появятся позже.</p></div>}
    </div>
    {loadingMore && <p className="mt-3 text-xs text-muted-foreground">Загружаем ещё…</p>}
  </div>
}
