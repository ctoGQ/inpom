import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { sql } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';

interface TransactionDetail {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
}

interface PageProps {
  params: {
    id: string;
  };
}

async function getTransaction(transactionId: number, customerId: number) {
  try {
    console.log(`Fetching transaction ${transactionId} for customer ${customerId}`);
    const result = await sql`
      SELECT id, type, amount, description, created_at, invoice_id
      FROM transactions
      WHERE id = ${transactionId} AND customer_id = ${customerId}
    `;
    
    if (!result.rows?.length) {
      console.warn(`Transaction ${transactionId} not found for customer ${customerId}`);
      return null;
    }
    
    console.log(`Found transaction:`, result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

async function getInvoiceDetails(invoiceId: number) {
  try {
    const result = await sql`
      SELECT 
        i.id,
        i.creator_customer_id,
        i.amount,
        i.description,
        i.status,
        i.created_at,
        i.expires_at,
        c.name as creator_name
      FROM invoices i
      JOIN customers c ON i.creator_customer_id = c.id
      WHERE i.id = ${invoiceId}
    `;
    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const transactionId = parseInt(params.id);
  
  if (isNaN(transactionId)) {
    return (
      <CabinetLayout title="Деталі транзакції" showBack>
        <div className="space-y-6 pt-6">
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Некоректний ID транзакції
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  const transaction = await getTransaction(transactionId, customer.id);

  if (!transaction) {
    return (
      <CabinetLayout title="Деталі транзакції" showBack>
        <div className="space-y-6 pt-6">
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Транзакція не знайдена
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  let invoice = null;
  if (transaction.invoice_id) {
    invoice = await getInvoiceDetails(transaction.invoice_id);
  }

  const isIncoming = 
    transaction.type.includes('deposit') || 
    transaction.type.includes('payment_received');

  const formatTransactionType = (type: string) => {
    const typeMap: { [key: string]: { label: string; icon: string } } = {
      'deposit': { label: 'Депозит', icon: '💰' },
      'payment_sent': { label: 'Відправлено', icon: '📤' },
      'payment_received': { label: 'Отримано', icon: '📥' },
      'withdrawal': { label: 'Виведення', icon: '🔄' },
    };
    return typeMap[type] || { label: type.replace(/_/g, ' '), icon: '💵' };
  };

  const typeInfo = formatTransactionType(transaction.type);

  return (
    <CabinetLayout title="Деталі транзакції" showBack>
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-2">
            Деталі транзакції
          </h1>
          <p className="text-sm text-muted-foreground">
            Інформація про вашу операцію
          </p>
        </div>

        {/* Transaction Status */}
        <div className="p-6 bg-foreground/5 border border-foreground/10 rounded-lg">
          <div className="text-center space-y-4">
            <div className="text-4xl">{typeInfo.icon}</div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                ТИП ОПЕРАЦІЇ
              </p>
              <p className="text-lg font-medium text-foreground">
                {typeInfo.label}
              </p>
            </div>

            <div className="pt-6 border-t border-foreground/10">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                СУМА
              </p>
              <p
                className={`text-4xl font-display ${
                  isIncoming ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {isIncoming ? '+' : '-'}
                {typeof transaction.amount === 'number'
                  ? transaction.amount.toFixed(2)
                  : '0.00'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">inpom</p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-4">
          {transaction.description && (
            <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                ОПИС
              </p>
              <p className="text-sm text-foreground">
                {transaction.description}
              </p>
            </div>
          )}

          <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              ДАТА І ЧАС
            </p>
            <p className="text-sm text-foreground">
              {new Date(transaction.created_at).toLocaleDateString('uk-UA')}{' '}
              о{' '}
              {new Date(transaction.created_at).toLocaleTimeString('uk-UA')}
            </p>
          </div>

          <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              ID ТРАНЗАКЦІЇ
            </p>
            <p className="text-sm font-mono text-foreground">
              #{transaction.id}
            </p>
          </div>
        </div>

        {/* Invoice Details if exists */}
        {invoice && (
          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm font-medium text-green-600">
                Пов'язаний інвойс
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  СТАТУС
                </p>
                <p className="text-sm text-foreground capitalize">
                  {invoice.status === 'paid' ? '✓ Оплачено' : '⏳ Очікує'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  СУМА ІНВОЙСА
                </p>
                <p className="text-sm text-foreground">
                  {typeof invoice.amount === 'number'
                    ? invoice.amount.toFixed(2)
                    : '0.00'}{' '}
                  inpom
                </p>
              </div>

              {invoice.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    ОПИС
                  </p>
                  <p className="text-sm text-foreground">
                    {invoice.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  АВТОР
                </p>
                <p className="text-sm text-foreground">
                  {invoice.creator_name}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Link
                  href={
                    transaction.type === 'payment_sent'
                      ? `/mycabinet/pay-invoice/${invoice.id}`
                      : `/mycabinet/invoices/${invoice.id}`
                  }
                >
                  <Button className="w-full" variant="outline">
                    {transaction.type === 'payment_sent'
                      ? 'Переглянути статус оплати'
                      : 'Переглянути інвойс'}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Всі транзакції записуються в історії вашого рахунку та можуть бути
            переглянуті будь-коли. Якщо у вас є запитання, будь ласка,
            зв'яжіться з нами.
          </p>
        </div>

        {/* Back Button */}
        <Link href="/mycabinet/transactions">
          <Button variant="outline" className="w-full">
            Повернутись до історії
          </Button>
        </Link>
      </div>
    </CabinetLayout>
  );
}
