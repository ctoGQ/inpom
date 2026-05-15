import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { InvoiceDisplay } from '@/components/cabinet/invoice-display';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { sql } from '@/lib/db';
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
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const invoice = await getInvoice(parseInt(params.id));

  if (!invoice) {
    return (
      <CabinetLayout title="Інвойс" showBack>
        <div className="space-y-6 pt-6">
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
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
      <CabinetLayout title="Інвойс" showBack>
        <div className="space-y-6 pt-6">
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Ви не маєте доступу до цього інвойса
            </p>
          </div>
        </div>
      </CabinetLayout>
    );
  }

  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lummetra.com'}/mycabinet/pay-invoice/${invoice.id}`;

  return (
    <CabinetLayout title="Інвойс" showBack>
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-2">
            Ваш інвойс
          </h1>
          <p className="text-sm text-muted-foreground">
            Поділіться цим інвойсом з іншими користувачами, щоб вони могли його оплатити
          </p>
        </div>

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
              variant="outline"
              className="w-full"
            >
              Переглянути сторінку оплати
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link href="/mycabinet/transactions" className="block">
            <Button
              variant="outline"
              className="w-full"
            >
              Повернутись до транзакцій
            </Button>
          </Link>
        </div>

        {/* Info */}
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
          <p className="text-xs font-medium text-foreground">Інформація:</p>
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
