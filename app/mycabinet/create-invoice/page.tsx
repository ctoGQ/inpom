import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { InvoiceForm } from '@/components/cabinet/invoice-form';
import { sql } from '@/lib/db';

interface PageProps {
  searchParams: { cardId?: string };
}

export default async function CreateInvoicePage({ searchParams }: PageProps) {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  console.log(`[CreateInvoicePage] Page loaded for customer:`, { id: customer.id, email: customer.email });

  // If cardId provided via query, use it; otherwise fall back to first card
  const queryCardId = searchParams?.cardId ? parseInt(searchParams.cardId, 10) : undefined;

  let cardIdToUse: number | undefined = undefined;

  if (queryCardId) {
    // Validate that this card belongs to the customer
    const validate = await sql`
      SELECT id FROM user_cards WHERE id = ${queryCardId} AND customer_id = ${customer.id} LIMIT 1
    `;
    if (validate.rows?.[0]) {
      cardIdToUse = validate.rows[0].id;
    }
  }

  if (!cardIdToUse) {
    const cardResult = await sql`
      SELECT id FROM user_cards WHERE customer_id = ${customer.id} LIMIT 1
    `;
    const card = cardResult.rows?.[0];
    if (!card) {
      redirect('/mycabinet');
    }
    cardIdToUse = card.id;
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
      <div className="pt-0 mt-0">
        <InvoiceForm customerId={customer.id} cardId={cardIdToUse!} />
      </div>
    </CabinetLayout>
  );
}
