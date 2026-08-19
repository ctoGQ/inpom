// app/auth/onboarding/page.tsx
// Onboarding questionnaire page shown after successful registration/signin

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSessionCustomer } from '@/lib/auth';
import { OnboardingQuestionnaire } from '@/components/cabinet/onboarding-questionnaire';

export default function OnboardingPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const customer = await getSessionCustomer();
      
      if (!customer) {
        router.push('/auth/signin');
        return;
      }
      
      setCustomer(customer);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  const handleComplete = () => {
    router.push('/mycabinet');
  };

  const handleSkip = () => {
    router.push('/mycabinet');
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:py-12"><div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-primary/10" />
        <p className="text-gray-600 text-lg font-medium">Завантаження...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:py-12"><div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-primary/10" />
      <div className="w-full max-w-2xl">
        <OnboardingQuestionnaire
          customerId={customer.id}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
