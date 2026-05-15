'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

interface InvoiceFormProps {
  customerId: number;
}

export function InvoiceForm({ customerId }: InvoiceFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API to create invoice
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
        // Show QR code or success message
        console.log('Invoice created:', data.invoice);
        setAmount('');
        setDescription('');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

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
