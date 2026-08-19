'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { signIn } from '@/app/api/auth/actions';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      router.push('/mycabinet');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-2xl font-display text-foreground">INPOM</span>
            <span className="text-xs text-muted-foreground font-mono">TM</span>
          </Link>
          <h1 className="text-4xl font-display text-foreground mb-3">
            Вхід
          </h1>
          <p className="text-muted-foreground">
            Увійдіть до свого особистого кабінету
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Пароль
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground hover:bg-foreground/90 text-background h-12 rounded-lg font-medium"
          >
            {loading ? 'Завантаження...' : 'Увійти'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Немаєте акаунту?{' '}
            <Link href="/auth/signup" className="text-foreground hover:underline font-medium">
              Зареєструватися
            </Link>
          </p>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-foreground/10">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
            ← Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
