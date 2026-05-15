'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-sm text-yellow-600">Очікує оплату</span>
        </div>
      )}
      {status === 'paid' && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">Оплачено</span>
        </div>
      )}

      {/* Invoice Details */}
      <div className="p-6 bg-foreground/5 border border-foreground/10 rounded-lg">
        <div className="text-center space-y-3">
          <p className="text-xs font-medium text-muted-foreground">СУМА ІНВОЙСА</p>
          <p className="text-5xl font-display text-foreground">
            {typeof amount === 'number' ? amount.toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-muted-foreground">inpom</p>
        </div>

        <div className="pt-6 mt-6 border-t border-foreground/10 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">ВИСТАВЛЕНО</p>
          <p className="text-base text-foreground">{creatorName}</p>
        </div>

        {description && (
          <div className="pt-6 mt-6 border-t border-foreground/10 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">ОПИС</p>
            <p className="text-sm text-foreground">{description}</p>
          </div>
        )}
      </div>

      {/* QR Code Section */}
      <div className="p-6 bg-foreground/5 border border-foreground/10 rounded-lg">
        <p className="text-sm font-medium text-foreground mb-4 text-center">
          QR-КОД ДЛЯ СКАНУВАННЯ
        </p>
        <div className="flex justify-center p-6 bg-white rounded-lg" ref={qrRef}>
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
          className="w-full mt-4"
        >
          Завантажити QR-код
        </Button>
      </div>

      {/* Copy URL Section */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          АБО ПОДІЛІТЬСЯ ПОСИЛАННЯМ
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={paymentUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground truncate"
          />
          <Button
            onClick={handleCopyUrl}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      {status === 'pending' && (
        <Link href={`/mycabinet/invoices/${invoiceId}`}>
          <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
            Переглянути інвойс
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      )}
      {status === 'paid' && (
        <Link href={`/mycabinet/invoices/${invoiceId}`}>
          <Button variant="outline" className="w-full">
            Переглянути інвойс (оплачено)
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      )}
    </div>
  );
}
