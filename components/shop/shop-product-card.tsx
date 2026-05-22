// components/shop/shop-product-card.tsx
// Product card component for displaying in grid/list

'use client';

import { Heart, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

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
  sellerId: number;
  saleCount: number;
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
  sellerId,
  saleCount,
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
    <Link href={`/shop/${slug}`}>
      <div className="group relative overflow-hidden rounded-lg border border-input hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer h-full flex flex-col bg-card">
        {/* Image container */}
        <div className="relative w-full aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Немає фото
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {isFeatured && (
              <div className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
                ⭐ Популярно
              </div>
            )}
            {discount > 0 && (
              <div className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded">
                -{discount}%
              </div>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            disabled={isLoading}
            className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted
                  ? 'fill-destructive text-destructive'
                  : 'text-muted-foreground'
              }`}
            />
          </button>

          {/* Sale count */}
          {saleCount > 0 && (
            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              📦 Продано: {saleCount}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-3">
          {/* Title */}
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {title}
          </h3>

          {/* Seller */}
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            від {sellerName}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(Number(rating) || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {(Number(rating) || 0).toFixed(1)} ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto mb-3">
            <span className="text-lg font-bold">
              {(Number(price) || 0).toLocaleString('uk-UA')} {currency}
            </span>
            {originalPrice && Number(originalPrice) > Number(price) && (
              <span className="text-xs text-muted-foreground line-through">
                {(Number(originalPrice) || 0).toLocaleString('uk-UA')}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              toast({
                title: 'Функція в розробці',
                description: 'Функція добавлення в кошик незабаром буде доступна'
              });
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Додати
          </Button>
        </div>
      </div>
    </Link>
  );
}
