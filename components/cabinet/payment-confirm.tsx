'use client';

import { useState } from 'react';
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
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
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
          description: 'Ваша оплата була обробленаф',
        });

        // Redirect to transactions after 2 seconds
        setTimeout(() => {
          router.push(`/mycabinet/transactions`);
        }, 2000);
      } else {
        setStep('confirm');
        toast({
          title: 'Помилка при оплаті',
          description: data.error || 'Не вдалось обробити оплату',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setStep('confirm');
      console.error('Error processing payment:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при обробці платежу',
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
            <p className="text-sm text-muted-foreground">Сума оплати</p>
            <p className="text-lg font-semibold text-foreground">
              {amount.toFixed(2)} inpom
            </p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Кому</p>
            <p className="text-sm font-medium text-foreground">{creatorName}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Після підтвердження оплати сума буде списана з вашого балансу та переведена отримувачу.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={handlePayment}
          disabled={loading}
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
