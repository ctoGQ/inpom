'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  currency: string;
  stock_quantity: number;
  sku?: string;
  product_type: string;
  status: string;
  is_featured: boolean;
  category_id: number;
  seller_id: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    currency: 'UAH',
    stock_quantity: '',
    sku: '',
    product_type: 'goods',
    status: 'draft',
    is_featured: false,
    category_id: '',
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [productRes, categoriesRes, profileRes] = await Promise.all([
          fetch(`/api/shop/products/detail?id=${productId}`),
          fetch('/api/shop/categories'),
          fetch('/api/auth/profile'),
        ]);

        if (!productRes.ok) {
          router.replace('/mycabinet/shop');
          return;
        }

        const [productData, categoriesData, profileData] = await Promise.all([
          productRes.json(),
          categoriesRes.json(),
          profileRes.json(),
        ]);

        const prod = productData.product;
        if (profileData.customer?.id !== prod.seller_id) {
          toast({
            title: 'Доступ заборонено',
            description: 'Ви не можете редагувати цей товар',
            variant: 'destructive',
          });
          router.replace(`/mycabinet/shop/${productId}`);
          return;
        }

        setProduct(prod);
        setCategories(categoriesData.categories || []);
        setCurrentUserId(profileData.customer?.id);

        setFormData({
          title: prod.title || '',
          slug: prod.slug || '',
          description: prod.description || '',
          short_description: prod.short_description || '',
          price: String(prod.price) || '',
          original_price: String(prod.original_price || ''),
          currency: prod.currency || 'UAH',
          stock_quantity: String(prod.stock_quantity) || '',
          sku: prod.sku || '',
          product_type: prod.product_type || 'goods',
          status: prod.status || 'draft',
          is_featured: prod.is_featured || false,
          category_id: String(prod.category_id) || '',
        });
      } catch (err) {
        console.error('[EditProduct] fetch error:', err);
        toast({
          title: 'Помилка',
          description: 'Не вдалося завантажити товар',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchAll();
  }, [productId, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/shop/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Не вдалося оновити товар');
      }

      toast({
        title: 'Успішно',
        description: 'Товар оновлено',
      });

      router.push(`/mycabinet/shop/${product.id}`);
    } catch (err) {
      toast({
        title: 'Помилка',
        description: err instanceof Error ? err.message : 'Не вдалося оновити товар',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CabinetLayout title="Редагування..." showBack showAvatar showNav>
        <div className="px-4 pt-6 pb-28 flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      </CabinetLayout>
    );
  }

  if (!product) {
    return (
      <CabinetLayout title="Не знайдено" showBack showAvatar showNav>
        <div className="px-4 pt-16 pb-28 flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground" />
          <p className="font-semibold text-foreground">Товар не знайдено</p>
          <Link href="/mycabinet/shop" className="text-sm text-muted-foreground underline">
            До магазину
          </Link>
        </div>
      </CabinetLayout>
    );
  }

  return (
    <CabinetLayout title="Редагування товару" showBack showAvatar showNav>
      <div className="px-4 pt-6 pb-28 space-y-6">
        {/* Back link */}
        <Link href={`/mycabinet/shop/${product.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Назад до товару
        </Link>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Основна інформація</h2>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Назва товару *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                placeholder="Введіть назву товару"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Слаг (URL) *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                placeholder="my-product-slug"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Короткий опис
              </label>
              <input
                type="text"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                placeholder="Короткий опис для картки товару"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.short_description.length} / 160 символів
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Повний опис *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-none"
                placeholder="Введіть повний опис товару"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Ціна і наявність</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Ціна *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Валюта
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                >
                  <option value="UAH">UAH</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Оригінальна ціна (для знижки)
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Кількість на складі *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="SKU-12345"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Класифікація</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Категорія *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                >
                  <option value="">Виберіть категорію</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Тип товару
                </label>
                <select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                >
                  <option value="goods">Товар</option>
                  <option value="service">Послуга</option>
                  <option value="digital">Цифровий</option>
                  <option value="subscription">Підписка</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Статус
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                >
                  <option value="draft">Чернетка</option>
                  <option value="active">Активний</option>
                  <option value="inactive">Неактивний</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background cursor-pointer hover:bg-foreground/5 transition-colors">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Рекомендований</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Link
              href={`/mycabinet/shop/${product.id}`}
              className="flex-1 px-4 py-3 rounded-xl border border-foreground/10 text-foreground font-medium transition-colors hover:bg-foreground/5"
            >
              Скасувати
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium transition-colors hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </CabinetLayout>
  );
}
