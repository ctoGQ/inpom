'use client';

import { Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SellerProductCardProps {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  primaryImage?: string;
  status: string;
  categoryName: string;
  saleCount: number;
  rating: number;
  reviewCount: number;
  onDelete?: (id: number) => void;
}

export function SellerProductCard({
  id,
  title,
  price,
  originalPrice,
  currency,
  primaryImage,
  status,
  categoryName,
  saleCount,
  rating,
  reviewCount,
  onDelete
}: SellerProductCardProps) {
  const statusLabel = {
    'active': 'Активний',
    'draft': 'Чорновик',
    'inactive': 'Неактивний',
    'moderation': 'На модерації'
  }[status] || status;

  const statusColor = {
    'active': 'bg-green-500/10 text-green-700 border-green-200',
    'draft': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    'inactive': 'bg-gray-500/10 text-gray-700 border-gray-200',
    'moderation': 'bg-blue-500/10 text-blue-700 border-blue-200'
  }[status] || 'bg-foreground/5 text-foreground';

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-foreground/10 hover:border-primary/50 transition-all hover:shadow-lg h-full flex flex-col bg-card hover:bg-card/80">
      {/* Image container */}
      <div className="relative w-full aspect-square overflow-hidden bg-foreground/5">
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

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
            {statusLabel}
          </div>
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Category */}
        <p className="text-xs text-muted-foreground mb-3">
          {categoryName}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold">
            {price.toLocaleString('uk-UA')} {currency}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-muted-foreground line-through">
              {originalPrice.toLocaleString('uk-UA')}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2 rounded-lg bg-foreground/5">
          <div>
            <p className="text-xs text-muted-foreground">Продано</p>
            <p className="text-sm font-semibold">{saleCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Рейтинг</p>
            <p className="text-sm font-semibold">{rating.toFixed(1)} ⭐</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/mycabinet/shop/${id}`} className="flex-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Редагувати
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete?.(id)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
