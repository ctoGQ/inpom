import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { AlertCircle } from 'lucide-react';
import { PaymentConfirm } from '@/components/cabinet/payment-confirm';
import { sql } from '@/lib/db';

interface PageProps {
  params: {
    id: string;
  };
}

async function getInvoice(invoiceId: number) {
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

export default async function PayInvoicePage({ params }: PageProps) {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const invoice = await getInvoice(parseInt(params.id));

  if (!invoice) {
    return (
      <CabinetLayout title="Платіж" showBack>
        <div className="space-y-6 pt-6">
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Інвойс не знайдено або більше недійсний
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  // Check if user is trying to pay their own invoice
  if (invoice.creator_customer_id === customer.id) {
    return (
      <CabinetLayout title="Платіж" showBack>
        <div className="space-y-6 pt-6">
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Ви не можете платити свій інвойс
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  const isExpired = invoice.expires_at && new Date(invoice.expires_at) < new Date();
  const isAlreadyPaid = invoice.status === 'paid';

  return (
    <CabinetLayout title="Платіж" showBack>
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-2">
            Оплата інвойса
          </h1>
          <p className="text-sm text-muted-foreground">
            Перевірте деталі та підтвердьте оплату
          </p>
        </div>

        {/* Invoice Details */}
        <div className="p-6 bg-foreground/5 border border-foreground/10 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            ЗАПИТ ВІД
          </p>
          <h2 className="text-2xl font-display text-foreground mb-6">
            {invoice.creator_name}
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Сума до оплати
              </p>
              <p className="text-4xl font-display text-foreground">
                {typeof invoice.amount === 'number' ? invoice.amount.toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">inpom</p>
            </div>

            {invoice.description && (
              <div className="pt-4 border-t border-foreground/10">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  ОПИС
                </p>
                <p className="text-sm text-foreground">
                  {invoice.description}
                </p>
              </div>
            )}

            {invoice.expires_at && !isExpired && (
              <div className="pt-4 border-t border-foreground/10">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  ТЕРМІН ДІЇ
                </p>
                <p className="text-sm text-foreground">
                  {new Date(invoice.expires_at).toLocaleDateString('uk-UA')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Confirmation */}
        <PaymentConfirm
          invoiceId={parseInt(params.id)}
          amount={invoice.amount}
          creatorName={invoice.creator_name}
          customerId={customer.id}
          isExpired={isExpired}
          isAlreadyPaid={isAlreadyPaid}
        />

        {/* Info */}
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            При підтвердженні оплати, зазначена сума буде списана з вашого балансу та перерахована на рахунок автора інвойса.
          </p>
        </div>
      </div>
    </CabinetLayout>
  );
}
