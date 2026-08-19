import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { FeatureGrid, JourneySection, PublicHero } from "@/components/contentsections/public-sections"

export default function BusinessPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Бізнес" title="Від компетенції — до клієнта і партнера" description="INPOM допомагає жінкам створювати бізнес, пропонувати власні товари й послуги та виходити на нові ринки." action={{ label: "Запропонувати послугу", href: "/shop" }} />
      <JourneySection steps={[{ title: "Компетенція", description: "Покажіть, що ви вмієте." }, { title: "Послуга", description: "Сформуйте пропозицію." }, { title: "Бізнес", description: "Розвивайте власну справу." }, { title: "Партнери", description: "Знаходьте взаємовигідні зв'язки." }, { title: "Ринки", description: "Виходьте за межі свого міста й країни." }]} />
      <FeatureGrid title="Економіка можливостей" features={[{ title: "Marketplace", description: "Пропонуйте продукт або послугу всередині спільноти." }, { title: "Партнерства", description: "Знаходьте команди, клієнтів і міжнародні контакти." }, { title: "Видимість", description: "Представляйте свою справу аудиторії, яка шукає рішення." }]} />
    </PublicPageLayout>
  )
}
