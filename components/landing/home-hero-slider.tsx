"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { QRCodeCanvas } from "qrcode.react"
import { useEffect, useState } from "react"

const slides = [
  {
    image: "/home/slider/home-slider-1.png",
    title: "Від спільноти до системи дії",
    action: "Дізнатися більше",
    href: "/about",
  },
]

export function HomeHeroSlider() {
  const slide = slides[0]
  const [loginUrl, setLoginUrl] = useState("/auth/signin")

  useEffect(() => {
    setLoginUrl(`${window.location.origin}/auth/signin`)
  }, [])

  return (
    <section className="relative flex h-[925px] w-full items-center justify-center overflow-clip bg-black" aria-label="INPOM">
      <img
        src="/images/inpom-hero-img-new.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover object-center opacity-55"
      />
      <div className="hero-rays" aria-hidden="true" />
      <div className="hero-portrait-wrap" aria-hidden="true">
        <img
          src="/images/inpom-hero-portrait.png"
          alt=""
          className="hero-portrait"
        />
      </div>
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(0,0,0,.34)_78%,rgba(0,0,0,.72)_100%)]" aria-hidden="true" />

      <div className="pointer-events-none sticky top-[90vh] z-10 mx-auto -translate-y-1/2 px-6 text-center lg:px-12">
        <motion.div
          className="max-w-4xl z-20"
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
          <motion.span variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} className="text-balance leading-[1.05] tracking-[-0.045em] text-white drop-shadow-2xl sm:text-6xl lg:text-[80px]">
            {slide.title}
          </motion.span>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-50 w-[calc(100%-3rem)] -translate-x-1/2 rounded-4xl border border-white/20 bg-black/10 p-3 text-white backdrop-blur-md sm:bottom-10 sm:w-[calc(100%-5rem)] sm:p-4 lg:max-w-xl">
        <div className="hidden items-center gap-4 sm:flex sm:gap-6">
          <div className="flex justify-center">
          <div className="rounded-lg bg-white p-2 shadow-2xl">
            <QRCodeCanvas value={loginUrl} size={104} level="M" includeMargin />
          </div>
          </div>
          <div className="text-left">
            <span className="mb-12 flex text-md text-white">Цифрове єдине вікно для жінок, які шукають підтримку, розвиток, партнерів і можливості.</span>
            <p className="mt-2 text-xs leading-relaxed text-white/70 sm:text-sm">Відкрийте камеру та наведіть її на QR-код.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:hidden">
          <p className="text-center text-sm font-medium text-white">Приєднуйтеся до INPOM</p>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/auth/signin" className="rounded-lg bg-white px-3 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-white/85">Увійти</Link>
            <Link href="/auth/signup" className="rounded-lg border border-white/40 px-3 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black">Приєднатися</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
