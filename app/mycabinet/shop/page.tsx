// app/mycabinet/shop/page.tsx
// Marketplace page - App Store / Play Market style
// All authenticated users see ALL products

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import {
  Search,
  Star,
  Tag,
  ChevronRight,
  Plus,
  TrendingUp,
  Sparkles,
  Package,
  Store,
  Percent,
} from 'lucide-react';

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  original_price?: number;
  currency: string;
  rating: number;
  review_count: number;
  primary_image?: string;
  category_name: string;
  category_slug: string;
  sale_count: number;
  seller_name: string;
  seller_id: number;
  seller_avatar?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon_url?: string;
  color?: string;
}

interface Seller {
  id: number;
  name: string;
  avatar_url?: string;
  average_rating: number;
  total_reviews: number;
  total_sales: number;
  product_count: number;
  is_verified: boolean;
}

// ─── Compact product card for carousels ───────────────────────────────────────
function CarouselProductCard({ product }: { product: Product }) {
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  return (
    <Link href={`/mycabinet/shop/${product.id}`} className="block flex-shrink-0 w-40">
      <div className="rounded-2xl border border-foreground/10 bg-card overflow-hidden hover:bg-foreground/5 transition-colors">
        {/* Image */}
        <div className="relative w-full aspect-square bg-foreground/5">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.title}
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-md">
              -{discount}%
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-3 space-y-1">
          <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{product.title}</p>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-foreground/60 text-foreground/60" />
            <span className="text-xs text-muted-foreground">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {Number(product.price).toFixed(0)} {product.currency}
            </p>
            {product.original_price && product.original_price > product.price && (
              <p className="text-xs text-muted-foreground line-through">
                {Number(product.original_price).toFixed(0)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Seller circle avatar ─────────────────────────────────────────────────────
function SellerCircle({ seller }: { seller: Seller }) {
  const initials = seller.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/mycabinet/members/${seller.id}`}
      className="block flex-shrink-0 w-[72px] text-center"
    >
      <div className="relative w-14 h-14 mx-auto rounded-full border-2 border-foreground/10 bg-foreground/5 overflow-hidden mb-1.5">
        {seller.avatar_url ? (
          <Image
            src={seller.avatar_url}
            alt={seller.name}
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm font-bold text-muted-foreground">{initials}</span>
          </div>
        )}
        {seller.is_verified && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <span className="text-[8px] text-primary-foreground font-bold">✓</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground truncate leading-tight">{seller.name.split(' ')[0]}</p>
      {seller.product_count > 0 && (
        <p className="text-[10px] text-muted-foreground/60">{seller.product_count} тов.</p>
      )}
    </Link>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  icon: Icon,
  href,
}: {
  title: string;
  icon: React.ElementType;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-foreground" />
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Всі <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
const ProductSkeletons = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-40 h-56 bg-foreground/5 rounded-2xl animate-pulse" />
    ))}
  </>
);

const SellerSkeletons = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-[72px] space-y-1.5">
        <div className="w-14 h-14 mx-auto rounded-full bg-foreground/5 animate-pulse" />
        <div className="h-3 w-10 mx-auto bg-foreground/5 rounded animate-pulse" />
      </div>
    ))}
  </>
);

// ─── Category icons fallback map ──────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  default: '🛍️',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ShopMarketplacePage() {
  const [serviceProducts, setServiceProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sellersRes, servicesRes, goodsRes, newRes, categoriesRes] = await Promise.all([
          fetch('/api/shop/sellers?limit=24'),
          fetch('/api/shop/products?type=service&sortBy=rating&limit=24'),
          fetch('/api/shop/products?type=goods&sortBy=popular&limit=24'),
          fetch('/api/shop/products?sortBy=newest&limit=24'),
          fetch('/api/shop/categories'),
        ]);

        const [sellersData, servicesData, goodsData, newData, categoriesData] = await Promise.all([
          sellersRes.json(),
          servicesRes.json(),
          goodsRes.json(),
          newRes.json(),
          categoriesRes.json(),
        ]);

        setSellers(Array.isArray(sellersData) ? sellersData : []);

        const services: Product[] = servicesData.products || [];
        const goods: Product[] = goodsData.products || [];
        const newest: Product[] = newData.products || [];

        setServiceProducts(services);
        setPopularProducts(goods);
        setNewProducts(newest);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Discount products: any active product with original_price > price
        const seen = new Set<number>();
        const discounts: Product[] = [];
        [...services, ...goods, ...newest].forEach((p) => {
          if (
            !seen.has(p.id) &&
            p.original_price &&
            Number(p.original_price) > Number(p.price)
          ) {
            seen.add(p.id);
            discounts.push(p);
          }
        });
        setDiscountProducts(discounts);
      } catch (err) {
        console.error('[ShopMarketplace] Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <CabinetLayout title="Маркетплейс" showAvatar showNav>
      <div className="pb-28">
        {/* ── Search bar ── */}
        <div className="px-4 pt-4 pb-6">
          <Link href="/shop">
            <div className="flex items-center gap-3 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">Пошук товарів та послуг...</span>
            </div>
          </Link>
        </div>

        <div className="space-y-10">
          {/* ── 1. Кращі Продавці ── */}
          <section>
            <SectionHeader title="Кращі Продавці" icon={Store} />
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {loading ? (
                <SellerSkeletons />
              ) : sellers.length > 0 ? (
                sellers.map((seller) => <SellerCircle key={seller.id} seller={seller} />)
              ) : (
                <p className="text-sm text-muted-foreground px-2">Поки немає продавців</p>
              )}
            </div>
          </section>

          {/* ── 2. Кращі Послуги ── */}
          <section>
            <SectionHeader title="Кращі Послуги" icon={Sparkles} href="/shop?type=service&sortBy=rating" />
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {loading ? (
                <ProductSkeletons />
              ) : serviceProducts.length > 0 ? (
                serviceProducts.map((p) => <CarouselProductCard key={p.id} product={p} />)
              ) : (
                <p className="text-sm text-muted-foreground px-2">Немає послуг</p>
              )}
            </div>
          </section>

          {/* ── 3. Кращі Товари ── */}
          <section>
            <SectionHeader title="Кращі Товари" icon={TrendingUp} href="/shop?sortBy=popular" />
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {loading ? (
                <ProductSkeletons />
              ) : popularProducts.length > 0 ? (
                popularProducts.map((p) => <CarouselProductCard key={p.id} product={p} />)
              ) : (
                <p className="text-sm text-muted-foreground px-2">Немає товарів</p>
              )}
            </div>
          </section>

          {/* ── 4. Категорії (2-column grid, 6 rows) ── */}
          <section>
            <SectionHeader title="Категорії" icon={Tag} href="/shop" />
            <div className="px-4">
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-14 bg-foreground/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categories.slice(0, 12).map((cat) => (
                    <Link key={cat.id} href={`/mycabinet/shop/category/${cat.slug}`}>
                      <div className="p-4 rounded-2xl border border-foreground/10 bg-card hover:bg-foreground/5 transition-colors flex items-center gap-3 h-14">
                        {cat.icon_url ? (
                          <Image
                            src={cat.icon_url}
                            alt={cat.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0"
                          />
                        ) : (
                          <span className="text-lg flex-shrink-0">
                            {CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default}
                          </span>
                        )}
                        <span className="text-sm font-medium text-foreground truncate leading-tight">
                          {cat.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── 5. Останні Новинки ── */}
          <section>
            <SectionHeader title="Останні Новинки" icon={Package} href="/shop?sortBy=newest" />
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {loading ? (
                <ProductSkeletons />
              ) : newProducts.length > 0 ? (
                newProducts.map((p) => <CarouselProductCard key={p.id} product={p} />)
              ) : (
                <p className="text-sm text-muted-foreground px-2">Немає новинок</p>
              )}
            </div>
          </section>

          {/* ── 6. Акції та Знижки ── */}
          <section>
            <SectionHeader title="Акції та Знижки" icon={Percent} />
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {loading ? (
                <ProductSkeletons />
              ) : discountProducts.length > 0 ? (
                discountProducts.map((p) => <CarouselProductCard key={p.id} product={p} />)
              ) : (
                <div className="flex-shrink-0 w-72">
                  <div className="rounded-2xl border border-foreground/10 bg-card p-6 text-center">
                    <Percent className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Зараз немає акцій</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── CTA: Add your product ── */}
          <div className="px-4">
            <Link href="/mycabinet/shop/create">
              <div className="rounded-2xl border border-foreground/10 bg-card p-5 flex items-center justify-between hover:bg-foreground/5 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">Додайте свій товар</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Почніть продавати на платформі</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </CabinetLayout>
  );
}
