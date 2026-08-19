import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { FeatureGrid, PartnershipSection, PublicHero } from "@/components/contentsections/public-sections"

export default function PartnershipPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Партнерство" title="Не просто підтримати. Стати співтворцем." description="Ми запрошуємо жінок, громади, бізнес, міжнародні організації та донорів долучитися до наступного етапу INPOM." action={{ label: "Почати розмову", href: "/contacts" }} />
      <FeatureGrid title="Чим можна долучитися" features={[{ title: "Ідеї", description: "Допоможіть побачити потреби спільноти та сформувати наступні рішення." }, { title: "Експертиза", description: "Поділіться знаннями, менторством або професійною підтримкою." }, { title: "Партнерство", description: "Створюйте спільні проєкти з українськими жінками та організаціями." }, { title: "Підтримка", description: "Інвестуйте ресурси у прозорі ініціативи та цифрову інфраструктуру." }]} />
      <PartnershipSection />
    </PublicPageLayout>
  )
}
