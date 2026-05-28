import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { InvoiceDisplay } from '@/components/cabinet/invoice-display';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { sql } from '@/lib/db';
import { formatAmount, safeAmount } from '@/lib/format-amount';
import Link from 'next/link';

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

export default async function InvoiceViewPage({ params }: PageProps) {
  // In Next.js 16+, params is a Promise - must await it
  const resolvedParams = await params;
  
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const invoice = await getInvoice(parseInt(resolvedParams.id));

  if (!invoice) {
    return (
      <CabinetLayout 
        title="Інвойс"
        showBack={true}
        showAvatar={true}
        showNav={true}
      >
        <div className="space-y-2xl pt-lg">
          <div className="cabinet-empty-state">
            <AlertCircle className="cabinet-empty-state-icon text-destructive" />
            <p className="cabinet-empty-state-title">
              Інвойс не знайдено
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  // Check if current user is the creator
  if (invoice.creator_customer_id !== customer.id) {
    return (
      <CabinetLayout 
        title="Інвойс"
        showBack={true}
        showAvatar={true}
        showNav={true}
      >
        <div className="space-y-2xl pt-lg">
          <div className="cabinet-empty-state">
            <AlertCircle className="cabinet-empty-state-icon text-destructive" />
            <p className="cabinet-empty-state-title">
              Ви не маєте доступу до цього інвойса
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lummetra.com'}/mycabinet/pay-invoice/${invoice.id}`;

  return (
    <CabinetLayout 
      title="Інвойс"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="space-y-2xl pt-lg">
        <InvoiceDisplay
          invoiceId={invoice.id}
          amount={invoice.amount}
          description={invoice.description}
          creatorName={invoice.creator_name}
          paymentUrl={paymentUrl}
          status={invoice.status}
        />

        {/* Action Buttons */}
        <div className="space-y-0.5 rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
          <Link href={`/mycabinet/pay-invoice/${invoice.id}`} className="block">
            <button className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Переглянути сторінку оплати</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>
          </Link>

          <Link href="/mycabinet/transactions" className="block">
            <button className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Повернутись до транзакцій</span>
            </button>
          </Link>
        </div>

        {/* Info */}
        <div className="p-4 rounded-2xl border border-foreground/10 bg-card space-y-2">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Інформація:</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Поділіться QR-кодом з іншим користувачем</li>
            <li>Користувач може відсканувати код або перейти за посиланням</li>
            <li>Після оплати інвойс буде позначено як оплачено</li>
            <li>Гроші будуть переведені на ваш баланс</li>
          </ul>
        </div>
      </div>
    </CabinetLayout>
  );
}
