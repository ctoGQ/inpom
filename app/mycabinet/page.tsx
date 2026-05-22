import { redirect } from 'next/navigation';
import React from 'react';
import { getSessionCustomer, logout } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { CardSliderWrapper } from '@/components/cabinet/card-slider-wrapper';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { sql } from '@/lib/db';

interface CardData {
  id: number;
  card_type: string;
  balance: number;
  customer_id: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
}

async function getUserCards(customerId: number): Promise<CardData[]> {
  try {
    const result = await sql`
      SELECT id, card_type, balance, customer_id FROM user_cards WHERE customer_id = ${customerId}
      ORDER BY created_at ASC
    `;
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching user cards:', error);
    return [];
  }
}

async function getRecentTransactionsByCard(cardId: number) {
  try {
    const result = await sql`
      SELECT id, type, amount, description, created_at, invoice_id
      FROM transactions
      WHERE card_id = ${cardId}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

async function handleLogout() {
  'use server';
  await logout();
  redirect('/');
}

export default async function MyCabinetPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const cards = await getUserCards(customer.id);

  if (cards.length === 0) {
    redirect('/auth/signin');
  }

  const firstCard = cards[0];
  const initialTransactions = await getRecentTransactionsByCard(firstCard.id);

  return (
    <CabinetLayout
      title="Карта"
      showAvatar={true}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
    >
      <div className="space-y-2xl pt-lg">
        {/* Card Slider */}
        <CardSliderWrapper
          cards={cards}
          customerId={customer.id}
          initialTransactions={initialTransactions}
          customerAvatar={customer.avatar_url || '/placeholder-user.jpg'}
          customerName={customer.name}
        />

        {/* Logout Button */}
        <form action={handleLogout} className="px-lg pb-lg">
          <button
            type="submit"
            className="w-full cabinet-button cabinet-button-destructive"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Вихід
          </button>
        </form>
      </div>
    </CabinetLayout>
  );
}
