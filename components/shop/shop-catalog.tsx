'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { ShopProductCard } from '@/components/shop/shop-product-card';

const LIMIT = 12;
type ProductType = '' | 'goods' | 'service' | 'digital' | 'subscription';
const SORT_OPTIONS = ['newest', 'popular', 'price-asc', 'price-desc', 'rating'] as const;

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  price: string | number;
  original_price?: string | number;
  currency: string;
  rating: number;
  review_count: number;
  sale_count: number;
  primary_image?: string;
  category_name: string;
  seller_name: string;
  is_featured: boolean;
}

export function ShopCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(() => {
    const sort = searchParams.get('sortBy');
    return SORT_OPTIONS.includes(sort as typeof SORT_OPTIONS[number]) ? sort as typeof SORT_OPTIONS[number] : 'newest';
  });
  const [productType, setProductType] = useState<ProductType>(() => {
    const type = searchParams.get('type');
    return type === 'goods' || type === 'service' || type === 'digital' || type === 'subscription' ? type : '';
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState('');

  const totalPages = Math.ceil(total / LIMIT);
  const typeHeading = productType === 'service'
    ? 'Послуги від спільноти'
    : productType === 'goods'
      ? 'Товари від спільноти'
      : productType === 'subscription'
        ? 'Підписки від спільноти'
        : productType === 'digital'
          ? 'Цифрові продукти від спільноти'
          : 'Товари та послуги від спільноти';

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const type = params.get('type');
    const sort = params.get('sortBy');
    setSearch(params.get('search') || '');
    setSelectedCategory(params.get('category') || '');
    setProductType(type === 'goods' || type === 'service' || type === 'digital' || type === 'subscription' ? type : '');
    setSortBy(SORT_OPTIONS.includes(sort as typeof SORT_OPTIONS[number]) ? sort as typeof SORT_OPTIONS[number] : 'newest');
    setPage(1);
  }, [queryString]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/shop/categories');
        if (!response.ok) throw new Error(`Category request failed (${response.status})`);
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('[ShopCatalog] Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedCategory) params.set('category', selectedCategory);
        if (productType) params.set('type', productType);
        params.set('sortBy', sortBy);
        params.set('page', String(page));
        params.set('limit', String(LIMIT));

        const response = await fetch(`/api/shop/products?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Product request failed (${response.status})`);
        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotal(Number(data.pagination?.total) || 0);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('[ShopCatalog] Failed to load products:', error);
        setLoadError('Не вдалося завантажити каталог. Спробуйте оновити сторінку.');
        setProducts([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, [search, selectedCategory, productType, sortBy, page]);

  function updateQuery(next: { type?: ProductType; category?: string; sortBy?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('view');
    if (next.type !== undefined) next.type ? params.set('type', next.type) : params.delete('type');
    if (next.category !== undefined) next.category ? params.set('category', next.category) : params.delete('category');
    if (next.sortBy !== undefined) params.set('sortBy', next.sortBy);
    params.delete('page');
    setPage(1);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.delete('view');
    if (search.trim()) params.set('search', search.trim());
    else params.delete('search');
    params.delete('page');
    setPage(1);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const content = (
      <div className="pb-28">
        <header className="border-b border-foreground/10 bg-card/40 px-4 pb-5 pt-4">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">INPOM • простір можливостей</p>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Магазин</h1>
                <p className="mt-1 text-sm text-muted-foreground">{typeHeading}</p>
              </div>
              <Button asChild variant="outline" className="shrink-0 rounded-xl">
                <Link href="/mycabinet/shop/create">Продавати</Link>
              </Button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Пошук товарів та послуг..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 rounded-xl border-foreground/10 bg-background/80 pl-10"
                />
              </div>
              <Button type="submit" className="h-11 rounded-xl px-5">Шукати</Button>
            </form>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-3">
          <Select value={productType || 'all'} onValueChange={(value) => {
            const nextType = value === 'all' ? '' : value as ProductType;
            setProductType(nextType);
            updateQuery({ type: nextType });
          }}>
            <SelectTrigger className="h-11 rounded-xl border-foreground/10 bg-card/50">
              <SelectValue placeholder="Усі пропозиції" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі пропозиції</SelectItem>
              <SelectItem value="goods">Товари</SelectItem>
              <SelectItem value="service">Послуги</SelectItem>
              <SelectItem value="digital">Цифрові товари</SelectItem>
              <SelectItem value="subscription">Підписки</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory || 'all'} onValueChange={(value) => {
            const nextCategory = value === 'all' ? '' : value;
            setSelectedCategory(nextCategory);
            updateQuery({ category: nextCategory });
          }}>
            <SelectTrigger className="h-11 rounded-xl border-foreground/10 bg-card/50">
              <SelectValue placeholder="Усі категорії" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі категорії</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
            updateQuery({ sortBy: value });
          }}>
            <SelectTrigger className="h-11 rounded-xl border-foreground/10 bg-card/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Новіші спочатку</SelectItem>
              <SelectItem value="popular">За популярністю</SelectItem>
              <SelectItem value="price-asc">Ціна: низька-висока</SelectItem>
              <SelectItem value="price-desc">Ціна: висока-низька</SelectItem>
              <SelectItem value="rating">За рейтингом</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <main className="mx-auto max-w-7xl px-4 pb-8 pt-2">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-foreground/10">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-foreground/10 bg-card/30 px-5 py-16 text-center">
              <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-foreground/5">
                <Search className="size-7 text-muted-foreground" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold">{loadError ? 'Каталог тимчасово недоступний' : 'Пропозицій не знайдено'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{loadError || 'Спробуйте змінити категорію, тип або пошуковий запит.'}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {products.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    slug={product.slug}
                    price={product.price}
                    originalPrice={product.original_price}
                    currency={product.currency}
                    rating={product.rating}
                    reviewCount={product.review_count}
                    primaryImage={product.primary_image}
                    sellerName={product.seller_name}
                    saleCount={product.sale_count}
                    categoryName={product.category_name}
                    isFeatured={product.is_featured}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                    Попередня
                  </Button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <Button key={pageNumber} variant={page === pageNumber ? 'default' : 'outline'} onClick={() => setPage(pageNumber)}>
                      {pageNumber}
                    </Button>
                  ))}
                  <Button variant="outline" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
                    Наступна
                  </Button>
                </div>
              )}
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Показано {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} з {total}
              </p>
            </>
          )}
        </main>
      </div>
  );

  return content;
}
