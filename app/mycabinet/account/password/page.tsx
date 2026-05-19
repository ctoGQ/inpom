'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      toast({
        title: 'Помилка',
        description: 'Введіть поточний пароль',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.newPassword) {
      toast({
        title: 'Помилка',
        description: 'Введіть новий пароль',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: 'Помилка',
        description: 'Новий пароль повинен містити мінімум 6 символів',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Помилка',
        description: 'Паролі не збігаються',
        variant: 'destructive',
      });
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast({
        title: 'Помилка',
        description: 'Новий пароль не може бути таким же, як поточний',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успіх',
          description: 'Пароль успішно змінено',
        });
        setTimeout(() => {
          router.push('/mycabinet/account');
        }, 1000);
      } else {
        const error = await response.json();
        toast({
          title: 'Помилка',
          description: error.error || 'Не вдалось змінити пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при зміні пароля',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    name,
    fieldKey,
    value,
    placeholder,
  }: {
    label: string;
    name: string;
    fieldKey: 'current' | 'new' | 'confirm';
    value: string;
    placeholder: string;
  }) => (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-2 block">
        {label}
      </label>
      <div className="relative">
        <Input
          type={showPasswords[fieldKey] ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={loading}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(fieldKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          disabled={loading}
        >
          {showPasswords[fieldKey] ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <CabinetLayout title="Змінити пароль" showBack showAvatar={false}>
      <div className="space-y-6 pt-6">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-600">
            Використовуйте надійний пароль з комбінацією букв, цифр та символів.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="ПОТОЧНИЙ ПАРОЛЬ"
            name="currentPassword"
            fieldKey="current"
            value={formData.currentPassword}
            placeholder="Введіть поточний пароль"
          />

          <PasswordInput
            label="НОВИЙ ПАРОЛЬ"
            name="newPassword"
            fieldKey="new"
            value={formData.newPassword}
            placeholder="Введіть новий пароль"
          />

          <PasswordInput
            label="ПІДТВЕРДЬТЕ НОВИЙ ПАРОЛЬ"
            name="confirmPassword"
            fieldKey="confirm"
            value={formData.confirmPassword}
            placeholder="Повторіть новий пароль"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Обробка...' : 'Змінити пароль'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={loading}
            >
              Скасувати
            </Button>
          </div>
        </form>
      </div>
    </CabinetLayout>
  );
}
