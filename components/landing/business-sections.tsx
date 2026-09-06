"use client"

import { ArrowRight, Asterisk, Check, CornerDownRight, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const industries = [
  { name: "Спорт", description: "Розвивайте спортивні ініціативи, команди та можливості для активного життя.", image: "/images/inpom-sport-2.jpg" },
  { name: "Лідери думок", description: "Об'єднуйте аудиторію навколо ідей, цінностей і змін, які мають значення.", image: "/images/inpom-leader.jpg" },
  { name: "Конференції", description: "Створюйте суспільно важливі проєкти та знаходьте підтримку для їхнього розвитку.", image: "/images/inpom-event.jpg" },
  { name: "Організації", description: "Розповідайте важливі історії, посилюйте голоси спільнот і формуйте довіру.", image: "/images/inpom-diplomats.jpg" },
]

const process = [
  { step: "01", title: "Відкрити можливість", description: "Опишіть ідею, досвід або задачу, з якою ви приходите до INPOM." },
  { step: "02", title: "Сформувати пропозицію", description: "Разом перетворимо ваші компетенції на зрозумілий продукт, послугу чи проєкт." },
  { step: "03", title: "Знайти підтримку", description: "Підключіть інвестиції, команду, технології та клієнтів із потрібного середовища." },
  { step: "04", title: "Рости стійко", description: "Розвивайте бізнес у власному темпі, зберігаючи якість життя та довгий горизонт." },
]

const businessLogos = [
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-1.svg",
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-2.svg",
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-3.svg",
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-4.svg",
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-5.svg",
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-6.svg",
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-7.svg",
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-8.svg",
]

function BusinessLogoCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!carouselRef.current) return
    const updateWidth = () => setWidth(carouselRef.current?.clientWidth ?? 0)
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(carouselRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
      <motion.div
        ref={carouselRef}
        initial={{ x: -width }}
        animate={{ x: -(width / 2 + 24) }}
        transition={{ duration: 3 * businessLogos.length, repeat: Infinity, repeatType: "loop", ease: "linear" }}
        className="flex w-max items-center gap-12"
      >
        {[...businessLogos, ...businessLogos].map((logo, index) => <img key={`${logo}-${index}`} src={logo} alt={`Логотип партнера ${index + 1}`} className="size-24 shrink-0 object-contain dark:invert" />)}
      </motion.div>
    </div>
  )
}

