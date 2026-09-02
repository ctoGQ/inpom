import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { AlertCircle, ArrowDown } from 'lucide-react';
import { sql } from '@/lib/db';
import { WithdrawForm } from '@/components/cabinet/withdraw-form';

interface PageProps {
  searchParams: Promise<{
    cardId?: string;
  }>;
}

async function getCardDetails(cardId: number, customerId: number) {
  try {
    const result = await sql`
      SELECT 
        id,
        card_type,
        balance,
        customer_id
      FROM user_cards
      WHERE id = ${cardId} AND customer_id = ${customerId}
    `;
    
    if (result.rows?.length) {
      return result.rows[0];
    }
    return null;
  } catch (error) {
    console.error('[WithdrawPage] Error fetching card:', error);
    return null;
  }
}

export default async function WithdrawPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const cardId = resolvedParams.cardId ? parseInt(resolvedParams.cardId, 10) : null;
  
  if (!cardId || isNaN(cardId)) {
    return (
      <CabinetLayout title="Вивід коштів" showBack>
        <div className="px-4 pt-6 pb-24 flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <p className="text-foreground font-semibold text-center">
            Карту не вибрано
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Виберіть карту зі слайдера на головній сторінці
          </p>
        </div>
      </CabinetLayout>
    );
  }

  const card = await getCardDetails(cardId, customer.id);

  if (!card) {
    return (
      <CabinetLayout title="Вивід коштів" showBack>
        <div className="px-4 pt-6 pb-24 flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <p className="text-foreground font-semibold text-center">
            Карта не знайдена
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Вибрана карта більше недоступна
          </p>
        </div>
      </CabinetLayout>
    );
  }

  return (
    <CabinetLayout title="Вивід коштів" showBack>
      <div className="pt-0 mt-0">
        {/* Card Info */}
        <div className="px-4 pt-6 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className="p-2 rounded-lg bg-muted">
              <ArrowDown className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Карта вибору</p>
              <p className="font-semibold text-foreground">{card.card_type}</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Доступний баланс</p>
            <p className="text-3xl font-bold text-foreground">{typeof card.balance === 'string' ? parseFloat(card.balance).toFixed(2) : Number(card.balance).toFixed(2)}</p>
          </div>
        </div>

        {/* Withdrawal Form */}
        <WithdrawForm
          cardId={card.id}
          customerId={customer.id}
          availableBalance={typeof card.balance === 'string' ? parseFloat(card.balance) : card.balance}
        />
      </div>
    </CabinetLayout>
  );
}
