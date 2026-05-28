'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { useToast } from '@/components/ui/use-toast';
import {
  Star,
  Package,
  SlidersHorizontal,
  Search,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
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
  primary_image?: string;
  category_name: string;
  category_slug: string;
  seller_name: string;
  seller_id: number;
  seller_avatar?: string;
  is_featured: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  color?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Нові' },
  { value: 'popular',    label: 'Популярні' },
  { value: 'rating',     label: 'За рейтингом' },
  { value: 'price-asc',  label: 'Ціна ↑' },
  { value: 'price-desc', label: 'Ціна ↓' },
] as const;

type SortValue = typeof SORT_OPTIONS[number]['value'];

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const discount =
    product.original_price && Number(product.original_price) > Number(product.price)
      ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
      : 0;

  return (
    <Link href={`/mycabinet/shop/${product.id}`} className="block">
      <div className="rounded-2xl border border-foreground/10 bg-card overflow-hidden hover:bg-foreground/5 transition-colors">
        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-foreground/5">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-md">
              -{discount}%
            </div>
          )}
          {product.is_featured && (
            <div className="absolute top-2 right-2 bg-foreground text-background text-xs font-bold px-1.5 py-0.5 rounded-md">
              ТОП
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">{product.title}</p>

          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-foreground/50 text-foreground/50" />
            <span className="text-xs text-muted-foreground">{Number(product.rating).toFixed(1)}</span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground">{product.sale_count} продано</span>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2">
            {product.seller_avatar ? (
              <Image
                src={product.seller_avatar}
                alt={product.seller_name}
                width={16}
                height={16}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 text-[8px] font-semibold text-foreground">
                {initials(product.seller_name)}
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">{product.seller_name}</span>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-foreground">{Number(product.price).toFixed(0)}</span>
              <span className="text-xs text-muted-foreground">{product.currency || 'INPOM'}</span>
            </div>
            {discount > 0 && (
              <p className="text-xs text-muted-foreground line-through">
                {Number(product.original_price).toFixed(0)} {product.currency || 'INPOM'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-foreground/10 overflow-hidden">
      <div className="w-full aspect-[4/3] bg-foreground/5 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-foreground/5 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-foreground/5 rounded animate-pulse" />
        <div className="h-5 w-1/2 bg-foreground/5 rounded animate-pulse" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [showSort, setShowSort] = useState(false);

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  // Fetch category info once
  useEffect(() => {
    if (!slug) return;
    fetch('/api/shop/categories')
      .then((r) => r.json())
      .then((cats: Category[]) => {
        const found = cats.find((c) => c.slug === slug);
        setCategory(found || { id: 0, name: slug, slug });
      })
      .catch(() => setCategory({ id: 0, name: slug, slug }));
  }, [slug]);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        category: slug,
        sortBy,
        page: String(page),
        limit: String(LIMIT),
      });
      if (search) qs.set('search', search);

      const res = await fetch(`/api/shop/products?${qs}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast({ title: 'Помилка', description: 'Не вдалось завантажити товари', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [slug, sortBy, page, search, toast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <CabinetLayout
      title={category?.name || 'Категорія'}
      showBack
      showAvatar
      showNav
    >
      <div className="px-4 pt-4 pb-28 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">{category?.name || '...'}</h1>
            {total > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{total} товар{total === 1 ? '' : total < 5 ? 'и' : 'ів'}</p>
            )}
          </div>
          <button
            onClick={() => setShowSort((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
              showSort
                ? 'bg-foreground text-background border-foreground'
                : 'bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          </button>
        </div>

        {/* ── Sort dropdown ── */}
        {showSort && (
          <div className="rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setPage(1); setShowSort(false); }}
                className={`w-full p-4 text-left text-sm flex items-center justify-between hover:bg-foreground/5 transition-colors ${
                  sortBy === opt.value ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}
              >
                {opt.label}
                {sortBy === opt.value && <ChevronRight className="w-4 h-4 text-foreground" />}
              </button>
            ))}
          </div>
        )}

        {/* ── Search ── */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Пошук в "${category?.name || 'категорії'}"...`}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </form>

        {/* ── Products grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 p-12 flex flex-col items-center gap-3">
            <Package className="w-12 h-12 text-muted-foreground/20" />
            <p className="text-sm font-semibold text-foreground text-center">
              {search ? `Нічого не знайдено за "${search}"` : 'Товарів ще немає'}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {search ? 'Спробуйте змінити пошуковий запит' : 'Ця категорія поки порожня'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground disabled:opacity-40 hover:bg-foreground/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </button>

            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground disabled:opacity-40 hover:bg-foreground/10 transition-colors"
            >
              Далі
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </CabinetLayout>
  );
}
