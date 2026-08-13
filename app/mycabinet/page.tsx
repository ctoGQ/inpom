import { redirect } from 'next/navigation';
import React from 'react';
import { getSessionCustomer, logout } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { CardSliderWrapper } from '@/components/cabinet/card-slider-wrapper';
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
      SELECT 
        t.id, 
        t.type, 
        t.amount, 
        t.description, 
        t.created_at, 
        t.invoice_id,
        t.customer_id,
        CASE 
          WHEN t.type = 'payment_sent' THEN i.creator_customer_id
          WHEN t.type = 'payment_received' THEN (
            SELECT customer_id FROM transactions t2 
            WHERE t2.invoice_id = t.invoice_id 
            AND t2.type = 'payment_sent' 
            LIMIT 1
          )
          WHEN t.type = 'deposit' THEN NULL
          ELSE NULL
        END as other_customer_id
      FROM transactions t
      LEFT JOIN invoices i ON t.invoice_id = i.id
      WHERE t.card_id = ${cardId}
      ORDER BY t.created_at DESC
      LIMIT 20
    `;
    
    console.log('[getRecentTransactionsByCard] Query result rows:', result.rows?.length);
    
    // Post-process to get other customer details
    const enriched = await Promise.all(
      (result.rows || []).map(async (transaction: any) => {
        if (transaction.type === 'deposit') {
          return {
            ...transaction,
            other_customer_name: 'Депозит',
            other_customer_avatar: null,
          };
        }

        if (transaction.type === 'withdraw') {
          return {
            ...transaction,
            other_customer_name: 'Вивід',
            other_customer_avatar: null,
          };
        }
        
        if (transaction.other_customer_id) {
          try {
            const customerResult = await sql`
              SELECT name, avatar_url as avatar FROM customers WHERE id = ${transaction.other_customer_id}
            `;
            const customer = customerResult.rows?.[0];
            console.log(`[getRecentTransactionsByCard] Customer ${transaction.other_customer_id}:`, customer?.name);
            return {
              ...transaction,
              other_customer_name: customer?.name || 'Unknown',
              other_customer_avatar: customer?.avatar || null,
            };
          } catch (error) {
            console.error('[getRecentTransactionsByCard] Error fetching customer:', error);
            return {
              ...transaction,
              other_customer_name: 'Unknown',
              other_customer_avatar: null,
            };
          }
        }
        
        return {
          ...transaction,
          other_customer_name: 'Unknown',
          other_customer_avatar: null,
        };
      })
    );
    
    return enriched;
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
      showHeader={false}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
    >
      <div className="space-y-2xl pt-0 mt-0">
        {/* Card Slider */}
        <CardSliderWrapper
          cards={cards}
          customerId={customer.id}
          initialTransactions={initialTransactions}
          customerAvatar={customer.avatar_url || '/placeholder-user.jpg'}
          customerName={customer.name}
        />


      </div>
    </CabinetLayout>
  );
}
