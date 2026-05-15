import { redirect } from 'next/navigation';
import { getSessionCustomer, logout } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { CabinetTabs } from '@/components/cabinet/cabinet-tabs';
import { CardDisplay } from '@/components/cabinet/card-display';
import { Button } from '@/components/ui/button';
import { Plus, QrCode, LogOut } from 'lucide-react';
import Link from 'next/link';
import { sql } from '@/lib/db';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
}

interface Invoice {
  id: number;
  creator_customer_id: number;
  amount: number | string;
  description: string;
  status: string;
  created_at: string;
  expires_at: string;
}

async function getUserCard(customerId: number) {
  try {
    const result = await sql`
      SELECT id, card_type, balance FROM user_cards WHERE customer_id = ${customerId}
    `;
    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error fetching user card:', error);
    return null;
  }
}

async function getRecentTransactions(customerId: number) {
  try {
    const result = await sql`
      SELECT id, type, amount, description, created_at, invoice_id
      FROM transactions
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

async function getRecentInvoices(customerId: number) {
  try {
    const result = await sql`
      SELECT id, creator_customer_id, amount, description, status, created_at, expires_at
      FROM invoices
      WHERE creator_customer_id = ${customerId}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
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

  const card = await getUserCard(customer.id);
  const transactions = await getRecentTransactions(customer.id);
  const invoices = await getRecentInvoices(customer.id);

  return (
    <CabinetLayout title="Карта">
      <div className="space-y-6 pt-6">
        {/* Card Section */}
        {card ? (
          <CardDisplay
            cardType={card.card_type}
            balance={card.balance}
            customerName={customer.name}
          />
        ) : (
          <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Карта не знайдена
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/mycabinet/deposit" className="flex-1">
            <Button
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Депозит
            </Button>
          </Link>
          <Link href="/mycabinet/create-invoice" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-foreground/20 hover:bg-foreground/5 rounded-lg"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Invoice
            </Button>
          </Link>
        </div>

        {/* Transactions and Invoices Tabs */}
        <CabinetTabs transactions={transactions} invoices={invoices} />

        {/* Logout Button */}
        <form action={handleLogout} className="pt-6 pb-6">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Вихід
          </button>
        </form>
      </div>
    </CabinetLayout>
  );
}
