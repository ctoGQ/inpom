// app/auth/onboarding/page.tsx
// Onboarding questionnaire page shown after successful registration/signin

import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { OnboardingQuestionnaire } from '@/components/cabinet/onboarding-questionnaire';

export const metadata = {
  title: 'Розпочніть з нами | inpom',
  description: 'Допоможіть нам краще вас зрозуміти'
};

export default async function OnboardingPage() {
  // Verify user is authenticated
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  // Check if user already completed onboarding
  // (Optional - can allow users to redo questionnaire)
  // if (customer.onboarding_completed) {
  //   redirect('/mycabinet');
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full">
        <OnboardingQuestionnaire
          customerId={customer.id}
          onComplete={() => {
            // Redirect to mycabinet after completing
            redirect('/mycabinet');
          }}
          onSkip={() => {
            // Skip to mycabinet
            redirect('/mycabinet');
          }}
        />
      </div>
    </div>
  );
}
