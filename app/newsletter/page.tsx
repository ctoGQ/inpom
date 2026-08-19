import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { sql } from "@/lib/db";

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

async function getNewsletterArticles() {
  try {
    const result = await sql`
      SELECT 
        na.id::text, 
        na.title, 
        na.slug, 
        na.short_description, 
        na.cover_image_url,
        na.published_at,
        nc.name as category_name,
        nc.slug as category_slug
      FROM newsletter_articles na
      LEFT JOIN newsletter_categories nc ON na.category_id = nc.id
      WHERE na.status = 'published'
      ORDER BY na.published_at DESC
      LIMIT 12
    `;
    
    return result.rows;
  } catch (error) {
    console.error("[v0] Error fetching articles:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const result = await sql`
      SELECT id, name, slug, description
      FROM newsletter_categories
      ORDER BY name
    `;
    
    return result.rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function NewsletterPage() {
  const articles = await getNewsletterArticles();
  const categories = await getCategories();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-background py-24 md:py-32 lg:py-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-start max-w-3xl">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
              <span className="w-8 h-px bg-foreground/30" />
              Блог матерів
            </span>
            <h1 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.92] mb-8">
              Історії та поради
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Дізнайтесь від матерів по всьому світу. Поділенням досвідом, поради та стратегії для розвитку.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="relative bg-background border-b border-foreground/10 py-12">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                Всі статті
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="px-4 py-2 rounded-full border border-foreground/20 text-sm font-medium hover:border-foreground/50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="relative bg-background py-20 md:py-28 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/newsletter/${article.id}`}
                  className="group flex flex-col h-full"
                >
                  <div className="relative h-48 md:h-56 rounded-lg overflow-hidden bg-foreground/5 mb-6">
                    {article.cover_image_url ? (
                      <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/10 to-foreground/5">
                        <span className="text-foreground/30 font-display text-2xl">📰</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    {article.category_name && (
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                        {article.category_name}
                      </span>
                    )}

                    <h3 className="text-xl md:text-2xl font-display tracking-tight mb-3 group-hover:text-muted-foreground transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {article.short_description && (
                      <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-2 flex-1">
                        {article.short_description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                      Читати далі
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {article.published_at && (
                    <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-foreground/10">
                      {formatDate(article.published_at)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Статей поки немає. Повертайтесь скоро!
              </p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
