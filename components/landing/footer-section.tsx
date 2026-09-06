import Link from "next/link"
import { ArrowUpRight, Instagram, Linkedin, Facebook } from "lucide-react"

const footerLinks = {
  "Про INPOM": [["Хто ми", "/who-we-are"], ["Наша ідея", "/idea"], ["Як це працює", "/how-it-works"], ["Прозорість і довіра", "/transparency"]],
  Можливості: [["Спільнота", "/community"], ["Розвиток і менторинг", "/development"], ["Бізнес і послуги", "/business"], ["Проєкти", "/projects"], ["Міжнародні можливості", "/international"]],
  Партнерам: [["Стати партнером", "/partnership"], ["Підтримати INPOM", "/support"], ["Запропонувати експертизу", "/expertise"], ["Співтворення INPOM 2.0", "/inpom-2"]],
  Інформація: [["Новини спільноти", "/newsletter"], ["Поширені запитання", "/faq"], ["Контакти", "/contacts"], ["Політика приватності", "/privacy"], ["Умови", "/terms"]],
} as const

const socialLinks = [["Facebook", "https://www.facebook.com", Facebook], ["Instagram", "https://www.instagram.com", Instagram], ["LinkedIn", "https://www.linkedin.com", Linkedin]] as const

export function FooterSection() {
  return <footer className="mx-auto max-w-[1280px] border-x border-white/15 border-t border-foreground/10">
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
      <div className="grid gap-12 py-16 md:grid-cols-6 lg:py-20">
        <div className="col-span-2"><Link href="/" className="inline-flex items-center gap-2"><span className="font-display text-2xl text-foreground">INPOM</span><span className="font-mono text-xs text-muted-foreground">MPM</span></Link><p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">International Parliament of Mothers unites women for mutual support, development and shared realization of opportunities.</p><div className="mt-8 flex gap-5">{socialLinks.map(([name, href, Icon]) => <Link key={name} href={href} aria-label={name} className="text-muted-foreground transition-colors hover:text-primary"><Icon className="size-4" /></Link>)}</div></div>
        {Object.entries(footerLinks).map(([title, links]) => <div key={title}><h3 className="mb-5 text-sm font-medium text-foreground">{title}</h3><ul className="flex flex-col gap-3">{links.map(([name, href]) => <li key={name}><Link href={href} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">{name}<ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" /></Link></li>)}</ul></div>)}
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-foreground/10 py-7 text-sm text-muted-foreground md:flex-row"><p>&copy; 2026 INPOM. Міжнародний парламент матерів. Усі права захищені.</p><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" />Матері активні по світу</span></div>
    </div>
  </footer>
}
