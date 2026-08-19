import { Mail, MessageCircle } from "lucide-react"
import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { FeatureGrid, PublicHero } from "@/components/contentsections/public-sections"

export default function ContactsPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Контакти" title="Давайте створювати наступний етап разом" description="Розкажіть, як ви хочете долучитися до INPOM: як учасниця, експертка, амбасадорка, партнер або донор." />
      <section className="px-6 py-16 md:px-12 md:py-24"><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2"><a href="mailto:hello@inpom.org" className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10 transition-shadow hover:shadow-lg"><Mail className="size-8 text-primary" /><h2 className="mt-6 text-xl">Написати нам</h2><p className="mt-3 text-sm text-muted-foreground">hello@inpom.org</p></a><a href="/community" className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10 transition-shadow hover:shadow-lg"><MessageCircle className="size-8 text-primary" /><h2 className="mt-6 text-xl">Приєднатися до спільноти</h2><p className="mt-3 text-sm text-muted-foreground">Знайдіть підтримку та можливості всередині INPOM.</p></a></div></section>
      <FeatureGrid title="Ми відкриті до" features={[{ title: "Партнерських пропозицій", description: "Спільні програми, ресурси та міжнародна співпраця." }, { title: "Експертизи", description: "Менторство, консультації та практичні знання." }, { title: "Критичних запитань", description: "Чесний діалог допомагає системі ставати сильнішою." }]} />
    </PublicPageLayout>
  )
}