export function BusinessCompliance() {
  const badges = [
    { image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/compliance/GDPR.svg", alt: "GDPR" },
    { image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/compliance/CCPA.svg", alt: "CCPA" },
  ]
  const features = [
    { title: "Сертифікація проєкту", description: "Підтверджуємо готовність проєкту до прозорого розвитку, партнерства та подальшого масштабування.", badgeImage: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/compliance/ISO-27001.svg", badgeAlt: "ISO 27001" },
    { title: "Безпека та відповідність", description: "Допомагаємо проєктам вибудувати відповідальні процеси, захист даних і зрозумілі правила взаємодії.", badgeImage: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/compliance/ISO-27017.svg", badgeAlt: "ISO 27017" },
    { title: "Підтвердження для партнерів", description: "Сертифікований проєкт легше презентувати інвесторам, клієнтам і міжнародним партнерам.", badgeImage: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/compliance/ISO-27018.svg", badgeAlt: "ISO 27018" },
  ]

  return (
    <section className="bg-muted/50 py-20 sm:py-20 px-24">
      <div className="container grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-5">
          <Badge variant="outline" className="w-fit gap-2 bg-background"><span className="size-1.5 rounded-full bg-green-500" /> Сертифікація INPOM</Badge>
          <h2 className="max-w-xl text-4xl font-medium tracking-tight text-balance lg:text-6xl">Готовність проєкту до нового рівня</h2>
          <p className="max-w-xl text-lg text-muted-foreground">Акселератор INPOM допомагає проєктам пройти шлях до сертифікації: посилити процеси, підтвердити якість і підготуватися до довіри партнерів.</p>
          <div className="mt-4 flex gap-5 text-sm font-medium text-muted-foreground"><span className="flex items-center gap-2"><Check className="size-4 text-green-600" /> Якість</span><span className="flex items-center gap-2"><Check className="size-4 text-green-600" /> Відповідність</span></div>
          <div className="mt-4 flex items-center gap-6">
            {badges.map((badge) => <img key={badge.alt} src={badge.image} alt={badge.alt} className="h-20 opacity-60 grayscale md:h-24 dark:invert" />)}
          </div>
        </div>
        <div className="divide-y rounded-3xl border border-border bg-background">
          {features.map((feature) => <div key={feature.title} className="relative min-h-40 overflow-hidden p-6 lg:px-8 lg:py-9"><div className="relative z-10"><h3 className="text-xl font-medium lg:text-2xl">{feature.title}</h3><p className="mt-2 w-3/4 pr-10 text-muted-foreground">{feature.description}</p></div><img src={feature.badgeImage} alt={feature.badgeAlt} className="absolute bottom-[-28px] right-4 size-28 opacity-80 grayscale lg:right-8 lg:size-32 dark:invert" /></div>)}
        </div>
      </div>
    </section>
  )
}

export function BusinessIndustries() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  return (
    <section className="py-20 sm:py-20 sm:px-24">
      <div className="container"><h2 className="mb-8 text-3xl font-medium lg:text-5xl">Напрями Акселерації</h2><div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {industries.map((industry, index) => <button key={industry.name} type="button" onClick={() => setActiveIndex(activeIndex === index ? null : index)} className="group relative min-h-80 overflow-hidden bg-muted text-left lg:min-h-[430px]">
          <img src={industry.image} alt="" className={cn("absolute inset-0 size-full object-cover transition duration-500", activeIndex === index && "scale-105 opacity-20")} /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className={cn("absolute inset-0 flex translate-y-full flex-col justify-end bg-black p-7 text-white transition-transform duration-500", activeIndex === index && "translate-y-0")}><p className="mb-2 text-sm text-white/60">Можливість:</p><p>{industry.description}</p></div>
          <span className="absolute bottom-7 left-7 text-lg font-medium text-white">{industry.name}</span><span className="absolute right-5 top-5 rounded-full bg-white/20 p-2 text-white"><Plus className={cn("size-4 transition-transform", activeIndex === index && "rotate-45")} /></span>
        </button>)}
      </div></div>
    </section>
  )
}

export function BusinessProcess() {
  return <section className="bg-black py-20 text-white sm:py-20 px-24">
    <div className="container grid gap-12 lg:grid-cols-6 lg:gap-20">
        <div className="h-fit lg:sticky lg:top-10 lg:col-span-2">
            <div className="relative w-fit">
                <h2 className="text-5xl font-medium tracking-tight lg:text-7xl">Наш шлях</h2>
                <Asterisk className="absolute -right-12 -top-3 size-8 text-blue-400" />
            </div>
            <p className="mt-7 max-w-sm text-white/55">Від першої ідеї до партнерства, клієнтів і нового масштабу.</p><Button variant="ghost" className="mt-7 px-0 text-white hover:bg-transparent hover:text-blue-300"><CornerDownRight className="mr-2 text-blue-400" /> Почати розмову</Button></div><ol className="lg:col-span-4">{process.map((item) => <li key={item.step} className="flex flex-col gap-5 border-t border-white/20 py-8 sm:flex-row sm:gap-10"><span className="flex size-12 shrink-0 items-center justify-center bg-white/10 text-sm tracking-widest">{item.step}</span><div><h3 className="text-2xl font-medium">{item.title}</h3><p className="mt-3 max-w-xl text-white/55">{item.description}</p></div></li>)}</ol></div></section>
}

export function BusinessDemo() {
  const benefits = ["Приєднайтеся до спільноти жінок-підприємиць", "Отримайте персональну підтримку для свого проєкту"]

  return <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-24"><div className="container grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-4"><div className="flex flex-col items-center gap-4 lg:items-start lg:gap-8"><Badge variant="outline">ПОЧАТИ РОЗВИТОК</Badge><h2 className="mt-2 max-w-md text-center text-3xl font-medium lg:mt-0 lg:max-w-xl lg:text-left lg:text-5xl">Розкажіть про свій бізнес або ідею</h2><ul className="flex w-full max-w-md flex-col">{benefits.map((benefit, index) => <li key={benefit} className="flex items-start gap-2 px-4 last:hidden last:border-b-0 lg:border-b lg:py-6 last:lg:flex"><ArrowRight className="hidden size-6 shrink-0 lg:block" strokeWidth={1} /><p className="text-center font-medium lg:text-left">{benefit}</p></li>)}</ul><div className="mt-12 hidden w-full overflow-hidden lg:block"><BusinessLogoCarousel /></div></div><Card className="w-full max-w-xl place-self-center rounded-3xl bg-muted/70 px-4 pb-4 pt-10 lg:max-w-none lg:place-self-start"><form className="flex flex-col gap-8" onSubmit={(event) => event.preventDefault()}><div className="flex w-full items-center gap-4"><div className="flex w-full flex-col gap-2"><Label htmlFor="business-first-name">Ім'я</Label><Input id="business-first-name" placeholder="Олена" className="bg-background" /></div><div className="flex w-full flex-col gap-2"><Label htmlFor="business-last-name">Прізвище</Label><Input id="business-last-name" placeholder="Коваль" className="bg-background" /></div></div><div className="flex w-full flex-col gap-2"><Label htmlFor="business-email">Робочий email</Label><Input id="business-email" type="email" placeholder="olena@example.com" className="bg-background" /></div><div className="flex w-full flex-col gap-2"><Label htmlFor="business-role">Ваша роль у проєкті</Label><Input id="business-role" placeholder="Засновниця або керівниця" className="bg-background" /></div><div className="flex w-full flex-col gap-2"><Label htmlFor="business-message">Що ви хочете створити?</Label><Textarea id="business-message" placeholder="Розкажіть про свій проєкт та його цілі" className="bg-background" /></div><div className="flex w-full flex-col gap-2"><Label htmlFor="business-source">Як ви дізналися про INPOM?</Label><Select><SelectTrigger id="business-source" className="w-full bg-background"><SelectValue placeholder="Оберіть варіант" /></SelectTrigger><SelectContent><SelectItem value="community">Від спільноти</SelectItem><SelectItem value="social">Соціальні мережі</SelectItem><SelectItem value="search">Пошук в інтернеті</SelectItem><SelectItem value="partner">Від партнера</SelectItem><SelectItem value="other">Інше</SelectItem></SelectContent></Select></div><Button type="submit" className="w-fit self-end">Надіслати запит <ArrowRight /></Button></form></Card><div className="mt-4 block w-full overflow-hidden lg:hidden"><BusinessLogoCarousel /></div></div></section>
} 

export function BusinessCaseStudies() {
  const cases = [
    { image: "/images/inpom-partnership.png", quote: "Завдяки спільноті ми побачили нові партнерства і перетворили експертизу на зрозумілу пропозицію.", name: "Олена Коваль", role: "засновниця сервісного бізнесу", metrics: [["98%", "довіри учасниць"], ["3.8x", "більше партнерств"]] },
    { image: "/images/inpom-community.png", quote: "INPOM допоміг зібрати навколо ідеї команду та знайти перші можливості для масштабування.", name: "Марія Шевченко", role: "авторка соціального проєкту", metrics: [["4.2x", "швидше до команди"], ["72%", "економії часу"]] },
  ]

  return <section className="py-20 px-24"><div className="container"><div className="flex flex-col gap-5 text-center"><p className="font-medium text-muted-foreground">Результати спільноти</p><h2 className="text-4xl font-medium tracking-tight md:text-6xl">Реальні історії реальних змін</h2></div><div className="mt-16">{cases.map((item, index) => <div key={item.name}><div className="grid gap-10 lg:grid-cols-3 lg:gap-16"><div className="flex gap-7 lg:col-span-2 lg:border-r lg:pr-16"><img src={item.image} alt="" className="hidden aspect-[29/35] h-64 w-44 rounded-2xl object-cover sm:block" /><div className="flex flex-col justify-between gap-8"><q className="text-lg sm:text-2xl">{item.quote}</q><div><p className="text-lg font-semibold">{item.name}</p><p className="text-muted-foreground">{item.role}</p></div></div></div><div className="flex gap-10 self-center lg:flex-col">{item.metrics.map(([value, label]) => <div key={label} className="flex flex-col gap-1"><p className="text-4xl font-medium sm:text-5xl">{value}</p><p className="font-semibold">{label}</p></div>)}</div></div>{index < cases.length - 1 && <Separator className="my-16" />}</div>)}</div></div></section>
}

export function BusinessLogos() {
  const logos = ["Український бізнес", "Мережа партнерів", "Жіночі ініціативи", "Digital impact", "Нова економіка", "Сильні разом"]
  return <section className="border-t py-16 px-24"><div className="container text-center"><h2 className="text-2xl font-semibold tracking-tight">Партнери, з якими ми розвиваємо можливості</h2><div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-7 lg:gap-x-16">{logos.map((logo) => <div key={logo} className="flex h-12 min-w-32 items-center justify-center text-sm font-semibold uppercase tracking-wider text-muted-foreground grayscale">{logo}</div>)}</div><Separator className="mt-14" /></div></section>
}
