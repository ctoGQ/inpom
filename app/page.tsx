import { Header } from "@/components/header";
import { FooterSection } from "@/components/landing/footer-section";
import { HomeHeroSlider } from "@/components/landing/home-hero-slider";
import { NewsCarousel } from "@/components/landing/news-carousel";
import { sql } from "@/lib/db";

export const revalidate = 300;

async function getNewsArticles() {
  try {
    const result = await sql`
      SELECT
        na.id::text,
        na.title,
        na.short_description,
        na.cover_image_url,
        na.published_at,
        nc.name as category_name
      FROM newsletter_articles na
      LEFT JOIN newsletter_categories nc ON na.category_id = nc.id
      WHERE na.status = 'published'
      ORDER BY na.published_at DESC
      LIMIT 12
    `;

    return result.rows;
  } catch (error) {
    console.error("Error fetching homepage news:", error);
    return [];
  }
}

export default async function Home() {
  const articles = await getNewsArticles();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Header />
      <HomeHeroSlider />
      <NewsCarousel articles={articles} />
      <FooterSection />
    </main>
  );
}
