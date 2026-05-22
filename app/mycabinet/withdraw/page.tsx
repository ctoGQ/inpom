import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { WithdrawForm } from '@/components/cabinet/withdraw-form';
import { sql } from '@/lib/db';

interface CardData {
  id: number;
  card_type: string;
  balance: number;
}

async function getUserCards(customerId: number): Promise<CardData[]> {
  try {
    const result = await sql`
      SELECT id, card_type, balance FROM user_cards 
      WHERE customer_id = ${customerId}
      ORDER BY created_at ASC
    `;
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching user cards:', error);
    return [];
  }
}

export default async function WithdrawPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const cards = await getUserCards(customer.id);

  if (!cards.length) {
    return (
      <CabinetLayout 
        title="Вивід"
        showBack={true}
        showAvatar={true}
        avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
        userName={customer.name}
        showNav={true}
      >
        <div className="px-4 pt-6 pb-24">
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-foreground font-semibold text-center">
              У вас немає активних карт для вивода
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Спочатку додайте карту на сторінці профілю
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  // Get the first card (user can select another if needed)
  const selectedCard = cards[0];

  return (
    <CabinetLayout 
      title="Вивід"
      showBack={true}
      showAvatar={true}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
      showNav={true}
    >
      <WithdrawForm 
        customerId={customer.id} 
        cardId={selectedCard.id}
        cardBalance={selectedCard.balance}
      />
    </CabinetLayout>
  );
}
