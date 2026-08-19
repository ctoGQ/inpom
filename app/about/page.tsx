import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { FeatureGrid, JourneySection, PublicHero, TimelineSection, TransparencySection } from "@/components/contentsections/public-sections"

export default function AboutPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Хто ми" title="Міжнародний парламент матерів" description="Жіноча громадська платформа, яка об'єднує активних жінок, експерток, підприємниць та лідерок думок для взаємопідтримки, розвитку й реалізації соціальних, благодійних і міжнародних ініціатив." action={{ label: "Приєднатися до спільноти", href: "/community" }} />
      <FeatureGrid title="Від спільноти — до системи дії" description="Жінка може отримати підтримку, а згодом сама стати джерелом можливостей для інших." features={[{ title: "Солідарність", description: "Ми створюємо простір взаємопідтримки для жінок і родин." }, { title: "Розвиток", description: "Допомагаємо знаходити експертів, менторів і нові професійні можливості." }, { title: "Дія", description: "Перетворюємо ідеї на соціальні, благодійні та міжнародні ініціативи." }, { title: "Взаємодія", description: "Поєднуємо людей, ресурси, команди й партнерів." }, { title: "Прозорість", description: "Будуємо довіру через зрозумілі процеси та відповідальність." }]} />
      <TimelineSection />
      <TransparencySection />
    </PublicPageLayout>
  )
}
