'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { CategorySearch } from '@/components/shop/category-search';
import { CharacteristicSearch } from '@/components/shop/characteristic-search';
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, Laptop, Package, Repeat, Trash2, Upload } from 'lucide-react';

interface ProductAttribute {
  name: string;
  value: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    categoryName: '',
    productType: 'goods' as 'goods' | 'service' | 'digital' | 'subscription',
    price: '',
    description: '',
    shortDescription: '',
    originalPrice: '',
    stockQuantity: '1',
    sku: '',
    attributes: [] as ProductAttribute[],
    images: [] as string[]
  });

  const handleSelectCategory = (categoryId: string, categoryName: string) => {
    console.log('[v0] Selected category:', { categoryId, categoryName });
    setFormData(prev => ({ 
      ...prev, 
      categoryId, 
      categoryName 
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[v0] Uploading image:', file.name, file.size);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/shop/products/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      console.log('[v0] Image uploaded successfully:', data.imageUrl);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.imageUrl]
      }));

      toast({
        title: 'Фото завантажено',
        description: 'Фото додано до товару'
      });
    } catch (error) {
      console.error('[v0] Error uploading image:', error);
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалось завантажити фото',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[v0] handleSubmit called');

    if (!formData.title || !formData.categoryId || !formData.price || !formData.description) {
      console.log('[v0] Validation failed:', {
        title: !!formData.title,
        categoryId: !!formData.categoryId,
        price: !!formData.price,
        description: !!formData.description
      });
      toast({
        title: 'Помилка',
        description: 'Заповніть усі обов\'язкові поля (назва, категорія, ціна, опис)',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      console.log('[v0] Submitting product:', {
        title: formData.title,
        categoryId: formData.categoryId,
        price: formData.price,
        description: formData.description
      });
      
      const response = await fetch('/api/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          categoryId: parseInt(formData.categoryId),
          price: parseFloat(formData.price),
          description: formData.description,
          shortDescription: formData.shortDescription,
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          sku: formData.sku,
          productType: formData.productType,
          attributes: formData.attributes.filter(a => a.name && a.value),
          images: formData.images
        })
      });

      console.log('[v0] API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[v0] API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create product');
      }

      const data = await response.json();
      console.log('[v0] Product created successfully:', data);

      toast({
        title: 'Успіх!',
        description: data.message || 'Товар успішно створено'
      });

      // Reset form
      setFormData({
        title: '',
        categoryId: '',
        categoryName: '',
        productType: 'goods',
        price: '',
        description: '',
        shortDescription: '',
        originalPrice: '',
        stockQuantity: '1',
        sku: '',
        attributes: [],
        images: []
      });

      router.push('/mycabinet/shop');
    } catch (error) {
      console.error('[v0] Error creating product:', error);
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалось створити товар',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CabinetLayout 
      title="Створити товар"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <form onSubmit={handleSubmit} className="px-4 pt-6 pb-24 space-y-6">
        

        {/* Product type */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Тип оголошення
          </label>
          <div className="grid grid-cols-4 gap-1">
            {([
              { value: 'goods', label: 'Товар', icon: Package },
              { value: 'service', label: 'Послуга', icon: Briefcase },
              { value: 'digital', label: 'Цифровий', icon: Laptop },
              { value: 'subscription', label: 'Підписка', icon: Repeat },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, productType: value }))}
                aria-pressed={formData.productType === value}
                className={`mt-2 flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-2xl border text-[10px] font-bold transition-all text-center ${
                  formData.productType === value
                    ? 'border-primary border-3 bg-primary/10 text-primary'
                    : 'border-foreground/10 border-3 bg-foreground/5 text-muted-foreground hover:border-foreground/20'
                }`}
              >
                <div className="flex items-center justify-center p-2 rounded-full bg-foreground/5">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Назва товару
          </label>
          <input
            type="text"
            placeholder="Введіть назву товару"
            value={formData.title}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, title: e.target.value }))
            }
            required
            className="w-full mt-2 text-sm px-3 py-3 bg-foreground/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          
          <div className="space-y-2 text-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Ціна
            </label>
            <input
              type="text"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  originalPrice: e.target.value
                }))
              }
              className="w-full mt-2 text-sm px-3 py-3 bg-foreground/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2 text-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Зі знижкою
            </label>
            <input
              type="text"
              placeholder="0.00"
              
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, price: e.target.value }))
              }
              required
              className="w-full mt-2 text-sm px-3 py-3 bg-foreground/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
        </div>

        {/* Images */}
        <div className="space-y-3 text-center">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Фото товару
          </label>
          <label className="mt-2 flex items-center justify-center gap-2 p-6 border-3 border-dashed border-foreground/20 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Завантажити фото
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Product ${i}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Description */}
        <div className="space-y-2 text-center mt-12 pt-4 border-t-3 border-foreground/10">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Опис товару
          </label>
          <textarea
            placeholder="Детальний опис товару"
            value={formData.description}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            required
            className="w-full mt-2 px-4 py-3 bg-foreground/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Short description */}
        <div className="">
          <input
            type="text"
            placeholder="Опис в одну строку"
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                shortDescription: e.target.value
              }))
            }
            maxLength={500}
            className="w-full mt-2 text-sm px-3 py-3 bg-foreground/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        

        {/* Stock and SKU */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Наявність
            </label>
            <input
              type="text"
              placeholder="0"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  stockQuantity: e.target.value
                }))
              }
              className="w-full mt-2 text-sm px-3 py-3 bg-foreground/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2 text-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              SKU
            </label>
            <input
              type="text"
              placeholder="Артикул"
              value={formData.sku}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, sku: e.target.value }))
              }
              className="w-full mt-2 text-sm px-3 py-3 bg-foreground/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3 text-center mt-12 pt-4 border-t-3 border-foreground/10">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Категорія
          </label>
          <CategorySearch
            value={formData.categoryId}
            categoryName={formData.categoryName}
            onChange={handleSelectCategory}
          />
        </div>
        
        {/* Characteristics */}
        <div className="space-y-3">
          <CharacteristicSearch
            value={formData.attributes}
            onChange={(attrs) => setFormData(prev => ({ ...prev, attributes: attrs }))}
          />
        </div>
        

        {/* Buttons */}
        <div className="pt-6 space-y-3 mt-12 pt-4 border-t-3 border-foreground/10">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
          >
            {loading ? 'Створення...' : 'Створити товар'}
          </button>

          <Link href="/mycabinet/shop" className="flex-1">
            <button type="button" className="w-full px-4 py-3 text-foreground/50 font-semibold rounded-2xl bg-foreground/5 hover:bg-foreground/5 transition-all">
              Скасувати
            </button>
          </Link>
        </div>
      </form>
    </CabinetLayout>
  );
}
