import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { FeatureGrid, PublicHero, TransparencySection } from "@/components/contentsections/public-sections"

export default function ProjectsPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Проєкти" title="Ідеї, які стають спільною дією" description="Створюйте соціальні, благодійні та міжнародні ініціативи, знаходьте команду, партнерів і ресурси для реалізації." action={{ label: "Створити проєкт", href: "/auth/signup" }} />
      <FeatureGrid title="Проєктна екосистема" features={[{ title: "Ідея", description: "Опишіть потребу та зміни, яких хочете досягти." }, { title: "Команда", description: "Залучіть людей із потрібними компетенціями." }, { title: "Партнери", description: "Знаходьте організації, бізнес і донорів." }, { title: "Ресурси", description: "Показуйте, що потрібно для наступного кроку." }, { title: "Результат", description: "Фіксуйте прогрес і реальний вплив." }]} />
      <TransparencySection />
    </PublicPageLayout>
  )
}
