'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, ArrowLeft } from 'lucide-react';
import { InvoiceDisplay } from './invoice-display';
import { useToast } from '@/hooks/use-toast';

interface InvoiceFormProps {
  customerId: number;
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

export function InvoiceForm({ customerId }: InvoiceFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('30');
  const [loading, setLoading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          amount: parseFloat(amount),
          description,
          expiryMinutes: parseInt(expiry),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCreatedInvoice(data.invoice);
        toast({
          title: 'Інвойс створено',
          description: 'Ваш інвойс готовий до поширення',
        });
      } else {
        toast({
          title: 'Помилка',
          description: data.error || 'Не вдалось створити інвойс',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при створенні інвойса',
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
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
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
        <label className="text-sm font-medium text-foreground">
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
          className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Опис (опціонально)
        </label>
        <textarea
          placeholder="Опис платежу..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Термін дії (хвилин)
        </label>
        <select
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
        disabled={!amount || loading}
        className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-lg py-3"
      >
        <QrCode className="w-4 h-4 mr-2" />
        {loading ? 'Створення...' : 'Створити інвойс'}
      </Button>

      {/* Info */}
      <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
        <p className="text-xs font-medium text-foreground">Як це працює:</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
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
