import { ArrowRight, CheckCircle2 } from "lucide-react"

const benefits = [
  "одне місце для спільноти, розвитку та партнерства",
  "зрозумілий шлях від ідеї до спільної дії",
  "безпечна взаємодія та прозорі можливості",
]

export function InpomAppSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30 py-20 sm:py-28" aria-labelledby="inpom-app-title">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-8 shadow-sm sm:p-12">
            <div className="absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="relative flex min-h-[280px] flex-col justify-between gap-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">INPOM / app</span>
                <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">beta</span>
              </div>
              <div>
                <p className="font-mono text-sm text-primary">Ваш простір для дій</p>
                <p className="mt-4 max-w-sm text-3xl font-medium tracking-tight sm:text-4xl">Ідеї стають сильнішими разом</p>
              </div>
              <div className="flex items-center gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">↗</span>
                <span>Знайти свою наступну можливість</span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">INPOM / цифровий простір</p>
            <h2 id="inpom-app-title" className="mt-4 text-balance text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
              Усе необхідне для руху вперед — в одному застосунку
            </h2>
            <p className="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
              Застосунок INPOM допомагає жінкам знаходити своїх людей, розвивати ідеї та перетворювати прагнення на реальні проєкти. Тут легко побачити наступний крок, отримати підтримку й долучитися до змін, які створюються разом.
            </p>
            <ul className="mt-8 flex flex-col gap-4" aria-label="Переваги застосунку INPOM">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm leading-6">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <a href="#community" className="mt-9 inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/70">
              Дізнатися більше про можливості
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
