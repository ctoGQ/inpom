"use client"

import { motion } from "framer-motion"

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
    <section className="relative flex h-[925px] w-full items-center justify-center overflow-clip bg-black" aria-label="INPOM">
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Meq9kGy0fsWCoqeuqOay0gzeNC1Bfy.png"
        alt="Жінка в українській вишиванці дивиться на телефон"
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="hero-rays opacity-20" aria-hidden="true" />

      <div className="pointer-events-none sticky top-[50vh] z-10 mx-auto -translate-y-1/2 px-6 text-center lg:px-12">
        <motion.div
          className="max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.12 },
            },
          }}
          aria-live="polite"
        >
          <motion.p variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
            {slide.eyebrow}
          </motion.p>
          <motion.h1 variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white drop-shadow-2xl sm:text-6xl lg:text-8xl">
            {slide.title}
          </motion.h1>
          <motion.p variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/85 drop-shadow-lg sm:text-lg">
            {slide.description}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
