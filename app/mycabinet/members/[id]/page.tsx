'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { useToast } from '@/components/ui/use-toast';
import {
  Star,
  Package,
  BarChart2,
  AlertCircle,
  ShoppingCart,
  MessageCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface Seller {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  rating: number;
  review_count: number;
  product_count: number;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  original_price?: number;
  currency: string;
  rating: number;
  review_count: number;
  sale_count: number;
  stock_quantity: number;
  is_featured: boolean;
  status: string;
  category_id: number;
  category_name: string;
  discount: number;
}

function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  return src ? (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 text-foreground font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
}

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;
  const { toast } = useToast();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'details' | 'products'>('profile');

  useEffect(() => {
    const fetchSellerProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sellers/${sellerId}`);

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Не вдалось завантажити профіль');
        }

        const data = await res.json();
        setSeller(data.seller);
        setProducts(data.products || []);
      } catch (err) {
        console.error('[SellerProfile] fetch error:', err);
        toast({
          title: 'Помилка',
          description: err instanceof Error ? err.message : 'Не вдалось завантажити профіль продавця',
          variant: 'destructive',
        });
        router.replace('/mycabinet/shop');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) fetchSellerProfile();
  }, [sellerId, router, toast]);

  if (loading) {
    return (
      <CabinetLayout title="Завантаження..." showBack showAvatar showNav>
        <div className="px-4 pt-6 pb-28 space-y-4">
          <div className="w-20 h-20 bg-foreground/5 rounded-full animate-pulse mx-auto" />
          <div className="h-6 w-1/2 bg-foreground/5 rounded animate-pulse mx-auto" />
          <div className="h-4 w-1/3 bg-foreground/5 rounded animate-pulse mx-auto" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-foreground/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </CabinetLayout>
    );
  }

  if (!seller) {
    return (
      <CabinetLayout title="Не знайдено" showBack showAvatar showNav>
        <div className="px-4 pt-16 pb-28 flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground" />
          <p className="font-semibold text-foreground">Продавець не знайдено</p>
          <Link href="/mycabinet/shop" className="text-sm text-muted-foreground underline">
            До магазину
          </Link>
        </div>
      </CabinetLayout>
    );
  }

  return (
    <CabinetLayout title={seller.name} showBack showAvatar showNav>
      <div className="px-4 pt-6 pb-28 space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-3">
          <Avatar name={seller.name} src={seller.avatar_url} size={80} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{seller.name}</h1>
            {seller.bio && (
              <p className="text-sm text-muted-foreground mt-1">{seller.bio}</p>
            )}
          </div>

          {/* Rating & Stats Quick View */}
          <div className="flex items-center justify-center gap-4 pt-2">
            {seller.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-foreground text-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {seller.rating.toFixed(1)}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {seller.review_count} відгуків
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-foreground/5 p-1 rounded-xl">
          {(
            [
              { key: 'profile', label: 'Профіль' },
              { key: 'details', label: 'Деталі' },
              { key: 'products', label: `Товари (${products.length})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-3 py-2.5 rounded-lg font-medium text-xs transition-colors ${
                activeTab === key ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
            {seller.avatar_url && (
              <div className="p-6 flex justify-center">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-foreground/5">
                  <Image
                    src={seller.avatar_url}
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Ім'я
                </p>
                <p className="text-sm font-medium text-foreground">{seller.name}</p>
              </div>
              {seller.bio && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Про мене
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{seller.bio}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Email
                </p>
                <p className="text-sm text-foreground break-all">{seller.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Details */}
        {activeTab === 'details' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Товарів',
                  value: seller.product_count,
                  icon: <Package className="w-4 h-4" />,
                },
                {
                  label: 'Рейтинг',
                  value: seller.rating.toFixed(1),
                  icon: <Star className="w-4 h-4 fill-foreground/60 text-foreground/60" />,
                },
                {
                  label: 'Відгуків',
                  value: seller.review_count,
                  icon: <MessageCircle className="w-4 h-4" />,
                },
                {
                  label: 'На платформі',
                  value: new Date(seller.created_at).toLocaleDateString('uk-UA', {
                    month: 'short',
                    year: 'numeric',
                  }),
                  icon: <Calendar className="w-4 h-4" />,
                },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="p-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] flex flex-col gap-2"
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {icon}
                    <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-foreground/10 p-5 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Інформація про продавця
                </p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                Цей продавець активно займається торгівлею на платформі та користується довірою покупців.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Products */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/mycabinet/shop/${product.id}?referrer=/mycabinet/members/${sellerId}`}
                    className="group"
                  >
                    <div className="rounded-2xl border border-foreground/10 overflow-hidden hover:border-foreground/30 transition-colors">
                      {/* Product Image Placeholder */}
                      <div className="relative w-full aspect-square bg-foreground/5 flex items-center justify-center overflow-hidden">
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                        {product.discount > 0 && (
                          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-lg">
                            -{product.discount}%
                          </div>
                        )}
                        {product.is_featured && (
                          <div className="absolute top-2 right-2 bg-foreground text-background text-xs font-bold px-2 py-1 rounded-lg">
                            ТОП
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3 space-y-2">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-lg font-bold text-foreground">
                            {Number(product.price).toFixed(0)}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground">
                            {product.currency}
                          </p>
                        </div>

                        {/* Category */}
                        <p className="text-xs text-muted-foreground">
                          {product.category_name}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          {product.rating > 0 && (
                            <>
                              <Star className="w-3 h-3 fill-foreground/60 text-foreground/60" />
                              <span>{product.rating.toFixed(1)}</span>
                            </>
                          )}
                          {product.sale_count > 0 && (
                            <>
                              <span>•</span>
                              <BarChart2 className="w-3 h-3" />
                              <span>{product.sale_count} продано</span>
                            </>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div
                          className={`text-xs font-medium ${
                            product.stock_quantity > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {product.stock_quantity > 0
                            ? `${product.stock_quantity} в наявності`
                            : 'Немає в наявності'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-foreground/10 p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  У цього продавця поки немає активних товарів
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </CabinetLayout>
  );
}
