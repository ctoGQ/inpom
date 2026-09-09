"use client"

import {
  ArrowRight,
  Asterisk,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  CornerDownRight,
  Database,
  FileText,
  GraduationCap,
  ImageIcon,
  LayoutTemplate,
  MonitorSmartphone,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  UsersRound,
  Video,
} from "lucide-react"
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
    <section className="bg-muted py-20 sm:py-20 px-24">
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

export function BusinessServiceStack() {
  const services = [
    { label: "Ai-Agent", icon: Sparkles, left: "18%", top: "30%" },
    { label: "Сайт", icon: MonitorSmartphone, left: "14%", top: "53%" },
    { label: "Контент", icon: FileText, left: "18%", top: "76%" },
    { label: "SEO", icon: Search, right: "5%", top: "30%" },
    { label: "CRM", icon: Database, right: "1%", top: "53%" },
    { label: "B2B контакти", icon: UsersRound, right: "5%", top: "76%" },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 px-6 py-20 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 sm:px-10 lg:px-24">
      <div className="container flex flex-col items-center">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">INPOM accelerator</p>
          <h2 className="mt-5 text-4xl font-medium tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl lg:text-6xl">
            Що отримує <span className="font-semibold text-blue-600">партнер</span>?
          </h2>
        </div>

        <div className="relative mt-12 h-[420px] w-full max-w-[900px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[300px] w-[300px] rounded-full border border-slate-200 bg-slate-50/80 shadow-[inset_0_0_20px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" />
            <div className="absolute h-[210px] w-[210px] rounded-full border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-800/80" />
            <div className="absolute h-[110px] w-[110px] rounded-full border border-slate-200 bg-white shadow-[0_20px_30px_rgba(15,23,42,0.1)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_20px_30px_rgba(2,6,23,0.45)]" />
          </div>

          <svg viewBox="0 0 900 420" className="absolute inset-0 h-full w-full text-slate-700 dark:text-slate-300" aria-hidden="true">
            {[
              "M 450 210 C 320 210, 230 120, 180 120",
              "M 450 210 C 320 210, 220 210, 150 210",
              "M 450 210 C 320 210, 230 300, 180 300",
              "M 450 210 C 580 210, 670 120, 720 120",
              "M 450 210 C 580 210, 690 210, 760 210",
              "M 450 210 C 580 210, 670 300, 720 300",
            ].map((d, index) => (
              <motion.path
                key={d}
                d={d}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.15 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1.2,
                  delay: 0.15 + index * 0.18,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.8,
                  repeatType: "reverse",
                }}
              />
            ))}
          </svg>

          <motion.div
            animate={{ scale: [1, 1.06, 1], rotate: [0, 2, 0] }}
            transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
            className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] bg-slate-900 text-white shadow-[0_25px_40px_rgba(15,23,42,0.18)] dark:bg-slate-100 dark:text-slate-900 dark:shadow-[0_25px_40px_rgba(15,23,42,0.38)]"
          >
            <BrainCircuit className="h-10 w-10" strokeWidth={1.8} />
          </motion.div>

          {services.map((service, index) => {
            const Icon = service.icon
            const isRight = service.right !== undefined
            const positionStyle = isRight
              ? { right: service.right, top: service.top }
              : { left: service.left, top: service.top }

            return (
              <motion.div
                key={`${service.label}-${index}`}
                className="absolute z-20 w-[120px] -translate-x-1/2 -translate-y-1/2 text-center"
                style={positionStyle}
                animate={{ y: [0, -8, 0], rotate: index % 2 === 0 ? [0, 2, 0] : [0, -2, 0] }}
                transition={{ duration: 2.8 + index * 0.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 }}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-[10px_15px_25px_rgba(15,23,42,0.18),inset_2px_2px_5px_rgba(255,255,255,0.12),inset_-2px_-2px_5px_rgba(15,23,42,0.5)] dark:border-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:shadow-[10px_15px_25px_rgba(2,6,23,0.35),inset_2px_2px_5px_rgba(255,255,255,0.35),inset_-2px_-2px_5px_rgba(15,23,42,0.15)]">
                  <Icon className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{service.label}</span>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center text-slate-600 dark:text-slate-300">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Цифровізація процесів</p>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">Цу крок у напрямку розвитку сучасного бізнесу</p>
        </div>
      </div>
    </section>
  )
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
