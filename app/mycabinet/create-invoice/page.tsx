import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { InvoiceForm } from '@/components/cabinet/invoice-form';
import { sql } from '@/lib/db';

export default async function CreateInvoicePage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  console.log(`[CreateInvoicePage] Page loaded for customer:`, { id: customer.id, email: customer.email });

  // Get first card (should exist from registration)
  const cardResult = await sql`
    SELECT id FROM user_cards WHERE customer_id = ${customer.id} LIMIT 1
  `;

  const card = cardResult.rows?.[0];

  if (!card) {
    redirect('/mycabinet');
  }

  return (
    <CabinetLayout 
      title="Інвойс"
      showBack={true}
      showAvatar={true}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
      showNav={true}
    >
      <div className="space-y-2xl pt-lg">
        <div>
          <h1 className="text-h1 mb-sm">
            Створити інвойс
          </h1>
          <p className="text-body text-secondary">
            Інші користувачи зможуть відсканувати QR-код та оплатити
          </p>
        </div>

        <InvoiceForm customerId={customer.id} cardId={card.id} />
      </div>
    </CabinetLayout>
  );
}
