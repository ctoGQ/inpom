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
        <div className="space-y-2xl pt-lg">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-slate-900 font-semibold text-center">
              Карту не вибрано
            </p>
            <p className="text-sm text-gray-600 text-center mt-2">
              Виберіть карту зі слайдера на головній сторінці
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  const card = await getCardDetails(cardId, customer.id);

  if (!card) {
    return (
      <CabinetLayout title="Вивід коштів" showBack>
        <div className="space-y-2xl pt-lg">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-slate-900 font-semibold text-center">
              Карта не знайдена
            </p>
            <p className="text-sm text-gray-600 text-center mt-2">
              Вибрана карта більше недоступна
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  return (
    <CabinetLayout title="Вивід коштів" showBack>
      <div className="space-y-2xl pt-lg">
        {/* Card Info */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Карта вибору</p>
              <p className="font-semibold text-slate-900">{card.card_type}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Доступний баланс</p>
            <p className="text-2xl font-bold text-slate-900">
              {parseFloat(card.balance).toFixed(2)} inpom
            </p>
          </div>
        </div>

        {/* Withdrawal Form */}
        <WithdrawForm 
          cardId={card.id}
          customerId={customer.id}
          availableBalance={parseFloat(card.balance)}
        />
      </div>
    </CabinetLayout>
  );
}
