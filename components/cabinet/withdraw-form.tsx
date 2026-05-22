'use client';

import { useState } from 'react';
import { CreditCard, Building2 } from 'lucide-react';

interface WithdrawFormProps {
  customerId: number;
  cardId: number;
  cardBalance: number;
}

const COMMISSION_PERCENT = 20;

export function WithdrawForm({ customerId, cardId, cardBalance }: WithdrawFormProps) {
  const [withdrawMethod, setWithdrawMethod] = useState<'card' | 'iban'>('card');
  const [amount, setAmount] = useState('');
  const [agreed, setAgreed] = useState(false);

  // For card method
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  // For IBAN method
  const [iban, setIban] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');

  const amountNum = parseFloat(amount) || 0;
  const commission = amountNum * (COMMISSION_PERCENT / 100);
  const totalAmount = amountNum + commission;
  const resultAmount = amountNum - commission;

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Withdraw:', {
      customerId,
      cardId,
      withdrawMethod,
      amount,
      commission,
      resultAmount,
      ...(withdrawMethod === 'card' && { cardNumber, cardHolder, cardExpiry }),
      ...(withdrawMethod === 'iban' && { iban, accountHolder, bankName }),
    });
  };

  const canSubmit = () => {
    const baseCheck = amount && agreed && amountNum > 0 && amountNum <= cardBalance;
    if (withdrawMethod === 'card') {
      return baseCheck && cardNumber && cardHolder && cardExpiry;
    } else {
      return baseCheck && iban && accountHolder && bankName;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-6 pb-24 space-y-8">
      {/* Balance Info */}
      <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Доступний баланс
        </p>
        <p className="text-2xl font-bold text-foreground">
          {cardBalance.toFixed(2)} INPOM
        </p>
      </div>

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
            max={cardBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-3 px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl text-2xl font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <p className="text-xs text-muted-foreground mt-2">INPOM</p>
        </div>

        {/* Quick Amounts */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Швидкі суми
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[100, 500, 1000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                disabled={val > cardBalance}
                className="px-4 py-3 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {val} INPOM
              </button>
            ))}
          </div>
        </div>

        {/* Commission Info */}
        {amountNum > 0 && (
          <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Сума:</span>
              <span className="text-sm font-medium text-foreground">{amountNum.toFixed(2)} INPOM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Комісія платформи (20%):</span>
              <span className="text-sm font-medium text-red-500">-{commission.toFixed(2)} INPOM</span>
            </div>
            <div className="border-t border-foreground/10 pt-2 flex justify-between">
              <span className="text-xs font-semibold text-foreground">Ви отримаєте:</span>
              <span className="text-sm font-bold text-green-600">{resultAmount.toFixed(2)} INPOM</span>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Method Tabs */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Спосіб вивода
        </p>

        {/* Tab Buttons */}
        <div className="flex gap-2 p-1 bg-foreground/5 rounded-xl border border-foreground/10">
          <button
            type="button"
            onClick={() => setWithdrawMethod('card')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              withdrawMethod === 'card'
                ? 'bg-foreground text-background'
                : 'bg-transparent text-foreground hover:bg-foreground/10'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            На карту
          </button>
          <button
            type="button"
            onClick={() => setWithdrawMethod('iban')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              withdrawMethod === 'iban'
                ? 'bg-foreground text-background'
                : 'bg-transparent text-foreground hover:bg-foreground/10'
            }`}
          >
            <Building2 className="w-4 h-4" />
            На IBAN
          </button>
        </div>

        {/* Card Method */}
        {withdrawMethod === 'card' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Номер карти"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
              maxLength={16}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Ім'я власника карти"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
              maxLength={5}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* IBAN Method */}
        {withdrawMethod === 'iban' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="IBAN"
              value={iban}
              onChange={(e) => setIban(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
            <input
              type="text"
              placeholder="Ім'я власника рахунку"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Назва банку"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Agreement */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-5 h-5 mt-0.5 cursor-pointer accent-primary"
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          Я погоджуюсь з умовами користування та політикою конфіденційності. Розумію, що комісія платформи 20% буде утримана з суми вивода.
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!canSubmit()}
        className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
      >
        Вивести {resultAmount.toFixed(2)} INPOM
      </button>

      {/* Info Box */}
      <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Комісія платформи складає 20% від суми вивода. Переводи зазвичай обробляються протягом 1-2 робочих днів.
        </p>
      </div>
    </form>
  );
}
