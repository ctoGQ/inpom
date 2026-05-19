'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

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

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
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

      // Redirect back to shop
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
    <CabinetLayout title="Створити товар" showBack>
      <div className="py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/mycabinet/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Повернутися в магазин
          </Link>
          <h1 className="text-3xl font-bold mb-2">Створити новий товар</h1>
          <p className="text-muted-foreground">Заповніть інформацію про ваш товар</p>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Назва товару *
                </label>
                <Input
                  placeholder="Введіть назву товару"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Категорія *
                </label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть категорію" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ціна (UAH) *
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Оригінальна ціна
                  </label>
                  <Input
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
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Опис товару *
                </label>
                <Textarea
                  placeholder="Детальний опис товару"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  rows={5}
                  required
                />
              </div>

              {/* Short description */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Короткий опис
                </label>
                <Input
                  placeholder="Одна строка опису для переліку"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      shortDescription: e.target.value
                    }))
                  }
                  maxLength={500}
                />
              </div>

              {/* Stock and SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Кількість в наявності
                  </label>
                  <Input
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
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-2 block">SKU</label>
                  <Input
                    placeholder="Артикул товару"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, sku: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">Фото товару</label>
                <div className="border-2 border-dashed border-input rounded-lg p-6">
                  <label className="flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Завантажити фото</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${i}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attributes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-900">Характеристики</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAttribute}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Додати
                  </Button>
                </div>

                {formData.attributes.length > 0 && (
                  <div className="space-y-2">
                    {formData.attributes.map((attr, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="Назва характеристики"
                          value={attr.name}
                          onChange={(e) =>
                            handleUpdateAttribute(i, 'name', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Значення"
                          value={attr.value}
                          onChange={(e) =>
                            handleUpdateAttribute(i, 'value', e.target.value)
                          }
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAttribute(i)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Link href="/mycabinet/shop">
                  <Button type="button" variant="outline">
                    Скасувати
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Створення...' : 'Створити товар'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </CabinetLayout>
  );
}
