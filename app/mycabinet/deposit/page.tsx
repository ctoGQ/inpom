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
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Поповнити баланс
          </h1>
          <p className="text-sm text-gray-700">
            Виберіть суму для поповнення карти
          </p>
        </div>

        <DepositForm customerId={customer.id} />
      </div>
    </CabinetLayout>
  );
}
