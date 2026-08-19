import { PublicPageLayout } from "@/components/contentsections/public-page-layout"
import { FeatureGrid, PublicHero, MissionIcon } from "@/components/contentsections/public-sections"

export default function InternationalPage() {
  return (
    <PublicPageLayout>
      <PublicHero eyebrow="Міжнародні можливості" title="Україна → Європа → США → світ" description="Міжнародна мережа INPOM поєднує українських жінок, амбасадорок, донорів, дипломатичні інституції та організації підтримки в різних країнах." action={{ label: "Стати амбасадоркою", href: "/contacts" }} />
      <section className="px-6 py-16 md:px-12 md:py-24"><div className="mx-auto max-w-6xl"><MissionIcon type="global" /><h2 className="mt-6 text-2xl md:text-3xl">Мережа, що працює за межами кордонів</h2><p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">Швейцарія, Німеччина, Австрія, Греція, США, Японія та інші країни стали частиною досвіду підтримки українських родин і розвитку жіночого лідерства.</p></div></section>
      <FeatureGrid title="Як долучитися" features={[{ title: "Амбасадорка", description: "Створюйте локальні зв'язки та представляйте спільноту." }, { title: "Партнер", description: "Підтримуйте проєкти й відкривайте міжнародні контакти." }, { title: "Учасниця", description: "Знаходьте ресурси для нового життя і професійного розвитку." }]} />
    </PublicPageLayout>
  )
}
