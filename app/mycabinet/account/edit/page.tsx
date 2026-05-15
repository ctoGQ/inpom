'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { getSessionCustomer } from '@/lib/auth';

interface Customer {
  id: number;
  name: string;
  email: string;
}

export default function EditAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          setCustomer(data.customer);
          setFormData({
            name: data.customer.name,
            email: data.customer.email,
          });
        } else {
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Error loading customer:', error);
        toast({
          title: 'Помилка',
          description: 'Не вдалось завантажити дані профілю',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Помилка',
        description: 'Ім\'я не можна залишати порожнім',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Успіх',
          description: 'Профіль оновлено',
        });
        setTimeout(() => {
          router.push('/mycabinet/account');
        }, 1000);
      } else {
        const error = await response.json();
        toast({
          title: 'Помилка',
          description: error.error || 'Не вдалось оновити профіль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при оновленні профілю',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CabinetLayout title="Редагувати профіль" showBack>
        <div className="space-y-6 pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Завантаження...</p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  return (
    <CabinetLayout
      title="Редагувати профіль"
      showBack
      showAvatar={false}
    >
      <div className="space-y-6 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              ІМ'Я
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ваше ім'я"
              disabled={saving}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              EMAIL
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={true}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Email не можна змінити
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Збереження...' : 'Зберегти'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={saving}
            >
              Скасувати
            </Button>
          </div>
        </form>
      </div>
    </CabinetLayout>
  );
}
