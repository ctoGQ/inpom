import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const pathways = [
  {
    title: "Для бізнесу",
    description: "Партнерства, послуги та рішення, що допомагають зростати відповідально.",
    image: "/images/inpom-partnership.png",
    alt: "Жінки працюють разом над бізнес-партнерством",
    href: "/business",
  },
  {
    title: "Для проєктів",
    description: "Перетворюйте ідеї на ініціативи з командами, ресурсами та міжнародними зв'язками.",
    image: "/images/inpom-opportunity.png",
    alt: "Команда розвиває новий проєкт",
    href: "/projects",
  },
  {
    title: "Для учасниць",
    description: "Знайдіть свою спільноту, підтримку, розвиток і наступну можливість.",
    image: "/images/inpom-community.png",
    alt: "Учасниці спільноти спілкуються разом",
    href: "/community",
  },
]

export function HomePathways() {
  return (
    <section className="bg-background px-6 py-16 md:px-12 md:py-24" aria-labelledby="pathways-title">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">INPOM для вас</p>
          <h2 id="pathways-title" className="mt-4 text-balance text-3xl font-normal leading-tight tracking-tight text-foreground md:text-5xl">Оберіть свій напрям</h2>
          <p className="mt-5 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">Три прості входи до екосистеми, де підтримка перетворюється на конкретну дію.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {pathways.map((pathway, index) => (
            <Link href={pathway.href} key={pathway.href} className="group relative min-h-[25rem] overflow-hidden rounded-[1.75rem] bg-secondary text-secondary-foreground shadow-sm ring-1 ring-foreground/10 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
              <Image src={pathway.image} alt={pathway.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover grayscale transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative flex min-h-[25rem] flex-col justify-between p-6 md:p-7">
                <span className="font-mono text-xs text-white/65">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl font-normal tracking-tight text-white md:text-3xl">{pathway.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">{pathway.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white">Перейти <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
