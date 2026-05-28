'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Building2, Loader } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-6 px-4">
      {/* Personal Info Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Особисті дані</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ім'я"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            />
            <input
              type="text"
              placeholder="Прізвище"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Amount Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Сума вивода</h3>
        
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2 block">
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
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-2xl font-bold text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Доступно: {availableBalance.toFixed(2)} INPOM</p>
        </div>

        {/* Quick Amounts */}
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3 block">Швидкі суми</p>
          <div className="grid grid-cols-2 gap-2">
            {[100, 500, 1000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                disabled={val > availableBalance}
                className="px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Commission Breakdown */}
        {amountNum > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Сума:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{amountNum.toFixed(2)} INPOM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Комісія (20%):</span>
              <span className="font-semibold text-red-500 dark:text-red-400">-{commission.toFixed(2)} INPOM</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Ви отримаєте:</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{resultAmount.toFixed(2)} INPOM</span>
            </div>
          </div>
        )}
      </div>

      {/* Method Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Спосіб вивода</h3>

        <div className="flex gap-3 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setWithdrawMethod('card')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              withdrawMethod === 'card'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-gray-200 dark:border-slate-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Карта
          </button>
          <button
            type="button"
            onClick={() => setWithdrawMethod('iban')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              withdrawMethod === 'iban'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-gray-200 dark:border-slate-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200'
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
              maxLength={19}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 font-mono"
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
              maxLength={5}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 font-mono"
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
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 font-mono"
            />
            <input
              type="text"
              placeholder="Назва банку"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            />
            <input
              type="text"
              placeholder="Swift Code"
              value={swiftCode}
              onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 font-mono"
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3 block">
          Примітка (опціонально)
        </label>
        <textarea
          placeholder="Додайте будь-яку додаткову інформацію..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 resize-none"
        />
      </div>

      {/* Agreement */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 mt-1 accent-slate-600 cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Я погоджуюсь з умовами користування. Розумію, що комісія платформи 20% буде утримана з суми вивода. Гарантую, що реквізити належать мені.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!canSubmit() || isLoading}
        className="w-full px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-900 active:scale-95 flex items-center justify-center gap-2"
      >
        {isLoading && <Loader className="w-5 h-5 animate-spin" />}
        {resultAmount > 0 ? `Вивести ${resultAmount.toFixed(2)} INPOM` : 'Вивести коштиы'}
      </button>

      <div className="pb-12" />
    </form>
  );
}
