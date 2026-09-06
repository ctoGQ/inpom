import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { DashboardScreen } from '@/components/cabinet/dashboard-screen';

export default async function DashboardPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  return (
    <DashboardScreen
      userName={customer.name || 'учаснице'}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
    />
  );
}
