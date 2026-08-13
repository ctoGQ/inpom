import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { DepositForm } from '@/components/cabinet/deposit-form';

interface PageProps {
  searchParams: { cardId?: string };
}

export default async function DepositPage({ searchParams }: PageProps) {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const cardId = searchParams?.cardId ? parseInt(searchParams.cardId, 10) : undefined;

  return (
    <CabinetLayout 
      title="Депозит"
      showBack={true}
      showAvatar={true}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
      showNav={true}
    >
      <div className="space-y-2xl pt-lg">
        <DepositForm customerId={customer.id} cardId={cardId} />
      </div>
    </CabinetLayout>
  );
}
