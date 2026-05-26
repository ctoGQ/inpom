// app/mycabinet/shop/page.tsx
// Main shop page with product listing and filters

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { MobileModal } from '@/components/mobile-modal';
import { SellerProductCard } from '@/components/shop/seller-product-card';
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
  category_name: string;
  sale_count: number;
  status: string;
  attribute_count: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'draft' | 'inactive'>('all');
  const { toast } = useToast();

  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          status: selectedStatus
        });

        const response = await fetch(`/api/shop/products/seller?${params}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();

        setProducts(data.products || []);
        setTotal(data.pagination?.total || 0);
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
  }, [page, selectedStatus, toast]);

  const statusLabel = {
    'all': 'Усі товари',
    'active': 'Активні',
    'draft': 'Чорновики',
    'inactive': 'Неактивні'
  }[selectedStatus] || 'Усі товари';

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
          <h2 className="text-lg font-semibold text-foreground">Мої товари</h2>
          <Link href="/mycabinet/shop/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-md transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Додати</span>
            </button>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsSortModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground rounded-lg text-sm font-medium transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{statusLabel}</span>
          </button>

          {selectedStatus !== 'all' && (
            <button
              onClick={() => {
                setSelectedStatus('all');
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
            <p className="text-muted-foreground text-sm text-center mt-2">
              {selectedStatus === 'all' 
                ? 'Почніть продавати - додайте свій перший товар'
                : 'Немає товарів з цим статусом'}
            </p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <SellerProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.original_price}
                  currency={product.currency}
                  rating={product.rating}
                  reviewCount={product.review_count}
                  primaryImage={product.primary_image}
                  categoryName={product.category_name}
                  saleCount={product.sale_count}
                  status={product.status}
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

      {/* Status Filter Modal */}
      <MobileModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        title="Фільтр за статусом"
      >
        <div className="px-4 py-6 space-y-2">
          {(['all', 'active', 'draft', 'inactive'] as const).map(status => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setIsSortModalOpen(false);
                setPage(1);
              }}
              className={`w-full p-4 rounded-2xl border transition-all text-left font-medium ${
                selectedStatus === status
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : 'bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10'
              }`}
            >
              {statusLabel.split(' ').length > 1 
                ? {
                    'all': 'Усі товари',
                    'active': 'Активні',
                    'draft': 'Чорновики',
                    'inactive': 'Неактивні'
                  }[status]
                : statusLabel}
            </button>
          ))}
        </div>
      </MobileModal>
    </CabinetLayout>
  );
}
