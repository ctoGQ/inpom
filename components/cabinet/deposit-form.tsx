'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobileModal } from '@/components/mobile-modal';
import { CreditCard, Building2, Bitcoin, ChevronRight, Loader } from 'lucide-react';

interface DepositFormProps {
  customerId: number;
}

const PAYMENT_METHODS = [
  { 
    id: 'card', 
    label: 'Карта (VISA/Mastercard)', 
    icon: CreditCard,
    description: 'Комісія: 2-3%'
  },
  { 
    id: 'bank', 
    label: 'Банківський переводи', 
    icon: Building2,
    description: 'Комісія: 1%'
  },
  { 
    id: 'crypto', 
    label: 'Криптовалюта', 
    icon: Bitcoin,
    description: 'Комісія: 0.5%'
  },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export function DepositForm({ customerId }: DepositFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSelectMethod = (methodId: string) => {
    setPaymentMethod(methodId);
    setIsMethodModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod,
          customerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Помилка при обробці депозиту');
        return;
      }

      setSuccess(true);
      setAmount('');
      
      // Redirect back to cabinet after 2 seconds
      setTimeout(() => {
        router.push('/mycabinet');
      }, 2000);
    } catch (err) {
      console.error('[v0] Deposit error:', err);
      setError('Помилка при обробці депозиту');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);
  const SelectedIcon = selectedMethod?.icon || CreditCard;

  return (
    <>
      <form onSubmit={handleSubmit} className="px-4 pt-6 pb-24 space-y-8">
        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30">
            <p className="text-sm font-medium text-green-600">
              ✓ Депозит успішно поповнено! Перенаправлення на кабінет...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm font-medium text-red-600">
              ✗ {error}
            </p>
          </div>
        )}

        {/* Amount Section */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Введіть суму
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              className="w-full mt-3 px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl text-2xl font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-2">INPOM</p>
          </div>

          {/* Quick Amounts */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Швидкі суми
            </p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {val} INPOM
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Спосіб оплати
          </p>

          <button
            type="button"
            onClick={() => setIsMethodModalOpen(true)}
            disabled={isLoading}
            className="w-full p-4 rounded-2xl border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-foreground/10 group-hover:bg-foreground/20 transition-all">
                <SelectedIcon className="w-5 h-5 text-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">
                  {selectedMethod?.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedMethod?.description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Agreement */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={isLoading}
            className="w-5 h-5 mt-0.5 cursor-pointer accent-primary disabled:cursor-not-allowed"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            Я погоджуюсь з умовами користування та політикою конфіденційності
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!amount || !agreed || isLoading || success}
          className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader className="w-5 h-5 animate-spin" />}
          {isLoading ? 'Обробка...' : 'Продовжити оплату'}
        </button>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Комісія залежить від обраного способу оплати. Зазвичай від 0.5% до 3%.
          </p>
        </div>
      </form>

      {/* Payment Method Modal */}
      <MobileModal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        title="Виберіть спосіб оплати"
      >
        <div className="px-4 py-6 space-y-2">
          {PAYMENT_METHODS.map((method) => {
            const MethodIcon = method.icon;
            const isSelected = paymentMethod === method.id;

            return (
              <button
                key={method.id}
                onClick={() => handleSelectMethod(method.id)}
                disabled={isLoading}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-primary/20'
                      : 'bg-foreground/10 group-hover:bg-foreground/20'
                  }`}>
                    <MethodIcon className={`w-5 h-5 ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium text-sm ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {method.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {method.description}
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
    </>
  );
}
