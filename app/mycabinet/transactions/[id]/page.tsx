import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { sql } from '@/lib/db';
import { formatAmountWithSign, formatAmount } from '@/lib/format-amount';
import Link from 'next/link';
import { AlertCircle, ArrowDown, ArrowUp, ExternalLink, Banknote } from 'lucide-react';
import Image from 'next/image';
import { User } from 'lucide-react';

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
    const result = await sql`
      SELECT id, type, amount, description, created_at, invoice_id
      FROM transactions
      WHERE id = ${transactionId} AND customer_id = ${customerId}
    `;
    
    if (!result.rows?.length) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('[getTransaction] Error fetching transaction:', error);
    return null;
  }
}

const formatDateTime = (dateString: string): { date: string; time: string } => {
  try {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: dateString, time: '' };
  }
};

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

const getTransactionIcon = (type: string) => {
  if (type.includes('deposit') || type.includes('payment_received')) {
    return <ArrowDown className="w-8 h-8" />;
  } else if (type.includes('withdraw') || type.includes('payment_sent')) {
    return <ArrowUp className="w-8 h-8" />;
  }
  return <Banknote className="w-8 h-8" />;
};

const getTransactionTitle = (type: string): string => {
  const titles: Record<string, string> = {
    deposit: 'Депозит',
    payment_received: 'Отримано',
    payment_sent: 'Оплачено',
    invoice: 'Інвойс',
    withdraw: 'Вивід',
  };
  
  for (const [key, title] of Object.entries(titles)) {
    if (type.includes(key)) return title;
  }
  return type.replace(/_/g, ' ');
};

export default async function TransactionDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const rawId = resolvedParams.id;
  const transactionId = parseInt(rawId, 10);
  
  if (isNaN(transactionId)) {
    return (
      <CabinetLayout 
        title="Деталі"
        showBack={true}
        showAvatar={true}
        showNav={true}
      >
        <div className="px-4 pt-6 pb-16">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <p className="text-foreground font-semibold text-center">Некоректний ID транзакції</p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  const transaction = await getTransaction(transactionId, customer.id);

  if (!transaction) {
    return (
      <CabinetLayout 
        title="Деталі"
        showBack={true}
        showAvatar={true}
        showNav={true}
      >
        <div className="px-4 pt-6 pb-16">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <p className="text-foreground font-semibold text-center">Транзакція не знайдена</p>
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

  const typeTitle = getTransactionTitle(transaction.type);
  const { date, time } = formatDateTime(transaction.created_at);

  return (
    <CabinetLayout 
      title="Деталі"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="px-4 pt-6 pb-24 space-y-6">
        {/* Amount Display Card */}
        <div 
          className={`p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 ${
            isIncoming 
              ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30' 
              : 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30'
          }`}
        >
          <div className={`p-4 rounded-2xl ${
            isIncoming 
              ? 'bg-green-500/20' 
              : 'bg-red-500/20'
          }`}>
            <div className={isIncoming ? 'text-green-500' : 'text-red-500'}>
              {getTransactionIcon(transaction.type)}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              {typeTitle}
            </p>
            <p className={`text-5xl font-bold ${
              isIncoming ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatAmountWithSign(transaction.amount, isIncoming)}
            </p>
            <p className="text-muted-foreground text-sm">INPOM</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {/* Date & Time */}
          <div className="cabinet-list-item">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Дата і час
              </p>
              <p className="text-foreground font-medium mt-1">
                {date} о {time}
              </p>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="cabinet-list-item">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Опис
                </p>
                <p className="text-foreground font-medium mt-1">
                  {transaction.description}
                </p>
              </div>
            </div>
          )}

          {/* Transaction ID */}
          <div className="cabinet-list-item">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                ID транзакції
              </p>
              <p className="text-foreground font-medium font-mono mt-1">
                #{transaction.id}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        {invoice && (
          <div 
            className="p-5 rounded-2xl border border-green-500/30 bg-green-500/10 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-semibold text-green-600">
                Пов'язаний інвойс
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Статус
                </p>
                <p className={`text-sm font-medium mt-1 ${
                  invoice.status === 'paid' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {invoice.status === 'paid' ? '✓ Оплачено' : '⏳ Очікує'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Сума інвойсу
                </p>
                <p className="text-sm font-medium mt-1 text-foreground">
                  {formatAmount(invoice.amount)} INPOM
                </p>
              </div>

              {invoice.description && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Опис
                  </p>
                  <p className="text-sm font-medium mt-1 text-foreground">
                    {invoice.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Автор
                </p>
                <p className="text-sm font-medium mt-1 text-foreground">
                  {invoice.creator_name}
                </p>
              </div>

              {/* Action Button */}
              <Link
                href={
                  transaction.type === 'payment_sent'
                    ? `/mycabinet/pay-invoice/${invoice.id}`
                    : `/mycabinet/invoices/${invoice.id}`
                }
                className="block pt-2"
              >
                <button className="w-full cabinet-button cabinet-button-primary">
                  {transaction.type === 'payment_sent'
                    ? 'Переглянути статус'
                    : 'Переглянути інвойс'}
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div>
          <Link href="/mycabinet/transactions" className="block">
            <button className="w-full cabinet-button cabinet-button-secondary">
              Повернутись до історії
            </button>
          </Link>
        </div>
      </div>
    </CabinetLayout>
  );
}
