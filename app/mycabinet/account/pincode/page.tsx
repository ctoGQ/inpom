'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function PincodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [mode, setMode] = useState<'set' | 'change'>('set');
  const [formData, setFormData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow digits
    if (/^\d*$/.test(value) || value === '') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.slice(0, 6), // Max 6 digits
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'change' && !formData.currentPin) {
      toast({
        title: 'Помилка',
        description: 'Введіть поточний PIN-код',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.newPin) {
      toast({
        title: 'Помилка',
        description: 'Введіть новий PIN-код',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPin.length !== 6) {
      toast({
        title: 'Помилка',
        description: 'PIN-код повинен містити 6 цифр',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPin !== formData.confirmPin) {
      toast({
        title: 'Помилка',
        description: 'PIN-коди не збігаються',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/pincode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: formData.currentPin || null,
          newPin: formData.newPin,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успіх',
          description: mode === 'set' ? 'PIN-код встановлено' : 'PIN-код змінено',
        });
        setTimeout(() => {
          router.push('/mycabinet/account');
        }, 1000);
      } else {
        const error = await response.json();
        toast({
          title: 'Помилка',
          description: error.error || 'Не вдалось встановити PIN-код',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error setting pincode:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при встановленні PIN-коду',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const PinInput = ({
    label,
    name,
    value,
    placeholder,
  }: {
    label: string;
    name: string;
    value: string;
    placeholder: string;
  }) => (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-2 block">
        {label}
      </label>
      <Input
        type="password"
        inputMode="numeric"
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={loading}
        maxLength={6}
        className="text-center text-lg tracking-widest font-mono"
      />
      <p className="text-xs text-muted-foreground mt-1">
        {value.length}/6 цифр
      </p>
    </div>
  );

  return (
    <CabinetLayout 
      title="PIN-код"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="space-y-6 pt-6">
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-600">
            PIN-код використовується для додаткової безпеки при критичних операціях. Використовуйте 6 цифр.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'change' && (
            <PinInput
              label="ПОТОЧНИЙ PIN-КОД"
              name="currentPin"
              value={formData.currentPin}
              placeholder="••••••"
            />
          )}

          <PinInput
            label={mode === 'set' ? 'НОВИЙ PIN-КОД' : 'НОВИЙ PIN-КОД'}
            name="newPin"
            value={formData.newPin}
            placeholder="••••••"
          />

          <PinInput
            label="ПІДТВЕРДЬТЕ PIN-КОД"
            name="confirmPin"
            value={formData.confirmPin}
            placeholder="••••••"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Обробка...' : 'Зберегти PIN-код'}
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
