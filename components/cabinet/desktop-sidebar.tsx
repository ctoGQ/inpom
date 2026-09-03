"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, UserRound, ArrowLeftRight, Store, HeartHandshake, Settings, LogOut, Sparkles } from "lucide-react"
const items = [
  { href: "/mycabinet", label: "Огляд", icon: LayoutDashboard, exact: true },
  { href: "/mycabinet/account", label: "Профіль", icon: UserRound },
  { href: "/pick", label: "Pick інтересів", icon: Sparkles },
  { href: "/mycabinet/transactions", label: "Транзакції", icon: ArrowLeftRight },
  { href: "/mycabinet/shop", label: "Магазин", icon: Store },
  { href: "/donation", label: "Пожертви", icon: HeartHandshake },
]

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/60 lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-border px-6">
        <Link href="/mycabinet" className="font-serif text-xl font-semibold tracking-tight text-foreground">INPOM</Link>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">Cabinet</span>
      </div>
      <nav aria-label="Навігація кабінету" className="flex-1 space-y-1 p-4">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
          return <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", active && "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary")}><Icon className="size-4" aria-hidden="true" />{label}</Link>
        })}
      </nav>
      <div className="space-y-1 border-t border-border p-4">
        <Link href="/mycabinet/account" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Settings className="size-4" aria-hidden="true" />Налаштування</Link>
        <Link href="/auth/signout" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><LogOut className="size-4" aria-hidden="true" />Вийти</Link>
      </div>
    </aside>
  )
}
