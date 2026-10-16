// components/shop/shop-product-card.tsx
// Product card component for displaying in grid/list

'use client';

import { Heart, Package, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ShopProductCardProps {
  id: number;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  primaryImage?: string;
  sellerName: string;
  saleCount: number;
  categoryName?: string;
  isFeatured?: boolean;
}

export function ShopProductCard({
  id,
  title,
  slug,
  price,
  originalPrice,
  currency,
  rating,
  reviewCount,
  primaryImage,
  sellerName,
  saleCount,
  categoryName,
  isFeatured
}: ShopProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = isWishlisted ? 'DELETE' : 'POST';
      const response = await fetch('/api/shop/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id })
      });

      if (!response.ok) throw new Error('Failed to update wishlist');

      setIsWishlisted(!isWishlisted);
      toast({
        title: isWishlisted ? 'Видалено' : 'Додано',
        description: isWishlisted
          ? 'Видалено з улюблених'
          : 'Додано в улюблені'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалось оновити улюблені',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-foreground/10 bg-transparent transition-colors hover:border-primary/30 hover:bg-foreground/5">
      <Link href={`/shop/${slug}`} className="flex h-full flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-foreground/5">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Package className="size-8 text-muted-foreground/30" aria-hidden="true" />
              <span className="sr-only">Немає фото</span>
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            {isFeatured && (
              <span className="rounded-md bg-background/90 px-2 py-1 text-[10px] font-semibold text-foreground backdrop-blur">
                Популярне
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-md bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground">
                -{discount}%
              </span>
            )}
          </div>
          {saleCount > 0 && (
            <span className="absolute bottom-2 left-2 rounded-md bg-background/85 px-2 py-1 text-[10px] text-foreground backdrop-blur">
              Продано: {saleCount}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          {categoryName && (
            <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {categoryName}
            </span>
          )}
          <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground transition-colors group-hover:text-primary sm:text-sm">
            {title}
          </h3>
          <p className="truncate text-[11px] text-muted-foreground">від {sellerName}</p>
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-foreground/60 text-foreground/60" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">
              {(Number(rating) || 0).toFixed(1)}{reviewCount > 0 ? ` (${reviewCount})` : ''}
            </span>
          </div>
          <div className="mt-auto pt-1">
            <p className="text-sm font-bold text-foreground sm:text-base">
              {(Number(price) || 0).toLocaleString('uk-UA')} {currency || 'INPOM'}
            </p>
            {originalPrice && Number(originalPrice) > Number(price) && (
              <p className="text-xs text-muted-foreground line-through">
                {Number(originalPrice).toLocaleString('uk-UA')} {currency || 'INPOM'}
              </p>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleWishlist}
        disabled={isLoading}
        aria-label={isWishlisted ? 'Видалити з улюблених' : 'Додати в улюблені'}
        aria-pressed={isWishlisted}
        className="absolute right-2 top-2 rounded-full bg-background/90 p-2 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-destructive disabled:opacity-50"
      >
        <Heart className={`size-4 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`} aria-hidden="true" />
      </button>
    </article>
  );
}
