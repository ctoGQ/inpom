import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { InvoiceForm } from '@/components/cabinet/invoice-form';

export default async function CreateInvoicePage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  console.log(`[CreateInvoicePage] Page loaded for customer:`, { id: customer.id, email: customer.email });

  return (
    <CabinetLayout title="Invoice" showBack>
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-display text-slate-900 mb-2">
            Створити інвойс
          </h1>
          <p className="text-sm text-muted-foreground">
            Інші користувачі зможуть відсканувати QR-код та оплатити
          </p>
        </div>

        <InvoiceForm customerId={customer.id} />
      </div>
    </CabinetLayout>
  );
}
