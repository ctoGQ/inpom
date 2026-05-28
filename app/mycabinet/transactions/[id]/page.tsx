import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { sql } from '@/lib/db';
import { formatAmountWithSign, formatAmount } from '@/lib/format-amount';
import Link from 'next/link';
import { AlertCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { TransactionDetailClient } from '@/components/transaction-detail-client';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTransaction(transactionId: number, customerId: number) {
  try {
    const result = await sql`
      SELECT id, type, amount, description, created_at, invoice_id, card_id
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
        c.name as creator_name,
        c.avatar_url as creator_avatar
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

async function getOtherCustomer(customerId: number) {
  try {
    const result = await sql`
      SELECT id, name, avatar_url
      FROM customers
      WHERE id = ${customerId}
    `;
    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

const formatDateTime = (dateString: string): { date: string; time: string } => {
  try {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: dateString, time: '' };
  }
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
        <div className="px-4 pt-6 pb-24">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
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
        <div className="px-4 pt-6 pb-24">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
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

  let otherCustomer = null;
  if (invoice) {
    if (transaction.type === 'payment_sent') {
      otherCustomer = await getOtherCustomer(invoice.creator_customer_id);
    } else if (transaction.type === 'payment_received') {
      // Find the payer from another transaction
      try {
        const payerResult = await sql`
          SELECT DISTINCT customer_id FROM transactions
          WHERE invoice_id = ${transaction.invoice_id} AND type = 'payment_sent' LIMIT 1
        `;
        if (payerResult.rows?.length) {
          otherCustomer = await getOtherCustomer(payerResult.rows[0].customer_id);
        }
      } catch (e) {
        console.error('Error finding payer:', e);
      }
    }
  }

  const isIncoming = 
    transaction.type.includes('deposit') || 
    transaction.type.includes('payment_received');

  const { date, time } = formatDateTime(transaction.created_at);

  return (
    <CabinetLayout 
      title="Деталі"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <TransactionDetailClient 
        transaction={transaction}
        invoice={invoice}
        otherCustomer={otherCustomer}
        isIncoming={isIncoming}
        dateTime={{ date, time }}
        customer={customer}
      />
    </CabinetLayout>
  );
}
