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
    <header className="fixed inset-x-0 top-0 z-99 mx-auto w-full max-w-[1278px] bg-black text-white shadow-sm backdrop-blur-2xl">
      <nav className="flex w-full px-2 items-center justify-between" aria-label="Головна навігація">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMenu} className=" p-1" aria-label="INPOM — на головну">
            <Image src="/images/inpom-logo-full.png" alt="INPOM" width={123} height={34} />
          </Link>
          {/* <span className="hidden border-l border-white/20 pl-4 text-sm font-medium tracking-tight text-white/70 sm:block">Платформа дії</span> */}
        </div>
        <div className="flex items-center gap-1">
          {!isAuthenticated && <Link href="/auth/signin" className="rounded-lg border border-white/20 bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-white/85 sm:hidden">Увійти</Link>}
          {isAuthenticated && <Link href="/mycabinet" className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-white text-sm font-medium text-black sm:hidden" aria-label="Мій кабінет">{user?.avatar_url ? <Image src={user.avatar_url} alt="Аватар профілю" width={28} height={28} className="size-7 rounded-full object-cover" /> : <span className="flex size-7 items-center justify-center rounded-full bg-black text-white">{initials}</span>}</Link>}
          <button type="button" onClick={() => setIsOpen((value) => !value)} className="inline-flex size-10 items-center justify-center  text-white transition-colors hover:bg-white hover:text-black" aria-expanded={isOpen} aria-controls="public-menu" aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}>
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          {isAuthenticated ? (
            <Link href="/mycabinet" aria-label="Мій кабінет" className="hidden size-9 items-center justify-center rounded-full border border-white/20 bg-white text-sm font-medium text-black">
              {user?.avatar_url ? <Image src={user.avatar_url} alt="Аватар профілю" width={28} height={28} className="size-7 rounded-full object-cover" /> : <span className="flex size-7 items-center justify-center rounded-full bg-black text-white">{initials}</span>}
            </Link>
          ) : (
            <div className="hidden items-center gap-2"><Link href="/auth/signin" className="px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white">Увійти</Link><Link href="/auth/signup" className="bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:bg-white/85">Приєднатися</Link></div>
          )}
        </div>
      </nav>
      <AnimatePresence>
        {isOpen && <motion.div id="public-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} role="dialog" aria-label="Меню INPOM" className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-white/15 bg-black p-4 text-white shadow-xl sm:p-6 lg:p-8">
          
          <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {menuLinks.map(([label, href], index) => <Link key={href + label} href={href} onClick={closeMenu} className="group flex items-center gap-3 border border-white/15 bg-white/5 px-4 py-4 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white hover:text-black"><span className="flex size-7 shrink-0 items-center justify-center border border-white/20 bg-white/10 text-xs font-semibold text-white group-hover:bg-black/10 group-hover:text-black">{String(index + 1).padStart(2, "0")}</span><span className="flex-1">{label}</span><ChevronDown className="size-4 -rotate-90 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" /></Link>)}
          </div>
        </motion.div>}
      </AnimatePresence>
    </header>
  )
}
