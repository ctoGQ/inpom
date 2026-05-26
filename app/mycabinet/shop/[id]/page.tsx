'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2, Loader } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: number;
  title: string;
  description: string;
  short_description: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  status: string;
  category_name: string;
  primary_image?: string;
  attribute_count: number;
  sale_count: number;
  rating: number;
  review_count: number;
}

interface ProductAttribute {
  id: number;
  attribute_name: string;
  attribute_value: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    stockQuantity: '',
    status: 'active'
  });

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/shop/products/detail?id=${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data.product);
        setAttributes(data.attributes || []);
        
        setFormData({
          title: data.product.title,
          description: data.product.description,
          shortDescription: data.product.short_description,
          price: data.product.price.toString(),
          originalPrice: (data.product.original_price || '').toString(),
          stockQuantity: data.product.stock_quantity.toString(),
          status: data.product.status
        });
      } catch (error) {
        console.error('[v0] Error fetching product:', error);
        toast({
          title: 'Помилка',
          description: 'Не вдалось завантажити дані продукту',
          variant: 'destructive'
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, toast, router]);

  const handleSave = async () => {
    if (!formData.title || !formData.price) {
      toast({
        title: 'Помилка',
        description: 'Заповніть обов\'язкові поля',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/shop/products/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(productId),
          title: formData.title,
          description: formData.description,
          shortDescription: formData.shortDescription,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          stockQuantity: parseInt(formData.stockQuantity),
          status: formData.status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      toast({
        title: 'Успіх!',
        description: 'Продукт успішно оновлено'
      });

      setIsEditing(false);
    } catch (error) {
      console.error('[v0] Error saving product:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалось зберегти зміни',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цей продукт?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/shop/products/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(productId)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast({
        title: 'Успіх!',
        description: 'Продукт видалено'
      });

      router.push('/mycabinet/shop');
    } catch (error) {
      console.error('[v0] Error deleting product:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалось видалити продукт',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <CabinetLayout
        title="Завантаження..."
        showBack={true}
        showAvatar={true}
        showNav={true}
      >
        <div className="px-4 pt-6 pb-24">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-foreground/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </CabinetLayout>
    );
  }

  if (!product) {
    return (
      <CabinetLayout
        title="Продукт не знайдено"
        showBack={true}
        showAvatar={true}
        showNav={true}
      >
        <div className="px-4 pt-6 pb-24">
          <p className="text-muted-foreground">Продукт не знайдено</p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </CabinetLayout>
    );
  }

  return (
    <CabinetLayout
      title={product.title}
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="px-4 pt-6 pb-24 space-y-6">
        {/* Product Image */}
        {product.primary_image && (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-foreground/5">
            <Image
              src={product.primary_image}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Продано</p>
            <p className="text-2xl font-bold text-foreground mt-1">{product.sale_count}</p>
          </div>
          <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Рейтинг</p>
            <p className="text-2xl font-bold text-foreground mt-1">{(Number(product.rating) || 0).toFixed(1)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Відгуки</p>
            <p className="text-2xl font-bold text-foreground mt-1">{product.review_count}</p>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <div className="space-y-4 p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
            <h3 className="font-semibold text-foreground">Редагування</h3>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Назва продукту
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Назва продукту"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Опис
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Детальний опис"
                rows={4}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Короткий опис
              </label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Одна строка опису"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Ціна (UAH)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Оригінальна ціна
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Кількість в наявності
              </label>
              <Input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg text-foreground"
              >
                <option value="active">Активний</option>
                <option value="draft">Чорновик</option>
                <option value="inactive">Неактивний</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Скасувати
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 gap-2"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                {saving ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Категорія</p>
              <p className="text-foreground font-medium mt-1">{product.category_name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Опис</p>
              <p className="text-foreground mt-1 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Короткий опис</p>
              <p className="text-foreground mt-1">{product.short_description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ціна</p>
                <p className="text-lg font-bold text-foreground mt-1">{product.price} UAH</p>
              </div>
              {product.original_price && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Оригінальна ціна</p>
                  <p className="text-lg font-bold text-muted-foreground mt-1 line-through">{product.original_price} UAH</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Кількість в наявності</p>
              <p className="text-foreground font-medium mt-1">{product.stock_quantity}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</p>
              <p className="text-foreground font-medium mt-1 capitalize">{product.status}</p>
            </div>
          </div>
        )}

        {/* Attributes */}
        {attributes.length > 0 && (
          <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
            <h3 className="font-semibold text-foreground mb-3">Характеристики</h3>
            <div className="space-y-2">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex justify-between items-center py-2 border-b border-foreground/10 last:border-0">
                  <p className="text-sm text-muted-foreground">{attr.attribute_name}</p>
                  <p className="text-sm font-medium text-foreground">{attr.attribute_value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex-1"
          >
            {isEditing ? 'Скасувати' : 'Редагувати'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 gap-2"
          >
            {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? 'Видалення...' : 'Видалити'}
          </Button>
        </div>

        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад до списку
        </Button>
      </div>
    </CabinetLayout>
  );
}
