import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { ActivitySection } from '@/components/cabinet/activity-section';
import { sql } from '@/lib/db';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
  other_customer_id?: number;
  other_customer_name?: string;
  other_customer_avatar?: string;
}

async function getTransactions(customerId: number) {
  try {
    console.log(`[getTransactions] Starting query for customer ID: ${customerId}`);
    const result = await sql`
      SELECT 
        t.id, 
        t.type, 
        t.amount, 
        t.description, 
        t.created_at, 
        t.invoice_id,
        CASE 
          WHEN t.type = 'payment_sent' THEN i.creator_customer_id
          WHEN t.type = 'payment_received' THEN (
            SELECT customer_id FROM transactions t2 
            WHERE t2.invoice_id = t.invoice_id 
            AND t2.type = 'payment_sent' 
            LIMIT 1
          )
          ELSE NULL
        END as other_customer_id
      FROM transactions t
      LEFT JOIN invoices i ON t.invoice_id = i.id
      WHERE t.customer_id = ${customerId}
      ORDER BY t.created_at DESC
      LIMIT 100
    `;
    
    console.log(`[getTransactions] Query complete. Rows:`, result.rows?.length || 0);
    
    // Post-process to get other customer details
    const enriched = await Promise.all(
      (result.rows || []).map(async (transaction: any) => {
        if (transaction.other_customer_id) {
          try {
            const customerResult = await sql`
              SELECT name, avatar FROM customers WHERE id = ${transaction.other_customer_id}
            `;
            const customer = customerResult.rows?.[0];
            return {
              ...transaction,
              other_customer_name: customer?.name || 'Unknown',
              other_customer_avatar: customer?.avatar || null,
            };
          } catch (error) {
            console.error('[getTransactions] Error fetching other customer:', error);
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
    console.error('[getTransactions] ❌ ERROR fetching transactions:', error);
    return [];
  }
}

export default async function TransactionsPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const transactions = await getTransactions(customer.id);
  
  console.log(`[TransactionsPage] Rendering with ${transactions.length} transactions`);

  return (
    <CabinetLayout
      title="Трансакції"
      showAvatar={true}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
      showNav={true}
    >
      <div className="space-y-2xl pt-lg">
        <div>
          <h1 className="text-h1 mb-sm">
            Історія операцій
          </h1>
          <p className="text-body text-secondary">
            Ваші фінансові операції
          </p>
        </div>

        <ActivitySection transactions={transactions} />
      </div>
    </CabinetLayout>
  );
}
