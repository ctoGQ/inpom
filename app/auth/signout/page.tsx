'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleSignOut() {
      try {
        const response = await fetch('/api/auth/signout', {
          method: 'POST',
        });

        if (response.ok) {
          router.push('/');
        }
      } catch (error) {
        console.error('Sign out error:', error);
        router.push('/');
      }
    }

    handleSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Вихід...</h1>
        <p className="text-muted-foreground">Будь ласка, почекайте</p>
      </div>
    </div>
  );
}
