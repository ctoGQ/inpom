'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentConfirmProps {
  invoiceId: number;
  amount: number;
  creatorName: string;
  customerId: number;
  isExpired: boolean;
  isAlreadyPaid: boolean;
}

export function PaymentConfirm({
  invoiceId,
  amount,
  creatorName,
  customerId,
  isExpired,
  isAlreadyPaid,
}: PaymentConfirmProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'confirm' | 'confirming' | 'done'>('confirm');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user balance
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const response = await fetch(`/api/balance?customerId=${customerId}`);
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance ?? 0);
        }
      } catch (error) {
        console.error('Error loading balance:', error);
        setBalance(0);
      }
    };

    loadBalance();
  }, [customerId]);

  const handlePayment = async () => {
    if (balance === null || balance < amount) {
      toast({
        title: 'Недостатньо коштів',
        description: `Потрібно ${amount.toFixed(2)} inpom, а у вас ${balance?.toFixed(2) ?? '0.00'} inpom`,
        variant: 'destructive',
      });
      return;
    }

    setStep('confirming');
    setLoading(true);

    try {
      const response = await fetch('/api/invoices/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          payerCustomerId: customerId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('done');
        toast({
          title: 'Оплата успішна',
          description: 'Ваша оплата була оброблена',
        });

        // Redirect to transactions after 2 seconds
        setTimeout(() => {
          router.push(`/mycabinet/transactions`);
        }, 2000);
      } else {
        setStep('confirm');
        const errorMessage = data.error || 'Не вдалось обробити оплату';
        toast({
          title: 'Помилка при оплаті',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setStep('confirm');
      console.error('Error processing payment:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при обробці платежу. Спробуйте пізніше',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-green-500/10 border border-green-500/20 rounded-lg space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <div>
            <p className="text-lg font-medium text-green-600">Оплата успішна!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Перенаправлення до транзакцій...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Термін закінчився</p>
            <p className="text-xs text-muted-foreground mt-1">
              Цей інвойс більше недійсний
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAlreadyPaid) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-500">Оплачено</p>
            <p className="text-xs text-muted-foreground mt-1">
              Цей інвойс уже оплачений
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confirmation Summary */}
      <div className="p-6 bg-foreground/5 border border-foreground/10 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-foreground">
          Підтвердження платежу
        </h3>

        <div className="space-y-3 py-4 border-t border-b border-foreground/10">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Сума платежу</p>
            <p className="text-lg font-semibold text-foreground">
              {amount.toFixed(2)} inpom
            </p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Кому</p>
            <p className="text-sm font-medium text-foreground">{creatorName}</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Ваш баланс</p>
            <p className={`text-sm font-medium ${balance !== null && balance >= amount ? 'text-green-500' : 'text-red-500'}`}>
              {balance !== null ? `${balance.toFixed(2)} inpom` : 'Загрузка...'}
            </p>
          </div>
        </div>

        {balance !== null && balance < amount && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-600">Недостатньо коштів</p>
              <p className="text-xs text-red-500 mt-1">
                Потрібно {(amount - balance).toFixed(2)} inpom більше
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Після підтвердження оплати сума буде списана з вашого балансу та переведена отримувачу.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={handlePayment}
          disabled={loading || balance === null || balance < amount}
          className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Обробка платежу...' : 'Підтвердити оплату'}
        </Button>

        <Button
          onClick={() => window.history.back()}
          variant="outline"
          disabled={loading}
          className="w-full"
        >
          Скасувати
        </Button>
      </div>

      {/* Warning */}
      <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <p className="text-xs font-medium text-foreground mb-2">Увага:</p>
        <p className="text-xs text-muted-foreground">
          Будьте впевнені перед підтвердженням. Платіж буде оброблено негайно і не може бути скасований.
        </p>
      </div>
    </div>
  );
}
