"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const slides = [
  {
    image: "/home/slider/home-slider-1.png",
    eyebrow: "INPOM 1.0",
    title: "Від спільноти до системи дії",
    description:
      "Цифрове єдине вікно для жінок, які шукають підтримку, розвиток, партнерів і можливості.",
    action: "Дізнатися більше",
    href: "/about",
  },
]

export function HomeHeroSlider() {
  const slide = slides[0]

  return (
    <section className="relative h-[460px] w-full overflow-hidden" aria-label="INPOM">
      <Image
        src={slide.image}
        alt="INPOM digital platform on a mobile phone"
        fill
        priority
        sizes="100vw"
        className="object-cover object-left"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/20" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] items-center justify-end px-6 lg:px-12">
        <div className="w-full max-w-[520px] pt-12 md:pt-0">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {slide.eyebrow}
          </p>
          <h1 className="max-w-lg text-3xl font-normal leading-tight tracking-tight text-foreground">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-sm">
            {slide.description}
          </p>
          <Link
            href={slide.href}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-normal text-primary-foreground transition-colors hover:bg-secondary"
          >
            {slide.action}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
