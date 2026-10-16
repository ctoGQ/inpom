import { ArrowRight, Handshake, Lightbulb, ShieldCheck, Users } from "lucide-react"
import Link from "next/link"

const benefits = [
  {
    icon: Users,
    title: "Спільнота, що підтримує",
    description: "Знаходьте людей зі схожими цінностями, обмінюйтеся досвідом і розвивайте ідеї разом.",
  },
  {
    icon: Lightbulb,
    title: "Можливості для розвитку",
    description: "Отримуйте доступ до знань, менторства та проєктів, які допомагають перейти від задуму до дії.",
  },
  {
    icon: Handshake,
    title: "Партнерства без кордонів",
    description: "Будуйте професійні зв'язки в Україні та світі, відкриваючи нові шляхи для співпраці.",
  },
]

export function InpomIntroSection() {
  return (
    <section className="relative overflow-hidden border-y border-foreground/10 bg-background" aria-labelledby="inpom-intro-title">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-16 lg:py-28">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">INPOM / простір можливостей</p>
          <h2 id="inpom-intro-title" className="mt-5 max-w-xl text-balance text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
            Додаток, який допомагає діяти разом
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            INPOM об'єднує спільноту, знання та реальні можливості в одному цифровому просторі. Тут можна знайти підтримку для власної ідеї, долучитися до важливих ініціатив і побачити, як особистий крок стає частиною спільного руху.
          </p>
          <Link href="#можливості" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary">
            Відкрити можливості
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article key={title} className="group rounded-2xl border border-foreground/10 bg-card/60 p-5 transition-colors hover:border-primary/40 hover:bg-card sm:p-6 lg:flex lg:items-start lg:gap-5">
              <div className="mb-4 flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary lg:mb-0">
                <Icon aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-medium tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </article>
          ))}
          <div className="mt-1 flex items-center gap-3 rounded-2xl bg-foreground px-5 py-4 text-background lg:mt-2">
            <ShieldCheck aria-hidden="true" className="size-5 shrink-0" />
            <p className="text-sm leading-relaxed">Прозорі правила, безпечна взаємодія та контроль над власними даними.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InpomIntroSection
