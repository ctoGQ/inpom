"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Gem, LoaderPinwheel, Menu, X } from "lucide-react"

const primaryLinks = [
  ["Спільнота", "/community"],
  ["Розвиток", "/development"],
  ["Бізнес", "/business"],
  ["Міжнародні можливості", "/international"],
  ["Про INPOM", "/about"],
  ["Партнерство", "/partnership"],
  ["Новини", "/newsletter"],
] as const

const menuLinks = [
  ["Усі можливості", "/projects"],
  ["Спільнота", "/community"],
  ["Розвиток", "/development"],
  ["Проєкти", "/projects"],
  ["Новини", "/newsletter"],
  ["Прозорість", "/transparency"],
  ["Підтримати INPOM", "/donation"],
  ["Контакти", "/contacts"],
] as const

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ name?: string; avatar_url?: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data.user)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)
  const initials = user?.name?.charAt(0).toUpperCase() || "U"

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-foreground/10 bg-background/80 shadow-sm backdrop-blur-2xl">
      <nav className="flex min-h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-10" aria-label="Головна навігація">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMenu} className="rounded-xl p-1" aria-label="INPOM — на головну">
            <Image src="/home/inpom-logo.png" alt="INPOM" width={48} height={48} className="size-8" />
          </Link>
          <span className="hidden border-l border-foreground/10 pl-4 text-sm font-medium tracking-tight text-muted-foreground sm:block">Платформа дії</span>
        </div>
        <div className="flex items-center gap-1">
          {!isAuthenticated && <Link href="/auth/signin" className="rounded-lg bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:hidden">Увійти</Link>}
          {isAuthenticated && <Link href="/mycabinet" className="flex size-9 items-center justify-center rounded-full bg-card text-sm font-medium text-primary sm:hidden" aria-label="Мій кабінет">{user?.avatar_url ? <Image src={user.avatar_url} alt="Аватар профілю" width={28} height={28} className="size-7 rounded-full object-cover" /> : <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">{initials}</span>}</Link>}
          <button type="button" onClick={() => setIsOpen((value) => !value)} className="inline-flex size-10 items-center justify-center border border-foreground/10 text-secondary transition-colors hover:bg-primary hover:text-primary-foreground" aria-expanded={isOpen} aria-controls="public-menu" aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}>
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:block">Меню</span>
          {isAuthenticated ? (
            <Link href="/mycabinet" aria-label="Мій кабінет" className="hidden size-9 items-center justify-center rounded-full bg-card text-sm font-medium text-primary md:flex">
              {user?.avatar_url ? <Image src={user.avatar_url} alt="Аватар профілю" width={28} height={28} className="size-7 rounded-full object-cover" /> : <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">{initials}</span>}
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex"><Link href="/auth/signin" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Увійти</Link><Link href="/auth/signup" className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">Приєднатися</Link></div>
          )}
        </div>
      </nav>
      <AnimatePresence>
        {isOpen && <motion.div id="public-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} role="dialog" aria-label="Меню INPOM" className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-foreground/10 bg-background/95 p-4 shadow-xl backdrop-blur-2xl sm:p-6 lg:p-8">
          <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between border-b border-foreground/10 pb-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Навігація</p><p className="mt-1 text-sm text-muted-foreground">Усе, що є в INPOM</p></div>
            <span className="text-xs font-medium text-muted-foreground">{menuLinks.length} розділів</span>
          </div>
          <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {menuLinks.map(([label, href], index) => <Link key={href + label} href={href} onClick={closeMenu} className="group flex items-center gap-3 border border-foreground/10 bg-card px-4 py-4 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary hover:text-primary-foreground"><span className="flex size-7 shrink-0 items-center justify-center border border-primary/20 bg-primary/10 text-xs font-semibold text-primary group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground">{String(index + 1).padStart(2, "0")}</span><span className="flex-1">{label}</span><ChevronDown className="size-4 -rotate-90 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" /></Link>)}
          </div>
          <div className="mx-auto mt-6 grid max-w-7xl gap-2 border-t border-foreground/10 pt-4 sm:grid-cols-2">
            <Link href="/auth/signup" onClick={closeMenu} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90">Приєднатися до INPOM</Link>
            <Link href="/contacts" onClick={closeMenu} className="rounded-xl border border-foreground/10 px-4 py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">Поставити запитання</Link>
          </div>
        </motion.div>}
      </AnimatePresence>
    </header>
  )
}
