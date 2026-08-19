import { FooterSection } from "@/components/landing/footer-section"
import { Header } from "@/components/header"
import { HomeHeroSlider } from "@/components/landing/home-hero-slider"
import { NewsCarousel } from "@/components/landing/news-carousel"
import { ImageSplitSection, ImpactStrip, LinkedRouteCards, ManifestoSection } from "@/components/contentsections/public-sections"
import { sql } from "@/lib/db"

export const revalidate = 300

async function getNewsArticles() {
  try {
    const result = await sql`SELECT na.id::text, na.title, na.short_description, na.cover_image_url, na.published_at, nc.name as category_name FROM newsletter_articles na LEFT JOIN newsletter_categories nc ON na.category_id = nc.id WHERE na.status = 'published' ORDER BY na.published_at DESC LIMIT 12`
    return result.rows
  } catch (error) {
    console.error("Error fetching homepage news:", error)
    return []
  }
}

export default async function Home() {
  const articles = await getNewsArticles()
  return <main className="relative min-h-screen overflow-x-hidden"><Header /><HomeHeroSlider /><ImageSplitSection eyebrow="Що таке INPOM" title="Екосистема, у якій жіночі ідеї не залишаються наодинці" description="Міжнародний парламент матерів поєднує спільноту, розвиток, підприємництво та міжнародні зв&apos;язки в один зрозумілий маршрут — від першого запитання до спільної дії." image="/images/inpom-community.png" alt="Жінки разом працюють над ідеями у спільноті" href="/about" linkLabel="Познайомитися з INPOM" /><ImpactStrip items={[{ value: "1 простір", label: "для підтримки, розвитку та дії" }, { value: "4 напрями", label: "які допомагають рухатися далі" }, { value: "∞ зв&apos;язків", label: "між жінками, командами та країнами" }, { value: "1 голос", label: "спільноти, що стає сильнішим" }]} /><ManifestoSection quote="Коли одна жінка отримує можливість, змінюється більше, ніж її особиста історія." detail="INPOM створений, щоб перетворювати взаємну підтримку на довготривалі можливості для жінок та їхніх спільнот." href="/community" /><LinkedRouteCards title="Оберіть свій наступний крок" description="Почніть із того, що зараз найближче. Далі система сама відкриє наступні двері." links={[{ title: "Знайти спільноту", description: "Підтримка, знайомства та місце для вашого голосу.", href: "/community" }, { title: "Розвивати ідею", description: "Менторинг, проєкти та партнери для руху вперед.", href: "/development" }, { title: "Вийти у світ", description: "Міжнародні зв&apos;язки, програми та нові горизонти.", href: "/international" }]} /><NewsCarousel articles={articles} /><FooterSection /></main>
}
