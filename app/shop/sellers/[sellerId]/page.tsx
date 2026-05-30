'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Package, ShoppingCart, User, ChevronLeft } from 'lucide-react';

interface Seller {
  id: number;
  name: string;
  avatar: string | null;
  rating: number;
  reviews: number;
  sales: number;
  responseTime?: number;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  rating: number;
  review_count: number;
  sale_count: number;
  category_name: string;
  primary_image?: string;
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.sellerId as string;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/shop/sellers/${sellerId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch seller: ${res.status}`);
        }
        const data = await res.json();
        setSeller(data.seller);
        setProducts(data.products || []);
      } catch (err) {
        console.error('[SellerProfile] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load seller profile');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 h-32 bg-foreground/5 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-foreground/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Продавця не знайдено</h1>
          <p className="text-muted-foreground mb-4">{error || 'Обраний продавець не доступний'}</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            <ChevronLeft className="w-4 h-4" />
            Повернутися в магазин
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Повернутися в магазин
          </Link>
        </div>
      </div>

      {/* Seller Info */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-card border rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {seller.avatar ? (
                <Image
                  src={seller.avatar}
                  alt={seller.name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-foreground/10 flex items-center justify-center">
                  <User className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold mb-2">{seller.name}</h1>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Рейтинг
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{seller.rating.toFixed(1)}</span>
                    <div className="flex gap-0.5">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4"
                            fill={i < Math.round(seller.rating) ? 'currentColor' : 'none'}
                          />
                        ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Відгуки
                  </p>
                  <p className="text-2xl font-bold">{seller.reviews}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Продано
                  </p>
                  <p className="text-2xl font-bold">{seller.sales}</p>
                </div>

                {seller.responseTime && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Час відповіді
                    </p>
                    <p className="text-2xl font-bold">{seller.responseTime}ч</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Товари продавця ({products.length})</h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/shop/${product.slug}`}>
                  <div className="group relative overflow-hidden rounded-2xl border border-foreground/10 hover:border-primary/50 transition-all hover:shadow-lg bg-card hover:bg-card/80 cursor-pointer h-full flex flex-col">
                    {/* Image */}
                    <div className="relative w-full aspect-square overflow-hidden bg-foreground/5">
                      {product.primary_image ? (
                        <Image
                          src={product.primary_image}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.title}</h3>
                      
                      <p className="text-xs text-muted-foreground mb-3">{product.category_name}</p>

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-lg font-bold">{product.price}</span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mt-auto p-2 rounded-lg bg-foreground/5">
                        <div>
                          <p className="text-xs text-muted-foreground">Продано</p>
                          <p className="text-sm font-semibold">{product.sale_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Рейтинг</p>
                          <p className="text-sm font-semibold">{product.rating.toFixed(1)} ⭐</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-foreground/10 p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Цей продавець ще не опублікував товарів</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
