'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Building2, Loader, Info, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MobileModal } from '@/components/mobile-modal';

interface WithdrawFormProps {
  cardId: number;
  customerId: number;
  availableBalance: number;
}

const COMMISSION_PERCENT = 20;
const QUICK_AMOUNTS = [100, 500, 2000, 5000];

const WITHDRAW_METHODS = [
  {
    id: 'card' as const,
    label: 'Карта',
    icon: CreditCard,
    description: 'Вивід на банківську карту'
  },
  {
    id: 'iban' as const,
    label: 'IBAN',
    icon: Building2,
    description: 'Банківський переказ'
  }
];

export function WithdrawForm({ cardId, customerId, availableBalance }: WithdrawFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [withdrawMethod, setWithdrawMethod] = useState<'card' | 'iban'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Common fields
  const [amount, setAmount] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [notes, setNotes] = useState('');

  // For card method
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  // For IBAN method
  const [iban, setIban] = useState('');
  const [bankName, setBankName] = useState('');
  const [swiftCode, setSwiftCode] = useState('');

  const amountNum = parseFloat(amount) || 0;
  const commission = amountNum * (COMMISSION_PERCENT / 100);
  const resultAmount = amountNum - commission;

  const handleQuickAmount = (value: number) => {
    if (value <= availableBalance) {
      setAmount(value.toString());
    }
  };

  const handleSelectMethod = (methodId: 'card' | 'iban') => {
    setWithdrawMethod(methodId);
    setIsMethodModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!canSubmit()) {
      setError('Заповніть всі обов\'язкові поля');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          customerId,
          withdrawType: withdrawMethod,
          amount: amountNum,
          commission,
          firstName,
          lastName,
          ...(withdrawMethod === 'card' && {
            cardNumber,
            cardExpiry
          }),
          ...(withdrawMethod === 'iban' && {
            iban,
            bankName,
            swiftCode
          }),
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast({
          title: 'Успіх',
          description: 'Запит на вивід коштів створений',
        });
        setTimeout(() => {
          router.push('/mycabinet/transactions');
        }, 2000);
      } else {
        console.error('Withdrawal API error:', data);
        setError(data.error || 'Не вдалось створити запит на вивід');
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      setError('Сталась помилка при обробці запиту');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = () => {
    const baseCheck = 
      amount && 
      agreed && 
      amountNum > 0 && 
      amountNum <= availableBalance &&
      firstName &&
      lastName;

    if (withdrawMethod === 'card') {
      return baseCheck && cardNumber && cardExpiry;
    } else {
      return baseCheck && iban && bankName && swiftCode;
    }
  };

  const selectedMethod = WITHDRAW_METHODS.find(m => m.id === withdrawMethod);
  const SelectedIcon = selectedMethod?.icon || CreditCard;

  return (
    <>
      <div className="px-4 pt-6 pb-24 space-y-6">
        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-2xl bg-card border border-foreground/10">
            <p className="text-sm font-medium text-foreground">
              ✓ Запит на вивід успішно створено! Перенаправлення на транзакції...
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
          {/* Personal Info Section */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Особисті дані</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Ім'я"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="Прізвище"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
          </div>

          {/* Amount Section */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
                Сума виводу
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                className="w-full px-0 py-2 bg-transparent border-0 text-3xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
              />
              <p className="text-xs text-muted-foreground mt-1">Доступно: {availableBalance.toFixed(2)} INPOM</p>
            </div>

            {/* Quick Amounts - Horizontal */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  disabled={val > availableBalance || isLoading}
                  className="px-3 py-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                  <span className="text-sm font-medium text-foreground">{val}</span>
                </button>
              ))}
            </div>

            {/* Commission Breakdown */}
            {amountNum > 0 && (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Сума:</span>
                  <span className="font-semibold text-foreground">{amountNum.toFixed(2)} INPOM</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Комісія (20%):</span>
                  <span className="font-semibold text-destructive">-{commission.toFixed(2)} INPOM</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="font-semibold text-foreground">Ви отримаєте:</span>
                  <span className="text-lg font-bold text-foreground">{resultAmount.toFixed(2)} INPOM</span>
                </div>
              </div>
            )}
          </div>

          {/* Method Selection */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Спосіб вивода
            </p>

            <button
              type="button"
              onClick={() => setIsMethodModalOpen(true)}
              disabled={isLoading}
              className="w-full p-4 rounded-2xl border border-foreground/10 bg-card hover:bg-muted/50 transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-all">
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

            {/* Method-specific fields */}
            {withdrawMethod === 'card' && (
              <div className="space-y-3 pt-4">
                <input
                  type="text"
                  placeholder="Номер карти"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 19))}
                  disabled={isLoading}
                  maxLength={19}
                  className="w-full px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 font-mono"
                />
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 4) {
                      setCardExpiry(val.length > 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val);
                    }
                  }}
                  disabled={isLoading}
                  maxLength={5}
                  className="w-full px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 font-mono"
                />
              </div>
            )}

            {withdrawMethod === 'iban' && (
              <div className="space-y-3 pt-4">
                <input
                  type="text"
                  placeholder="IBAN"
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 font-mono"
                />
                <input
                  type="text"
                  placeholder="Назва банку"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <input
                  type="text"
                  placeholder="Swift Code"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 font-mono"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
              Примітка (опціонально)
            </label>
            <textarea
              placeholder="Додайте будь-яку додаткову інформацію..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
            />
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="withdraw-agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isLoading}
              className="w-5 h-5 mt-0.5 cursor-pointer accent-foreground disabled:cursor-not-allowed"
            />
            <label htmlFor="withdraw-agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              Я погоджуюсь з умовами користування. Розумію, що комісія платформи 20% буде утримана з суми вивода. Гарантую, що реквізити належать мені.
            </label>
          </div>

          {/* Info Box */}
          <div className="flex gap-3 p-4 rounded-2xl bg-muted/30">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Запрос на вивід буде оброблено протягом 1-3 робочих днів. Мінімальна сума вивода: 10 INPOM.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit() || isLoading}
            className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader className="w-5 h-5 animate-spin" />}
            {resultAmount > 0 ? `Вивести ${resultAmount.toFixed(2)} INPOM` : 'Вивести кошти'}
          </button>
        </form>
      </div>

      {/* Withdraw Method Modal */}
      <MobileModal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        title="Виберіть спосіб вивода"
      >
        <div className="px-4 pt-6 pb-24 space-y-2">
          {WITHDRAW_METHODS.map((method) => {
            const MethodIcon = method.icon;
            const isSelected = withdrawMethod === method.id;

            return (
              <button
                key={method.id}
                onClick={() => handleSelectMethod(method.id)}
                disabled={isLoading}
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
                    <MethodIcon className={`w-5 h-5 ${
                      isSelected ? 'text-foreground' : 'text-foreground'
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
