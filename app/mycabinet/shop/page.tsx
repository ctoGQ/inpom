// app/mycabinet/shop/page.tsx
// Main shop page with product listing and filters

'use client';

import { useState, useEffect } from 'react';
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
import { CreateProductForm } from '@/components/shop/create-product-form';
import { Search, Filter } from 'lucide-react';
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
    <CabinetLayout title="Магазин" showBack>
      <div className="space-y-6 pt-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">Магазин</h1>
            <p className="text-muted-foreground">
              Знайдіть те, що вам потрібно, або створіть свій товар
            </p>
          </div>

          <CreateProductForm />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук товарів..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                Пошук
              </Button>
            </div>
          </form>

          {/* Category filter */}
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Всі категорії" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Всі категорії</SelectItem>
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted rounded-lg aspect-square animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Товари не знайдені</h3>
              <p className="text-muted-foreground">
                Спробуйте змінити фільтри або пошукові запити
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Попередня
                  </Button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      onClick={() => setPage(i + 1)}
                      className="w-10"
                    >
                      {i + 1}
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
                Показано {(page - 1) * limit + 1}-{Math.min(page * limit, total)} з {total} товарів
              </p>
            </>
          )}
        </div>
      </div>
    </CabinetLayout>
  );
}
