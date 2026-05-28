'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatAmount } from '@/lib/format-amount';
import Link from 'next/link';

interface InvoiceDisplayProps {
  invoiceId: number;
  amount: number;
  description?: string;
  creatorName: string;
  paymentUrl: string;
  status: string;
}

export function InvoiceDisplay({
  invoiceId,
  amount,
  description,
  creatorName,
  paymentUrl,
  status,
}: InvoiceDisplayProps) {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast({
        title: 'Скопійовано',
        description: 'Посилання скопійовано до буферу обміну',
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалось скопіювати посилання',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadQR = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `invoice-${invoiceId}-qr.png`;
        link.click();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      {status === 'pending' && (
        <div className="flex items-center gap-2 p-4 rounded-2xl border border-foreground/10 bg-card">
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Очікує оплату</span>
        </div>
      )}
      {status === 'paid' && (
        <div className="flex items-center gap-2 p-4 rounded-2xl border border-foreground/10 bg-card">
          <CheckCircle2 className="w-4 h-4 text-foreground" />
          <span className="text-sm text-foreground">✓ Оплачено</span>
        </div>
      )}

      {/* Invoice Details */}
      <div className="p-6 rounded-2xl border border-foreground/10 space-y-4">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">СУМА ІНВОЙСА</p>
          <p className="text-5xl font-bold text-foreground">
            {formatAmount(amount)}
          </p>
          <p className="text-sm text-muted-foreground">inpom</p>
        </div>

        <div className="pt-4 border-t border-foreground/10 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ВИСТАВЛЕНО</p>
          <p className="text-sm text-foreground">{creatorName}</p>
        </div>

        {description && (
          <div className="pt-4 border-t border-foreground/10 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ОПИС</p>
            <p className="text-sm text-foreground">{description}</p>
          </div>
        )}
      </div>

      {/* QR Code Section */}
      <div className="p-6 rounded-2xl border border-foreground/10 space-y-4">
        <p className="text-sm font-semibold text-foreground text-center uppercase tracking-wide">
          QR-КОД ДЛЯ СКАНУВАННЯ
        </p>
        <div className="flex justify-center p-6 bg-card rounded-lg border border-foreground/10" ref={qrRef}>
          <QRCodeCanvas
            value={paymentUrl}
            size={256}
            level="H"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
        <Button
          onClick={handleDownloadQR}
          variant="outline"
          className="w-full border-foreground/10 text-foreground hover:bg-muted"
        >
          Завантажити QR-код
        </Button>
      </div>

      {/* Copy URL Section */}
      <div className="space-y-3 rounded-2xl border border-foreground/10 p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          АБО ПОДІЛІТЬСЯ ПОСИЛАННЯМ
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={paymentUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground truncate"
          />
          <Button
            onClick={handleCopyUrl}
            variant="outline"
            size="icon"
            className="flex-shrink-0 border-foreground/10"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      {status === 'pending' && (
        <Link href={`/mycabinet/invoices/${invoiceId}`}>
          <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
            Переглянути інвойс
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      )}
    </div>
  );
}
