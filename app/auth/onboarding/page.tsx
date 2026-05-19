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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <p className="text-gray-600 text-lg font-medium">Завантаження...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
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
