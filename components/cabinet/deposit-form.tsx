'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DepositFormProps {
  customerId: number;
}

export function DepositForm({ customerId }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [agreed, setAgreed] = useState(false);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle deposit logic
    console.log('Deposit:', { customerId, amount, paymentMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">
          Сума (inpom)
        </label>
        <input
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Quick Amount Buttons */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Швидкі суми
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[100, 500, 1000, 5000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickAmount(val)}
              className="px-4 py-3 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground rounded-lg font-medium transition-colors"
            >
              {val} inpom
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Спосіб оплати
        </p>
        <div className="space-y-2">
          {[
            { id: 'card', label: 'Карта (VISA/Mastercard)', icon: '💳' },
            { id: 'bank', label: 'Банківський переводи', icon: '🏦' },
            { id: 'crypto', label: 'Криптовалюта', icon: '₿' },
          ].map((method) => (
            <label
              key={method.id}
              className="flex items-center gap-3 p-4 bg-foreground/5 border border-foreground/10 hover:border-primary rounded-lg cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="payment_method"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-lg">{method.icon}</span>
              <span className="text-sm font-medium text-foreground">
                {method.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3 p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 mt-1"
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground">
          Я погоджуюсь з умовами користування та політикою конфіденційності
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!amount || !agreed}
        className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-lg py-3"
      >
        Продовжити оплату
      </Button>

      {/* Info */}
      <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          Комісія платежів залежить від обраного способу оплати. Зазвичай від 1% до 5%.
        </p>
      </div>
    </form>
  );
}
