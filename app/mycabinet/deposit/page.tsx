import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { DepositForm } from '@/components/cabinet/deposit-form';

export default async function DepositPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  return (
    <CabinetLayout title="Депозит" showBack>
      <div className="space-y-2xl pt-lg">
        <div>
          <h1 className="text-h1 mb-sm">
            Поповнити баланс
          </h1>
          <p className="text-body text-secondary">
            Виберіть суму для поповнення карти
          </p>
        </div>

        <DepositForm customerId={customer.id} />
      </div>
    </CabinetLayout>
  );
}
