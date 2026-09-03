'use client'

import { useEffect, useState } from 'react'
import { Heart, X, Sparkles, WalletCards } from 'lucide-react'

type Card = { id: number; title: string; description: string; image_url: string; category: string }
type Transaction = { id: number; amount: number; description: string; created_at: string }

export function PickDeck() {
  const [cards, setCards] = useState<Card[]>([])
  const [progress, setProgress] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [rewarded, setRewarded] = useState(false)

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
    const card = cards[0]
    if (!card) return
    setCards((current) => current.slice(1))
    const response = await fetch('/api/pick', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId: card.id, choice }) })
    if (!response.ok) return
    const data = await response.json()
    setProgress(data.responseCount)
    if (data.rewarded) { setRewarded(true); setTimeout(load, 900) }
    else if (cards.length <= 2) load()
  }

  if (loading) return <div className="flex min-h-[520px] items-center justify-center text-muted-foreground">Загружаем новые интересы…</div>
  const card = cards[0]
  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">INPOM / discovery</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Что тебе близко?</h1><p className="mt-2 text-sm text-muted-foreground">Свайпай категории — мы собираем твою карту интересов.</p></div>
      <div className="min-w-56 rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between text-sm"><span>Сегодня</span><span className="font-mono text-primary">{progress}/50</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(progress / 50 * 100, 100)}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">50 выборов = +5 INPOM</p></div>
    </div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-border bg-card/60 p-5">
        {rewarded && <div className="mb-4 flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"><Sparkles className="size-4" /> +5 INPOM уже на карте</div>}
        {card ? <><article className="relative aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-2xl border border-border bg-muted shadow-2xl"><img src={card.image_url} alt={`Иллюстрация категории ${card.title}`} className="size-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent p-6 pt-24"><p className="font-mono text-xs uppercase tracking-widest text-primary">{card.category}</p><h2 className="mt-2 text-2xl font-semibold text-foreground">{card.title}</h2><p className="mt-2 text-sm leading-6 text-foreground/80">{card.description}</p></div></article><div className="mt-5 flex items-center gap-5"><button aria-label="Не нравится" onClick={() => choose('dislike')} className="flex size-14 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-destructive hover:text-destructive"><X className="size-6" /></button><button aria-label="Нравится" onClick={() => choose('like')} className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"><Heart className="size-7 fill-current" /></button></div></> : <div className="text-center"><WalletCards className="mx-auto size-10 text-primary" /><h2 className="mt-4 text-xl font-semibold">Все доступные карточки просмотрены</h2><p className="mt-2 text-sm text-muted-foreground">Новые категории появятся в следующем обновлении.</p></div>}
      </section>
      <aside className="rounded-3xl border border-border bg-card p-5"><div className="flex items-center gap-2"><WalletCards className="size-4 text-primary" /><h2 className="font-semibold">Последние бонусы</h2></div><div className="mt-5 flex flex-col gap-3">{transactions.length ? transactions.map((transaction) => <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-3 text-sm"><div><p>{transaction.description}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleDateString('ru-RU')}</p></div><span className="font-mono text-primary">+{transaction.amount}</span></div>) : <p className="text-sm leading-6 text-muted-foreground">Здесь появится депозит после 50 выборов.</p>}</div></aside>
    </div>
  </div>
}
