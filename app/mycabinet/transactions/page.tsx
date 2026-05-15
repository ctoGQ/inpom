import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { sql } from '@/lib/db';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

async function getTransactions(customerId: number) {
  try {
    const result = await sql`
      SELECT id, type, amount, description, created_at
      FROM transactions
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export default async function TransactionsPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const transactions = await getTransactions(customer.id);

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
            {transactions.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-foreground/5 border border-foreground/10 rounded-lg"
              >
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
                    {transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">inpom</p>
                </div>
              </div>
            ))}
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
