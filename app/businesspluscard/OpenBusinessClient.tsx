'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function OpenBusinessClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const openBusiness = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardType: 'business' }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push('/auth/signup');
        return;
      }
      if (!res.ok) throw new Error(data?.error || data?.detail || 'Failed to create card');
      toast({ title: 'Успіх', description: 'Business Plus картка додана до вашого кабінету' });
      router.push('/mycabinet');
    } catch (err: any) {
      console.error('OpenBusiness error:', err);
      toast({ title: 'Помилка', description: err?.message || 'Не вдалось додати картку', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={openBusiness} disabled={loading} className="py-3 px-6 border border-foreground/20 rounded-lg">
      {loading ? 'Відкривається...' : 'Зв\'язатися для Business Plus'}
    </button>
  );
}
