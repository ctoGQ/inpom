import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

const benefits = [
  "знаходити спільноту, партнерів і можливості для розвитку",
  "перетворювати ідеї на проєкти з підтримкою однодумців",
  "бачити свій прогрес і наступний крок у зрозумілому форматі",
]

export function InpomAppSection() {
  return (
    <section className="border-y border-border/60 bg-background py-24 sm:py-32" aria-labelledby="inpom-app-title">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-1 mx-auto flex max-w-2xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">INPOM / застосунок</p>
            <h2 id="inpom-app-title" className="max-w-xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Платформа, де ідеї знаходять підтримку
            </h2>
            <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground lg:text-xl">
              INPOM об&apos;єднує жінок, які хочуть розвиватися, створювати проєкти та змінювати світ навколо себе. У застосунку ви знайдете людей зі схожими цінностями, корисні можливості та простір для спільних дій.
            </p>
            <ul className="flex max-w-xl flex-col gap-4 text-left" aria-label="Переваги застосунку INPOM">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm leading-6">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              <a href="#community" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Приєднатися до INPOM
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a href="#pathways" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 font-medium transition-colors hover:bg-muted">
                Дізнатися більше
              </a>
            </div>
          </div>

          <div className="order-2 flex w-full justify-center">
            <div className="relative w-full max-w-xl overflow-hidden rounded-md border border-border bg-muted/30 p-4 shadow-sm sm:p-6">
              <div className="rounded-md border border-border bg-background p-5 sm:p-8">
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">INPOM</p>
                    <p className="mt-2 text-xl font-semibold">Ваш простір можливостей</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                    <Sparkles className="size-5" />
                  </div>
                </div>
                <div className="grid gap-3 py-6 sm:grid-cols-2">
                  {["Спільнота", "Розвиток", "Проєкти", "Партнерство"].map((item, index) => (
                    <div key={item} className="rounded-md border border-border p-4">
                      <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                      <p className="mt-5 font-medium">{item}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Відкривайте нові можливості</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 rounded-md bg-primary/10 p-4 text-sm text-primary">
                  <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                  Ваш наступний крок уже поруч
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
