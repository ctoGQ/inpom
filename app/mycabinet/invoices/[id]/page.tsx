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
        <div className="space-y-2">
          <Link href={`/mycabinet/pay-invoice/${invoice.id}`} className="block">
            <Button
              className="w-full h-12 rounded-xl bg-white border border-gray-200 text-slate-900 font-semibold hover:bg-gray-50 transition-all"
            >
              Переглянути сторінку оплати
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link href="/mycabinet/transactions" className="block">
            <Button
              className="w-full h-12 rounded-xl bg-white border border-gray-200 text-slate-900 font-semibold hover:bg-gray-50 transition-all"
            >
              Повернутись до транзакцій
            </Button>
          </Link>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs font-semibold text-slate-900">Інформація:</p>
          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
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
