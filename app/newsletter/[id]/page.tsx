import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";

export const revalidate = 3600; // Revalidate every hour

const formatDate = (dateString: string, format: "long" | "short" = "long"): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: format === "long" ? "long" : "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

async function getArticle(id: string) {
  try {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return null;
    }

    const result = await sql`
      SELECT 
        na.id, 
        na.title, 
        na.slug, 
        na.short_description,
        na.cover_image_url,
        na.published_at,
        na.blocks,
        na.category_id,
        nc.name as category_name,
        nc.slug as category_slug
      FROM newsletter_articles na
      LEFT JOIN newsletter_categories nc ON na.category_id = nc.id
      WHERE na.id = ${numId} AND na.status = 'published'
    `;

    return result.rows?.[0] ?? null;
  } catch (error) {
    console.error("[v0] Error fetching article:", error);
    return null;
  }
}

async function getRelatedArticles(categoryId: number, currentId: string) {
  try {
    const numId = parseInt(currentId, 10);
    
    const result = await sql`
      SELECT 
        na.id, 
        na.title, 
        na.slug,
        na.cover_image_url,
        na.published_at,
        nc.name as category_name
      FROM newsletter_articles na
      LEFT JOIN newsletter_categories nc ON na.category_id = nc.id
      WHERE na.category_id = ${categoryId} AND na.id != ${numId} AND na.status = 'published'
      ORDER BY na.published_at DESC
      LIMIT 3
    `;

    return result.rows;
  } catch (error) {
    console.error("[v0] Error fetching related articles:", error);
    return [];
  }
}

async function getSubscriptionStats() {
  try {
    const result = await sql`
      SELECT COUNT(*) as total_subscribers
      FROM newsletter_subscriptions
      WHERE is_active = true
    `;

    return result.rows?.[0]?.total_subscribers ?? 0;
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return 0;
  }
}

function renderBlockContent(blocks: any[]) {
  if (!Array.isArray(blocks)) return null;

  return blocks.map((block, idx) => {
    switch (block.type) {
      case "heading":
        return (
          <h2 key={idx} className="text-3xl md:text-4xl font-display tracking-tight mt-8 mb-4">
            {block.content}
          </h2>
        );
      case "paragraph":
        return (
          <p key={idx} className="text-lg text-muted-foreground leading-relaxed mb-6">
            {block.content}
          </p>
        );
      case "image":
        return (
          <div key={idx} className="my-8 rounded-lg overflow-hidden">
            <img
              src={block.url}
              alt={block.alt || "Article image"}
              className="w-full h-auto"
            />
          </div>
        );
      case "quote":
        return (
          <blockquote key={idx} className="border-l-4 border-foreground/20 pl-6 italic text-muted-foreground my-8">
            {block.content}
          </blockquote>
        );
      case "list":
        return (
          <ul key={idx} className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            {block.items?.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 16+, params is a Promise - must await it
  const { id } = await params;

  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const relatedArticles = article.category_id
    ? await getRelatedArticles(article.category_id as number, id)
    : [];
  const subscriberCount = await getSubscriptionStats();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Article Header */}
      <section className="relative bg-background border-b border-foreground/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 md:py-24">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до блогу
          </Link>

          {article.category_name && (
            <span className="inline-block text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 px-3 py-1 bg-foreground/5 rounded-full">
              {article.category_name}
            </span>
          )}

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display tracking-tight leading-[0.95] mb-6">
            {article.title}
          </h1>

          {article.short_description && (
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
              {article.short_description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-8 border-t border-foreground/10">
            {article.published_at && (
              <span>
                {formatDate(article.published_at, "long")}
              </span>
            )}
            <span>•</span>
            <span>Читання ~ 5 хв</span>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {article.cover_image_url && (
        <section className="relative bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
            <div className="rounded-lg overflow-hidden h-96 md:h-[500px]">
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="relative bg-background py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="prose prose-invert max-w-none">
            {article.blocks && renderBlockContent(article.blocks)}
          </div>
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="relative bg-foreground/5 border-y border-foreground/10 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-display tracking-tight mb-4">
              Залишайтесь в курсі
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Підпишіться на наш блог і отримуйте нові статті та поради від матерів по всьому світу.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Ваша електронна пошта"
                className="px-6 py-3 bg-background border border-foreground/20 rounded-full text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground transition-colors"
              />
              <button className="px-8 py-3 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors">
                Підписатися
              </button>
            </div>
            {subscriberCount > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                Уже {subscriberCount.toLocaleString("uk-UA")} матерів в підписці
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="relative bg-background py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <h2 className="text-4xl md:text-5xl font-display tracking-tight mb-12">
              Рекомендовані статті
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((relArticle) => (
                <Link
                  key={relArticle.id}
                  href={`/newsletter/${relArticle.id}`}
                  className="group flex flex-col h-full"
                >
                  <div className="relative h-40 rounded-lg overflow-hidden bg-foreground/5 mb-4">
                    {relArticle.cover_image_url ? (
                      <img
                        src={relArticle.cover_image_url}
                        alt={relArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/10 to-foreground/5">
                        <span className="text-foreground/30 text-lg">📰</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-display tracking-tight mb-2 group-hover:text-muted-foreground transition-colors line-clamp-2">
                    {relArticle.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(relArticle.published_at, "short")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}

export async function generateStaticParams() {
  try {
    const result = await sql`
      SELECT id FROM newsletter_articles WHERE status = 'published'
    `;
    
    return (result.rows).map((row) => ({
      id: String(row.id),
    }));
  } catch (error) {
    console.error("[v0] Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  
  if (!article) {
    return {
      title: "Стаття не знайдена",
      description: "Вибачте, стаття не знайдена",
    };
  }

  return {
    title: article.title,
    description: article.short_description,
    openGraph: {
      title: article.title,
      description: article.short_description,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}
