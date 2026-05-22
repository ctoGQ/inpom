import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { AlertCircle } from 'lucide-react';
import { PaymentConfirm } from '@/components/cabinet/payment-confirm';
import { sql } from '@/lib/db';
import { formatAmount } from '@/lib/format-amount';

interface PageProps {
  params: {
    id: string;
  };
}

async function getInvoice(invoiceId: number) {
  try {
    console.log(`[getInvoice] Fetching invoice with ID: ${invoiceId}`);
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
      LEFT JOIN customers c ON i.creator_customer_id = c.id
      WHERE i.id = ${invoiceId}
    `;
    
    console.log(`[getInvoice] Query result:`, result);
    
    if (result.rows?.length) {
      console.log(`[getInvoice] ✅ Found invoice:`, result.rows[0]);
      return result.rows[0];
    }
    
    console.warn(`[getInvoice] ❌ Invoice ${invoiceId} not found in database`);
    return null;
  } catch (error) {
    console.error('[getInvoice] ❌ Error fetching invoice:', error);
    return null;
  }
}

export default async function PayInvoicePage({ params }: PageProps) {
  // In Next.js 16+, params is a Promise - must await it
  const resolvedParams = await params;
  
  console.log(`[PayInvoicePage] Page loaded with resolved params:`, resolvedParams);
  console.log(`[PayInvoicePage] params.id:`, resolvedParams.id, `(type: ${typeof resolvedParams.id})`);
  
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const invoiceId = parseInt(resolvedParams.id, 10);
  console.log(`[PayInvoicePage] Parsed invoiceId:`, invoiceId, `(isNaN: ${isNaN(invoiceId)})`);
  
  const invoice = await getInvoice(invoiceId);

  if (!invoice) {
    return (
      <CabinetLayout 
        title="Платіж"
        showBack={true}
        showAvatar={true}
        showNav={true}
      >
        <div className="space-y-2xl pt-lg">
          <div className="cabinet-empty-state">
            <AlertCircle className="cabinet-empty-state-icon text-destructive" />
            <p className="cabinet-empty-state-title">
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
      <CabinetLayout 
        title="Платіж"
        showBack={true}
        showAvatar={true}
        showNav={true}
      >
        <div className="space-y-2xl pt-lg">
          <div className="cabinet-empty-state">
            <AlertCircle className="cabinet-empty-state-icon text-destructive" />
            <p className="cabinet-empty-state-title">
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
    <CabinetLayout 
      title="Платіж"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Оплата інвойса
          </h1>
          <p className="text-sm text-gray-700">
            Перевірте деталі та підтвердьте оплату
          </p>
        </div>

        {/* Invoice Details */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            ЗАПИТ ВІД
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {invoice.creator_name}
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Сума до оплати
              </p>
              <p className="text-4xl font-bold text-slate-900">
                {formatAmount(invoice.amount)}
              </p>
              <p className="text-sm text-gray-600">inpom</p>
            </div>

            {invoice.description && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  ОПИС
                </p>
                <p className="text-sm text-slate-900">
                  {invoice.description}
                </p>
              </div>
            )}

            {invoice.expires_at && !isExpired && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  ТЕРМІН ДІЇ
                </p>
                <p className="text-sm text-slate-900">
                  {new Date(invoice.expires_at).toLocaleDateString('uk-UA')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Confirmation */}
        <PaymentConfirm
          invoiceId={invoiceId}
          amount={invoice.amount}
          creatorName={invoice.creator_name}
          customerId={customer.id}
          isExpired={isExpired}
          isAlreadyPaid={isAlreadyPaid}
        />

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
          <p className="text-xs text-gray-700 font-medium">
            При підтвердженні оплати, зазначена сума буде списана з вашого балансу та перерахована на рахунок автора інвойса.
          </p>
        </div>
      </div>
    </CabinetLayout>
  );
}
