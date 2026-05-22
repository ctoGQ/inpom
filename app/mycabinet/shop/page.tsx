// app/mycabinet/shop/page.tsx
// Main shop page with product listing and filters

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { ShopProductCard } from '@/components/shop/shop-product-card';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  seller_name: string;
  seller_id: number;
  sale_count: number;
  is_featured: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/shop/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy
        });

        if (search) params.append('search', search);
        if (selectedCategory) params.append('category', selectedCategory);

        const response = await fetch(`/api/shop/products?${params}`);
        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        setProducts(data.products || []);
        setTotal(data.pagination.total);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Помилка',
          description: 'Не вдалось завантажити товари',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, sortBy, page, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <CabinetLayout 
      title="Магазин"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="space-y-2xl pt-lg">
        {/* Filters */}
        <div className="flex justify-end mb-lg">
          <Link href="/mycabinet/shop/create">
            <button className="cabinet-button cabinet-button-primary gap-md">
              <Plus className="w-4 h-4" />
              Додати товар
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="flex gap-md">
              <div className="flex-1 relative">
                <Search className="absolute left-sm top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук товарів..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="cabinet-form-input pl-lg h-3xl"
                />
              </div>
              <button type="submit" className="cabinet-button cabinet-button-secondary">
                Пошук
              </button>
            </div>
          </form>

          {/* Category filter */}
          <Select value={selectedCategory || "all"} onValueChange={(value) => {
            setSelectedCategory(value === "all" ? "" : value);
            setPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Всі категорії" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі категорії</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: any) => {
            setSortBy(value);
            setPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Сортування" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Найновіші</SelectItem>
              <SelectItem value="popular">Популярні</SelectItem>
              <SelectItem value="price-asc">Ціна: від дешевих</SelectItem>
              <SelectItem value="price-desc">Ціна: від дорогих</SelectItem>
              <SelectItem value="rating">За рейтингом</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-md">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="cabinet-skeleton aspect-square rounded-2xl"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="cabinet-empty-state">
              <Search className="w-3xl h-3xl text-muted-foreground mx-auto mb-lg" />
              <p className="cabinet-empty-state-title">Товари не знайдені</p>
              <p className="cabinet-empty-state-description">
                Спробуйте змінити фільтри або пошукові запити
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-md">
                {products.map(product => (
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
                    sellerId={product.seller_id}
                    saleCount={product.sale_count}
                    isFeatured={product.is_featured}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-md mt-2xl">
                  <button
                    className="cabinet-button cabinet-button-secondary"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Попередня
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      className={`w-2.5rem h-2.5rem rounded-lg font-semibold transition-all ${
                        page === i + 1 
                          ? 'cabinet-button-primary' 
                          : 'cabinet-button-secondary'
                      }`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="cabinet-button cabinet-button-secondary"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Наступна
                  </button>
                </div>
              )}

              {/* Results info */}
              <p className="text-center text-small text-muted-foreground mt-md">
                Показано {(page - 1) * limit + 1}-{Math.min(page * limit, total)} з {total} товарів
              </p>
            </>
          )}
        </div>
      </div>
    </CabinetLayout>
  );
}
