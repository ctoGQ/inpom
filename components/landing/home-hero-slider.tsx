"use client"


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
    <section className="relative h-[925px] w-full overflow-hidden bg-black" aria-label="INPOM">
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Meq9kGy0fsWCoqeuqOay0gzeNC1Bfy.png"
        alt="Жінка в українській вишиванці дивиться на телефон"
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="hero-rays opacity-20" aria-hidden="true" />

      <div className="sticky top-1/2 z-10 mx-auto flex h-0 w-full max-w-[1100px] -translate-y-1/2 items-center justify-center px-6 text-center lg:px-12">
        <div className="max-w-4xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
            {slide.eyebrow}
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white drop-shadow-2xl sm:text-6xl lg:text-8xl">
            {slide.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/85 drop-shadow-lg sm:text-lg">
            {slide.description}
          </p>
        </div>
      </div>
    </section>
  )
}
