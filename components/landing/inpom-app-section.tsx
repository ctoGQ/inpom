import { ArrowRight, CheckCircle2 } from "lucide-react"

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

          <div className="order-2 flex w-full justify-center lg:justify-end">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-Artboard-home-ufGtQQvT1dFEAdhYqeVFAi6mxs4t5x.png"
              alt="Застосунок INPOM на смартфоні"
              className="h-auto w-full max-w-2xl object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
