import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { PublicHero, TransparencySection, FeatureGrid } from "@/components/contentsections/public-sections"

export default function TransparencyPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Прозорість і довіра" title="Відкритість для проєктів. Захист для людей." description="Ми закладаємо прозорість не лише у правила роботи організації, а й у цифрову архітектуру платформи. Персональні дані учасниць мають залишатися захищеними." />
      <TransparencySection />
      <FeatureGrid title="Що бачать учасники системи" features={[{ title: "Донор", description: "Який проєкт підтримується та як використовуються ресурси." }, { title: "Партнер", description: "Із ким він працює та який внесок робить." }, { title: "Команда", description: "Який статус має проєкт і що потрібно далі." }, { title: "Учасниця", description: "Який результат отримано та як долучитися." }]} />
    </PublicPageLayout>
  )
}
