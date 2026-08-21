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
    <section className="w-full overflow-hidden bg-background" aria-label="Напрями INPOM">
      <div className="grid w-full md:grid-cols-3">
          {pathways.map((pathway, index) => (
            <Link href={pathway.href} key={pathway.href} className="group relative min-h-[30rem] overflow-hidden rounded-full bg-secondary text-secondary-foreground shadow-sm ring-1 ring-foreground/10 transition-transform duration-300 hover:z-10 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 md:min-h-[38rem]">
              <Image src={pathway.image} alt={pathway.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover grayscale transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="relative flex min-h-[30rem] flex-col justify-between p-8 md:min-h-[38rem] md:p-10">
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
    </section>
  )
}
