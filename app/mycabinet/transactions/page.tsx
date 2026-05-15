import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { sql } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
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
    
    console.log(`[getTransactions] Query complete. Result object:`, result);
    console.log(`[getTransactions] Result.rows:`, result.rows);
    console.log(`[getTransactions] Number of rows:`, result.rows?.length || 0);
    
    if (result.rows && result.rows.length > 0) {
      console.log(`[getTransactions] First row object keys:`, Object.keys(result.rows[0]));
      console.log(`[getTransactions] First row full object:`, result.rows[0]);
      console.log(`[getTransactions] First row ID specifically:`, result.rows[0].id, `(type: ${typeof result.rows[0].id})`);
    }
    
    return result.rows || [];
  } catch (error) {
    console.error('[getTransactions] ❌ ERROR fetching transactions:', error);
    return [];
  }
}

function getInvoiceLink(transaction: Transaction): string | null {
  if (!transaction.invoice_id) return null;

  // payment_sent = пользователь платил, может видеть статус оплаты
  // payment_received = пользователь получал, может видеть инвойс
  if (transaction.type === 'payment_sent') {
    return `/mycabinet/pay-invoice/${transaction.invoice_id}`;
  } else if (transaction.type === 'payment_received') {
    return `/mycabinet/invoices/${transaction.invoice_id}`;
  }

  return null;
}

export default async function TransactionsPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const transactions = await getTransactions(customer.id);
  
  console.log(`[TransactionsPage] Rendering page with ${transactions.length} transactions`);
  console.log(`[TransactionsPage] Customer ID: ${customer.id}`);
  if (transactions.length > 0) {
    console.log(`[TransactionsPage] First transaction:`, JSON.stringify(transactions[0]));
    console.log(`[TransactionsPage] First transaction ID value:`, transactions[0].id, `(type: ${typeof transactions[0].id})`);
  }

  return (
    <CabinetLayout title="Трансакції">
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-2">
            Історія транзакцій
          </h1>
          <p className="text-sm text-muted-foreground">
            Всі ваші фінансові операції
          </p>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction: Transaction) => {
              const numId = Number(transaction.id);
              const hasValidId = !isNaN(numId) && transaction.id !== undefined && transaction.id !== null;
              
              if (!hasValidId) {
                console.warn(`[TransactionsPage] ⚠️ Transaction has invalid ID:`, transaction);
                return null;
              }
              
              return (
              <Link
                key={transaction.id}
                href={`/mycabinet/transactions/${numId}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center justify-between p-4 bg-foreground/5 border border-foreground/10 rounded-lg hover:bg-foreground/10 hover:border-foreground/20 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground capitalize">
                      {transaction.type.replace(/_/g, ' ')}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(transaction.created_at).toLocaleDateString('uk-UA')} в{' '}
                      {new Date(transaction.created_at).toLocaleTimeString('uk-UA')}
                    </p>
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          transaction.type.includes('deposit') ||
                          transaction.type.includes('payment_received')
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {transaction.type.includes('deposit') ||
                        transaction.type.includes('payment_received')
                          ? '+'
                          : '-'}
                        {typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : '0.00'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">inpom</p>
                    </div>
                    {transaction.invoice_id && getInvoiceLink(transaction) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        title={
                          transaction.type === 'payment_sent'
                            ? 'Переглянути статус оплати'
                            : 'Переглянути інвойс'
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = getInvoiceLink(transaction) || '';
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Жодних транзакцій досі
            </p>
          </div>
        )}
      </div>
    </CabinetLayout>
  );
}
