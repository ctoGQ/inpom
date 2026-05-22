'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { MobileModal } from '@/components/mobile-modal';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Plus, Trash2, ChevronRight } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductAttribute {
  name: string;
  value: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    categoryName: '',
    price: '',
    description: '',
    shortDescription: '',
    originalPrice: '',
    stockQuantity: '1',
    sku: '',
    attributes: [] as ProductAttribute[],
    images: [] as string[]
  });

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
        toast({
          title: 'Помилка',
          description: 'Не вдалось завантажити категорії',
          variant: 'destructive'
        });
      }
    };

    fetchCategories();
  }, [toast]);

  const handleSelectCategory = (categoryId: string, categoryName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      categoryId, 
      categoryName 
    }));
    setIsCategoryModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));

    toast({
      title: 'Фото завантажено',
      description: 'Фото додано до товару'
    });
  };

  const handleAddAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '' }]
    }));
  };

  const handleUpdateAttribute = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.categoryId || !formData.price) {
      toast({
        title: 'Помилка',
        description: 'Заповніть всі обов\'язкові поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shop/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          categoryId: parseInt(formData.categoryId),
          price: parseFloat(formData.price),
          description: formData.description,
          shortDescription: formData.shortDescription,
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          stockQuantity: parseInt(formData.stockQuantity),
          sku: formData.sku,
          attributes: formData.attributes.filter(a => a.name && a.value),
          images: formData.images
        })
      });

      if (!response.ok) throw new Error('Failed to create product');

      const data = await response.json();

      toast({
        title: 'Успіх!',
        description: data.message || 'Товар успішно створено'
      });

      router.push('/mycabinet/shop');
    } catch (error) {
      console.error('Error creating product:', error);
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
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Назва товару *
          </label>
          <input
            type="text"
            placeholder="Введіть назву товару"
            value={formData.title}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, title: e.target.value }))
            }
            required
            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Категорія *
          </label>
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="w-full p-4 rounded-2xl border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="font-medium text-foreground text-sm">
                {formData.categoryName || 'Оберіть категорію'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Ціна (INPOM) *
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, price: e.target.value }))
              }
              required
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Оригінальна ціна
            </label>
            <input
              type="number"
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
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Опис товару *
          </label>
          <textarea
            placeholder="Детальний опис товару"
            value={formData.description}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            required
            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Short description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Короткий опис
          </label>
          <input
            type="text"
            placeholder="Одна строка опису для переліку"
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                shortDescription: e.target.value
              }))
            }
            maxLength={500}
            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Stock and SKU */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Кількість в наявності
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  stockQuantity: e.target.value
                }))
              }
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              SKU
            </label>
            <input
              type="text"
              placeholder="Артикул товару"
              value={formData.sku}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, sku: e.target.value }))
              }
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Фото товару
          </label>
          <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-foreground/20 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
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

        {/* Attributes */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Характеристики
            </label>
            <button
              type="button"
              onClick={handleAddAttribute}
              className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Додати
            </button>
          </div>

          {formData.attributes.length > 0 && (
            <div className="space-y-2">
              {formData.attributes.map((attr, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Назва характеристики"
                    value={attr.name}
                    onChange={(e) =>
                      handleUpdateAttribute(i, 'name', e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Значення"
                    value={attr.value}
                    onChange={(e) =>
                      handleUpdateAttribute(i, 'value', e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(i)}
                    className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6">
          <Link href="/mycabinet/shop" className="flex-1">
            <button type="button" className="w-full px-6 py-4 text-foreground font-semibold rounded-2xl border border-foreground/10 hover:bg-foreground/5 transition-all">
              Скасувати
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
          >
            {loading ? 'Створення...' : 'Створити товар'}
          </button>
        </div>
      </form>

      {/* Category Modal */}
      <MobileModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Виберіть категорію"
      >
        <div className="px-4 py-6 space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelectCategory(category.id.toString(), category.name)}
              className={`w-full p-4 rounded-2xl border transition-all text-left font-medium ${
                formData.categoryId === category.id.toString()
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : 'bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </MobileModal>
    </CabinetLayout>
  );
}
