// app/mycabinet/shop/page.tsx
// Main shop page with product listing and filters

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { MobileModal } from '@/components/mobile-modal';
import { ShopProductCard } from '@/components/shop/shop-product-card';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
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
          search: search || '',
          category: selectedCategory || '',
          sort: sortBy,
          page: page.toString(),
          limit: limit.toString()
        });

        const response = await fetch(`/api/shop/products?${params}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();

        setProducts(data.products || []);
        setTotal(data.total || 0);
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

  const selectedCategoryName = categories.find(c => c.slug === selectedCategory)?.name;
  const selectedSortName = {
    'newest': 'Найновіші',
    'popular': 'Популярні',
    'price-asc': 'Ціна: від дешевих',
    'price-desc': 'Ціна: від дорогих',
    'rating': 'За рейтингом'
  }[sortBy] || 'Сортування';

  return (
    <CabinetLayout 
      title="Магазин"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="px-4 pt-6 pb-24 space-y-6">
        {/* Top Bar with Add Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Товари</h2>
          <Link href="/mycabinet/shop/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-md transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Додати</span>
            </button>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Пошук товарів..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-lg font-medium transition-all"
          >
            Пошук
          </button>
        </form>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Category Filter */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground rounded-lg text-sm font-medium transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{selectedCategoryName || 'Категорія'}</span>
          </button>

          {/* Sort Filter */}
          <button
            onClick={() => setIsSortModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground rounded-lg text-sm font-medium transition-all"
          >
            <span>{selectedSortName}</span>
          </button>

          {/* Clear filters */}
          {(selectedCategory || sortBy !== 'newest') && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSortBy('newest');
                setPage(1);
              }}
              className="px-3 py-2 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
            >
              Скинути
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 bg-foreground/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-foreground font-semibold text-center">Товари не знайдені</p>
            <p className="text-muted-foreground text-sm text-center mt-2">Спробуйте змінити фільтри або пошукові запити</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex justify-center gap-2 pt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-lg font-medium transition-all"
                >
                  Попередня
                </button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = Math.max(1, page - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        page === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-foreground/10 hover:bg-foreground/20 text-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-lg font-medium transition-all"
                >
                  Наступна
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Category Modal */}
      <MobileModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Оберіть категорію"
      >
        <div className="px-4 py-6 space-y-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              setIsCategoryModalOpen(false);
              setPage(1);
            }}
            className={`w-full p-4 rounded-2xl border transition-all text-left font-medium ${
              selectedCategory === ''
                ? 'bg-primary/10 border-primary/50 text-primary'
                : 'bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10'
            }`}
          >
            Всі категорії
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setIsCategoryModalOpen(false);
                setPage(1);
              }}
              className={`w-full p-4 rounded-2xl border transition-all text-left font-medium ${
                selectedCategory === cat.slug
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : 'bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </MobileModal>

      {/* Sort Modal */}
      <MobileModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        title="Сортування"
      >
        <div className="px-4 py-6 space-y-2">
          {(
            [
              { value: 'newest', label: 'Найновіші' },
              { value: 'popular', label: 'Популярні' },
              { value: 'price-asc', label: 'Ціна: від дешевих' },
              { value: 'price-desc', label: 'Ціна: від дорогих' },
              { value: 'rating', label: 'За рейтингом' }
            ] as const
          ).map(option => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                setIsSortModalOpen(false);
                setPage(1);
              }}
              className={`w-full p-4 rounded-2xl border transition-all text-left font-medium ${
                sortBy === option.value
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : 'bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </MobileModal>
    </CabinetLayout>
  );
}
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
