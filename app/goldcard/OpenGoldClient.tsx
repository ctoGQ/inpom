'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function OpenGoldClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const openGold = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardType: 'gold' }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push('/auth/signup');
        return;
      }
      if (!res.ok) throw new Error(data?.error || data?.detail || 'Failed to create card');
      toast({ title: 'Успіх', description: 'Gold картка додана до вашого кабінету' });
      router.push('/mycabinet');
    } catch (err: any) {
      console.error('OpenGold error:', err);
      toast({ title: 'Помилка', description: err?.message || 'Не вдалось додати картку', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={openGold} disabled={loading} className="py-3 px-6 bg-amber-400 text-foreground font-medium rounded-lg">
      {loading ? 'Відкривається...' : 'Відкрити Gold'}
    </button>
  );
}
