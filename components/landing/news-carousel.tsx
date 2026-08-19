"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type NewsArticle = {
  id: string | number
  title: string
  short_description?: string | null
  cover_image_url?: string | null
  published_at?: string | null
  category_name?: string | null
}

type NewsCarouselProps = {
  articles: NewsArticle[]
}

export function NewsCarousel({ articles }: NewsCarouselProps) {
  return (
    <section className="w-full py-8 md:py-10" aria-labelledby="news-heading">
      <div className="w-full">
        {articles.length > 0 ? (
          <Carousel
            opts={{ align: "start", loop: articles.length > 3 }}
            className="group/carousel w-full"
          >
            <CarouselContent className="-ml-4 px-4 md:px-6 lg:px-8">
              {articles.map((article) => {
                return (
                  <CarouselItem key={article.id} className="pl-4 basis-[300px] sm:basis-[360px] lg:basis-[400px]">
                    <Link
                      href={`/newsletter/${article.id}`}
                      className="group flex h-36 w-full items-stretch overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg md:h-40"
                    >
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-5 md:p-6">
                        <h5 className="line-clamp-3 leading-tight text-card-foreground transition-colors group-hover:text-primary">
                          {article.title}
                        </h5>
                        <span className="text-sm text-muted-foreground">
                          {article.category_name || "Спільнота"}
                        </span>
                      </div>
                      <div className="relative w-[38%] shrink-0 overflow-hidden bg-muted">
                        {article.cover_image_url ? (
                          <img
                            src={article.cover_image_url}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            INPOM
                          </div>
                        )}
                      </div>
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="pointer-events-none left-10 border-0 bg-secondary text-secondary-foreground opacity-0 shadow-md transition-opacity group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:opacity-100 hover:bg-primary hover:text-primary-foreground md:-left-5" aria-label="Попередня новина">
              <ChevronLeft />
            </CarouselPrevious>
            <CarouselNext className="pointer-events-none right-10 border-0 bg-secondary text-secondary-foreground opacity-0 shadow-md transition-opacity group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:opacity-100 hover:bg-primary hover:text-primary-foreground md:-right-5" aria-label="Наступна новина">
              <ChevronRight />
            </CarouselNext>
          </Carousel>
        ) : (
          <div className="mx-4 rounded-2xl bg-card p-8 text-center text-muted-foreground ring-1 ring-foreground/10 md:mx-6 lg:mx-8">
            Новини спільноти скоро з&apos;являться тут.
          </div>
        )}
      </div>
    </section>
  )
}
