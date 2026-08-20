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
    <header className="fixed top-0 z-50 w-full px-2 pt-2">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between rounded-2xl border border-foreground/10 bg-background/90 px-2 py-2 shadow-sm backdrop-blur-xl" aria-label="Головна навігація">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMenu} className="rounded-xl p-1" aria-label="INPOM — на головну">
            <Image src="/home/inpom-logo.png" alt="INPOM" width={48} height={48} className="size-8" />
          </Link>
          <button type="button" onClick={() => setIsOpen((value) => !value)} className="inline-flex size-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-primary hover:text-primary-foreground" aria-expanded={isOpen} aria-controls="public-menu" aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}>
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="hidden items-center gap-1 lg:flex">
            {primaryLinks.map(([label, href], index) => (
              <span key={href} className="flex items-center gap-1">
                {index === 3 && <span className="px-1 text-xs text-muted-foreground">/</span>}
                <Link href={href} className={`rounded-lg px-2 py-1 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground ${index === 0 ? "text-primary" : "text-muted-foreground"}`}>{label}</Link>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/donation" className="hidden items-center rounded-lg bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:flex"><Gem className="mr-2 size-4" />Підтримати INPOM</Link>
          <Link href="/projects" className="hidden items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground md:flex"><LoaderPinwheel className="mr-2 size-4" />Проєкти</Link>
          {isAuthenticated ? (
            <Link href="/mycabinet" aria-label="Мій кабінет" className="hidden size-9 items-center justify-center rounded-full bg-card text-sm font-medium text-primary md:flex">
              {user?.avatar_url ? <Image src={user.avatar_url} alt="Аватар профілю" width={28} height={28} className="size-7 rounded-full object-cover" /> : <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">{initials}</span>}
            </Link>
          ) : (
            <div className="hidden items-center gap-1 md:flex"><Link href="/auth/signin" className="rounded-lg bg-card px-3 py-2 text-sm font-medium text-primary">Увійти</Link><Link href="/auth/signup" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Приєднатися</Link></div>
          )}
        </div>
      </nav>
      <AnimatePresence>
        {isOpen && <motion.div id="public-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} role="dialog" aria-label="Меню INPOM" className="mx-2 mt-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-2xl border border-foreground/10 bg-background/95 p-4 shadow-xl backdrop-blur-xl sm:mx-auto sm:p-5">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {menuLinks.map(([label, href]) => <Link key={href + label} href={href} onClick={closeMenu} className="flex items-center justify-between rounded-xl bg-card px-4 py-4 text-sm text-foreground transition-colors hover:bg-primary hover:text-primary-foreground">{label}<ChevronDown className="size-4 -rotate-90" /></Link>)}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-foreground/10 pt-4 text-sm text-muted-foreground"><span>Приєднатися до руху:</span><Link href="/auth/signup" onClick={closeMenu} className="text-primary underline-offset-4 hover:underline">створити профіль</Link><Link href="/contacts" onClick={closeMenu} className="text-primary underline-offset-4 hover:underline">поставити запитання</Link></div>
        </motion.div>}
      </AnimatePresence>
    </header>
  )
}
