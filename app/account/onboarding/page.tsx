// app/account/onboarding/page.tsx
// Mobile-first onboarding questionnaire page
// Shows after user registration/signin

import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { OnboardingSlider } from '@/components/onboarding/onboarding-slider';
import { sql } from '@/lib/db';

export const metadata = {
  title: 'Розпочніть з нами | inpom Парламент Жінок',
  description: 'Заповніть анкету та вступіть до спільноти'
};

async function checkOnboardingStatus(customerId: number) {
  try {
    const result = await sql`
      SELECT completed_at FROM customer_onboarding_responses 
      WHERE customer_id = ${customerId} AND completed_at IS NOT NULL
      LIMIT 1
    `;

    return result.rows && result.rows.length > 0;
  } catch (error) {
    console.error('[OnboardingPage] Error checking status:', error);
    return false;
  }
}

export default async function OnboardingPage() {
  // Verify user is authenticated
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  console.log(`[OnboardingPage] Customer ${customer.id} accessing onboarding`);

  // Optional: Check if already completed, allow redo by commenting this out
  // const isCompleted = await checkOnboardingStatus(customer.id);
  // if (isCompleted) {
  //   console.log(`[OnboardingPage] Customer ${customer.id} already completed onboarding`);
  //   redirect('/mycabinet');
  // }

  return (
    <div className="fixed inset-0 bg-background">
      <OnboardingSlider
        customerId={customer.id}
        onComplete={() => {
          // This will redirect from the success screen
          console.log(
            `[OnboardingPage] Customer ${customer.id} completed onboarding`
          );
        }}
      />
    </div>
  );
}
