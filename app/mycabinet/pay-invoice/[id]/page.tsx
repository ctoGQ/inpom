import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
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

  const isExpired = invoice.expires_at && new Date(invoice.expires_at) < new Date();
  const isAlreadyPaid = invoice.status === 'paid';

  return (
    <CabinetLayout title="Платіж" showBack>
      <div className="space-y-6 pt-6">
        {/* Status */}
        {isAlreadyPaid ? (
          <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-500">Оплачено</p>
              <p className="text-xs text-muted-foreground mt-1">
                Цей інвойс уже оплачений
              </p>
            </div>
          </div>
        ) : isExpired ? (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Термін закінчився</p>
              <p className="text-xs text-muted-foreground mt-1">
                Цей інвойс більше недійсний
              </p>
            </div>
          </div>
        ) : null}

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

        {/* Payment Section */}
        {!isAlreadyPaid && !isExpired && (
          <>
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Ваш поточний баланс
              </p>
              <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
                <p className="text-2xl font-display text-foreground">
                  0.00
                </p>
                <p className="text-xs text-muted-foreground mt-1">inpom</p>
              </div>
            </div>

            <button
              type="button"
              className="w-full px-4 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-lg font-medium transition-colors"
            >
              Підтвердити оплату
            </button>
          </>
        )}

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
