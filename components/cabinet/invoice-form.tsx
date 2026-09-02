'use client';

import { useState } from 'react';
import { QrCode, ArrowLeft, Loader, Clock, ChevronRight } from 'lucide-react';
import { InvoiceDisplay } from './invoice-display';
import { MobileModal } from '@/components/mobile-modal';
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

const QUICK_AMOUNTS = [100, 500, 2000, 5000];

const EXPIRY_OPTIONS = [
  { id: '15', label: '15 хвилин', description: 'Для швидких платежів' },
  { id: '30', label: '30 хвилин', description: 'Стандартний час' },
  { id: '60', label: '1 година', description: 'Для більших сум' },
  { id: '1440', label: '1 день', description: 'Для довгострокових' },
  { id: '10080', label: '1 тиждень', description: 'Максимальний час' },
];

export function InvoiceForm({ customerId, cardId }: InvoiceFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('30');
  const [loading, setLoading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const { toast } = useToast();

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSelectExpiry = (expiryId: string) => {
    setExpiry(expiryId);
    setIsExpiryModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    console.log(`[InvoiceForm] Form submitted with values:`, { amount, description, expiry });

    // Validate amount
    const numAmount = parseFloat(amount);
    console.log(`[InvoiceForm] Parsed amount: ${numAmount} (original: "${amount}")`);

    if (isNaN(numAmount) || numAmount <= 0) {
      console.warn(`[InvoiceForm] ❌ Invalid amount: ${numAmount}`);
      setError('Сума повинна бути більша за 0');
      setLoading(false);
      return;
    }

    if (numAmount > 999999.99) {
      console.warn(`[InvoiceForm] ❌ Amount too large: ${numAmount}`);
      setError('Максимальна сума для інвойса: 999999.99 inpom');
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      console.warn(`[InvoiceForm] ❌ Description is empty`);
      setError('Опис обов\'язковий');
      setLoading(false);
      return;
    }

    console.log(`[InvoiceForm] ✅ All validations passed, sending request...`);

    try {
      console.log(`[InvoiceForm] Submitting invoice creation:`, {
        customerId,
        cardId,
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
        setSuccess(true);
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
        setError(data.error || 'Не вдалось створити інвойс');
      }
    } catch (error) {
      console.error('[InvoiceForm] ❌ Fetch error:', error);
      setError('Сталась помилка при створенні інвойса. Спробуйте пізніше');
    } finally {
      setLoading(false);
    }
  };

  if (createdInvoice) {
    return (
      <div className="space-y-6">
        

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
    <div className="px-4 pt-6 pb-24 space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-2xl bg-card border border-foreground/10">
          <p className="text-sm font-medium text-foreground">
            ✓ Інвойс успішно створено!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm font-medium text-destructive">
            ✗ {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input Card */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
              Сума (inpom)
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              className="w-full px-0 py-2 bg-transparent border-0 text-3xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
            />
          </div>

          {/* Quick Amounts - Horizontal */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                disabled={loading}
                className="px-3 py-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                <span className="text-sm font-medium text-foreground">{val}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
            Опис платежу
          </label>
          <textarea
            placeholder="Опис платежу..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className="w-full px-0 py-2 bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/500 символів
          </p>
        </div>

        {/* Expiry Selection */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Час дії інвойса
          </p>

          <button
            type="button"
            onClick={() => setIsExpiryModalOpen(true)}
            disabled={loading}
            className="w-full p-4 rounded-2xl border border-foreground/10 bg-card hover:bg-muted/50 transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-all">
                <Clock className="w-5 h-5 text-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">
                  {EXPIRY_OPTIONS.find(o => o.id === expiry)?.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {EXPIRY_OPTIONS.find(o => o.id === expiry)?.description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Create Button */}
        <button
          type="submit"
          disabled={!amount || !description.trim() || loading || parseFloat(amount) <= 0}
          className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-5 h-5 animate-spin" />}
          {loading ? 'Створення...' : 'Створити інвойс'}
        </button>

        {/* Info */}
        <div className="">
          <p className="text-sm mb-4 font-semibold text-foreground uppercase tracking-wide">Як це працює:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Введіть суму платежу</li>
            <li>Натисніть "Створити інвойс"</li>
            <li>Поділітеся QR-кодом з іншим користувачем</li>
            <li>Користувач відсканує код і відправить оплату</li>
            <li>Баланс буде автоматично поновлено</li>
          </ol>
        </div>
      </form>

      {/* Expiry Modal */}
      <MobileModal
        isOpen={isExpiryModalOpen}
        onClose={() => setIsExpiryModalOpen(false)}
        title="Виберіть час дії"
      >
        <div className="px-4 pt-6 pb-24 space-y-2">
          {EXPIRY_OPTIONS.map((option) => {
            const isSelected = expiry === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleSelectExpiry(option.id)}
                disabled={loading}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-secondary/20 border-foreground/20'
                    : 'bg-card border-foreground/10 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-secondary/30'
                      : 'bg-muted group-hover:bg-muted/80'
                  }`}>
                    <Clock className={`w-5 h-5 ${
                      isSelected ? 'text-foreground' : 'text-foreground'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium text-sm ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </MobileModal>
    </div>
  );
}
