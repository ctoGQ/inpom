'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, ArrowLeft } from 'lucide-react';
import { InvoiceDisplay } from './invoice-display';
import { useToast } from '@/hooks/use-toast';

interface InvoiceFormProps {
  customerId: number;
  cardId: number;
}

interface Invoice {
  id: number;
  creator_customer_id: number;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  expires_at: string;
  paymentUrl: string;
}

export function InvoiceForm({ customerId, cardId }: InvoiceFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('30');
  const [loading, setLoading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log(`[InvoiceForm] Form submitted with values:`, { amount, description, expiry });

    // Validate amount
    const numAmount = parseFloat(amount);
    console.log(`[InvoiceForm] Parsed amount: ${numAmount} (original: "${amount}")`);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      console.warn(`[InvoiceForm] ❌ Invalid amount: ${numAmount}`);
      toast({
        title: 'Некоректна сума',
        description: 'Сума повинна бути більша за 0',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (numAmount > 999999.99) {
      console.warn(`[InvoiceForm] ❌ Amount too large: ${numAmount}`);
      toast({
        title: 'Сума завелика',
        description: 'Максимальна сума для інвойса: 999999.99 inpom',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      console.warn(`[InvoiceForm] ❌ Description is empty`);
      toast({
        title: 'Опис обов\'язковий',
        description: 'Будь ласка, додайте опис для інвойса',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    console.log(`[InvoiceForm] ✅ All validations passed, sending request...`);

    try {
      console.log(`[InvoiceForm] Submitting invoice creation:`, {
        customerId,
        amount: numAmount,
        description: description.trim(),
        expiryMinutes: parseInt(expiry),
      });

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          cardId,
          amount: numAmount,
          description: description.trim(),
          expiryMinutes: parseInt(expiry),
        }),
      });

      console.log(`[InvoiceForm] Response status: ${response.status}`);
      
      const data = await response.json();
      console.log(`[InvoiceForm] Response data:`, data);

      if (data.success) {
        console.log(`[InvoiceForm] ✅ Invoice created successfully:`, data.invoice);
        setCreatedInvoice(data.invoice);
        toast({
          title: 'Успіх',
          description: 'Ваш інвойс створено. Тепер поділіться ним',
        });
        // Reset form
        setAmount('');
        setDescription('');
        setExpiry('30');
      } else {
        console.warn(`[InvoiceForm] ❌ API returned error:`, data.error);
        toast({
          title: 'Помилка при створенні',
          description: data.error || 'Не вдалось створити інвойс',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[InvoiceForm] ❌ Fetch error:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при створенні інвойса. Спробуйте пізніше',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (createdInvoice) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => setCreatedInvoice(null)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Створити новий інвойс
          </button>
        </div>

        <InvoiceDisplay
          invoiceId={createdInvoice.id}
          amount={createdInvoice.amount}
          description={createdInvoice.description}
          creatorName="Ваш інвойс"
          paymentUrl={createdInvoice.paymentUrl}
          status={createdInvoice.status}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          Сума (inpom) *
        </label>
        <input
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          Опис *
        </label>
        <textarea
          placeholder="Опис платежу..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 resize-none"
        />
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {description.length}/500 символів
        </p>
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          Термін дії (хвилин)
        </label>
        <select
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
        >
          <option value="15">15 хвилин</option>
          <option value="30">30 хвилин</option>
          <option value="60">1 година</option>
          <option value="1440">1 день</option>
          <option value="10080">1 тиждень</option>
        </select>
      </div>

      {/* Create Button */}
      <Button
        type="submit"
        disabled={!amount || !description.trim() || loading || parseFloat(amount) <= 0}
        className="w-full bg-slate-900 dark:bg-slate-950 text-white hover:bg-slate-800 dark:hover:bg-slate-900 disabled:opacity-50 rounded-lg py-3"
      >
        <QrCode className="w-4 h-4 mr-2" />
        {loading ? 'Створення...' : 'Створити інвойс'}
      </Button>

      {/* Info */}
      <div className="p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg space-y-2">
        <p className="text-xs font-medium text-slate-900 dark:text-white">Як це працює:</p>
        <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
          <li>Введіть суму платежу</li>
          <li>Натисніть &quot;Створити інвойс&quot;</li>
          <li>Поділітеся QR-кодом з іншим користувачем</li>
          <li>Користувач відсканує код і відправить оплату</li>
          <li>Баланс буде автоматично поновлено</li>
        </ol>
      </div>
    </form>
  );
}
