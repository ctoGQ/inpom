import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { FeatureGrid, PublicHero, PartnershipSection } from "@/components/contentsections/public-sections"

export default function CommunityPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Спільнота" title="Місце, де підтримка стає можливістю" description="INPOM об'єднує жінок, експерток, підприємниць і лідерок, щоб кожна могла знайти допомогу, проявити компетенції та створити можливості для інших." action={{ label: "Приєднатися", href: "/auth/signup" }} />
      <FeatureGrid title="Що дає спільнота" features={[{ title: "Підтримка", description: "Знайдіть людей, які розуміють ваші потреби та готові допомогти." }, { title: "Компетенції", description: "Представляйте свій досвід і знаходьте експертну взаємодію." }, { title: "Лідерство", description: "Переходьте від пошуку допомоги до створення можливостей для інших." }, { title: "Мережа", description: "Залишайтеся пов'язаними з українськими жінками у світі." }]} />
      <PartnershipSection />
    </PublicPageLayout>
  )
}
