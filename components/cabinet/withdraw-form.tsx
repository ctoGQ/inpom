'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Building2, Loader, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WithdrawFormProps {
  cardId: number;
  customerId: number;
  availableBalance: number;
}

const COMMISSION_PERCENT = 20;

export function WithdrawForm({ cardId, customerId, availableBalance }: WithdrawFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [withdrawMethod, setWithdrawMethod] = useState<'card' | 'iban'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit()) {
      toast({
        title: 'Помилка',
        description: 'Заповніть всі обов\'язкові поля',
        variant: 'destructive',
      });
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
        toast({
          title: 'Успіх',
          description: 'Запит на вивід коштів створений',
        });
        router.push('/mycabinet/transactions');
      } else {
        console.error('Withdrawal API error:', data);
        toast({
          title: 'Помилка',
          description: data.error || 'Не вдалось створити запит на вивід',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при обробці запиту',
        variant: 'destructive',
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-24">
      {/* Personal Info Section */}
      <div className="space-y-3 rounded-2xl border border-foreground/10 p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Особисті дані</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Ім'я"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
            className="px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="Прізвище"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading}
            className="px-4 py-3 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>
      </div>

      {/* Amount Section */}
      <div className="space-y-3 rounded-2xl border border-foreground/10 p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Сума вивода</p>
        
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
            Введіть суму
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
            className="w-full px-4 py-3 bg-input border border-input rounded-lg text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">Доступно: {availableBalance.toFixed(2)} INPOM</p>
        </div>

        {/* Quick Amounts */}
        <div className="space-y-0.5 rounded-lg overflow-hidden divide-y divide-foreground/10 border border-foreground/10">
          {[100, 500, 1000, 5000].map((val, idx) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickAmount(val)}
              disabled={val > availableBalance || isLoading}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">Швидко: {val} INPOM</span>
              <span className="text-sm font-medium text-foreground">{val}</span>
            </button>
          ))}
        </div>

        {/* Commission Breakdown */}
        {amountNum > 0 && (
          <div className="space-y-2 pt-4 border-t border-foreground/10">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Сума:</span>
              <span className="font-semibold text-foreground">{amountNum.toFixed(2)} INPOM</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Комісія (20%):</span>
              <span className="font-semibold text-destructive">-{commission.toFixed(2)} INPOM</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-foreground/10">
              <span className="font-semibold text-foreground">Ви отримаєте:</span>
              <span className="text-lg font-bold text-foreground">{resultAmount.toFixed(2)} INPOM</span>
            </div>
          </div>
        )}
      </div>

      {/* Method Selection */}
      <div className="space-y-3 rounded-2xl border border-foreground/10 p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Спосіб вивода</p>

        {/* Method Tabs */}
        <div className="flex gap-2 p-1 bg-muted/30 rounded-lg border border-foreground/10">
          <button
            type="button"
            onClick={() => setWithdrawMethod('card')}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              withdrawMethod === 'card'
                ? 'bg-card border border-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Карта
          </button>
          <button
            type="button"
            onClick={() => setWithdrawMethod('iban')}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              withdrawMethod === 'iban'
                ? 'bg-card border border-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            IBAN
          </button>
        </div>

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
      <div className="space-y-3 rounded-2xl border border-foreground/10 p-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
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
      <div className="flex items-start gap-3 p-4 rounded-2xl border border-foreground/10 bg-card">
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
      <div className="flex gap-3 p-4 rounded-2xl border border-foreground/10 bg-card">
        <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Запрос на вивід буде оброблено протягом 1-3 робочих днів. Мінімальна сума вивода: 10 INPOM.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!canSubmit() || isLoading}
        className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
      >
        {isLoading && <Loader className="w-5 h-5 animate-spin" />}
        {resultAmount > 0 ? `Вивести ${resultAmount.toFixed(2)} INPOM` : 'Вивести коштиы'}
      </button>
    </form>
  );
}
