import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { TransactionInvoiceTabs } from '@/components/cabinet/transaction-invoice-tabs';
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
  amount: number;
  description: string;
  status: string;
  created_at: string;
  expires_at: string;
}

async function getTransactions(customerId: number) {
  try {
    console.log(`[getTransactions] Starting query for customer ID: ${customerId}`);
    const result = await sql`
      SELECT id, type, amount, description, created_at, invoice_id
      FROM transactions
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    console.log(`[getTransactions] Query complete. Rows:`, result.rows?.length || 0);
    return result.rows || [];
  } catch (error) {
    console.error('[getTransactions] ❌ ERROR fetching transactions:', error);
    return [];
  }
}

async function getInvoices(customerId: number) {
  try {
    console.log(`[getInvoices] Starting query for customer ID: ${customerId}`);
    const result = await sql`
      SELECT id, creator_customer_id, amount, description, status, created_at, expires_at
      FROM invoices
      WHERE creator_customer_id = ${customerId}
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    console.log(`[getInvoices] Query complete. Rows:`, result.rows?.length || 0);
    return result.rows || [];
  } catch (error) {
    console.error('[getInvoices] ❌ ERROR fetching invoices:', error);
    return [];
  }
}

export default async function TransactionsPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const transactions = await getTransactions(customer.id);
  const invoices = await getInvoices(customer.id);
  
  console.log(`[TransactionsPage] Rendering with ${transactions.length} transactions and ${invoices.length} invoices`);

  return (
    <CabinetLayout
      title="Трансакції та Інвойси"
      showAvatar={true}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
    >
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Історія операцій
          </h1>
          <p className="text-sm text-gray-700">
            Ваші фінансові операції та інвойси
          </p>
        </div>

        <TransactionInvoiceTabs transactions={transactions} invoices={invoices} />
      </div>
    </CabinetLayout>
  );
}
