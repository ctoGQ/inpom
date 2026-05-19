'use client';

import { useEffect, useState } from 'react';
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
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Search, Star } from 'lucide-react';
import { ShopProductCard } from '@/components/shop/shop-product-card';

const LIMIT = 12;

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
  rating: number;
  review_count: number;
  sale_count: number;
  primary_image?: string;
  seller_name: string;
  seller_id: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / LIMIT);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/shop/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory) params.append('category', selectedCategory);
        params.append('sortBy', sortBy);
        params.append('page', page.toString());
        params.append('limit', LIMIT.toString());

        const res = await fetch(`/api/shop/products?${params}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, sortBy, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Магазин</h1>
              <p className="text-muted-foreground mt-1">Товари та послуги від спільноти</p>
            </div>
            <Link href="/mycabinet/shop">
              <Button variant="outline">Продавати товари</Button>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Пошук товарів..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Button type="submit">Шукати</Button>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedCategory} onValueChange={(value) => {
          setSelectedCategory(value);
          setPage(1);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Усі категорії" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Усі категорії</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}>
          <SelectTrigger>
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

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="p-4 space-y-3">
                <Skeleton className="w-full h-48" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-4" />
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Товари не знайдені</h3>
            <p className="text-muted-foreground mt-1">Спробуйте змінити фільтри або пошуковий запит</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ShopProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  slug={product.slug}
                  price={product.price}
                  originalPrice={product.original_price}
                  currency="UAH"
                  rating={product.rating}
                  reviewCount={product.review_count}
                  primaryImage={product.primary_image}
                  sellerName={product.seller_name}
                  sellerId={product.seller_id}
                  saleCount={product.sale_count}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Попередня
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Наступна
                </Button>
              </div>
            )}

            {/* Results info */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              Показано {(page - 1) * LIMIT + 1}-{Math.min(page * LIMIT, total)} з {total} товарів
            </p>
          </>
        )}
      </div>
    </div>
  );
}
