import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { CheckList, FeatureGrid, PublicHero } from "@/components/contentsections/public-sections"

export default function DevelopmentPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Розвиток" title="Зростання, яке можна перетворити на дію" description="INPOM допомагає жінці знаходити експертів, менторів і ресурси для особистого, професійного та громадського розвитку." action={{ label: "Знайти можливість", href: "/contacts" }} />
      <FeatureGrid title="Шлях розвитку" features={[{ title: "Потрібна допомога", description: "Сформулюйте потребу й отримайте орієнтир для наступного кроку." }, { title: "Є компетенція", description: "Запропонуйте свої знання як консультацію, послугу або менторство." }, { title: "Є ідея", description: "Знайдіть команду, партнера та ресурси для її реалізації." }]} />
      <section className="px-6 pb-20 md:px-12"><div className="mx-auto grid max-w-6xl gap-8 rounded-3xl bg-card p-8 ring-1 ring-foreground/10 md:grid-cols-2 md:p-12"><div><h2 className="text-2xl">Що важливо для старту</h2><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Розвиток починається з безпечного простору, чесного запиту та людини, яка готова поділитися досвідом.</p></div><CheckList items={["Підтримка спільноти", "Доступ до експертизи", "Практичні наступні кроки", "Можливість підтримати інших"]} /></div></section>
    </PublicPageLayout>
  )
}
