'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, CheckCircle2, ArrowRight, Download, Share2 } from 'lucide-react';
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Інвойс для оплати',
          text: `Оплатіть інвойс на суму ${formatAmount(amount)} INPOM`,
          url: paymentUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      {/* Status Badge */}
      {status === 'pending' && (
        <div className="flex justify-between items-center gap-2 p-3 rounded-xl bg-muted/30">
          <div className="items-center flex gap-2">
            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Очікує оплату</span>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-md font-bold text-foreground">
            {formatAmount(amount)}
            </span>
            <span className="text-sm text-muted-foreground">inpom</span>
          </div>
        </div>
      )}
      {status === 'paid' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
          <CheckCircle2 className="w-4 h-4 text-foreground" />
          <span className="text-sm text-foreground">✓ Оплачено</span>
        </div>
      )}

      

      {/* QR Code Section */}
      <div className="space-y-4">
        <div className="flex justify-center p-6 bg-white rounded-xl" ref={qrRef}>
          <QRCodeCanvas
            value={paymentUrl}
            size={256}
            level="H"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadQR}
            className="px-4 py-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Завантажити</span>
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Поділитися</span>
          </button>
        </div>
      </div>

      {/* Copy URL Section 
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Або поділіться посиланням
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={paymentUrl}
            readOnly
            className="flex-1 px-0 py-2 bg-transparent border-0 text-sm text-foreground truncate focus:outline-none focus:ring-0"
          />
          <button
            onClick={handleCopyUrl}
            className="px-4 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>*/}

      {/* Navigation */}
      {status === 'pending' && (
        <Link href={`/mycabinet/invoices/${invoiceId}`}>
          <button className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2">
            Переглянути інвойс
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      )}

      {/* Invoice Details */}
      <div className="space-y-1">
        

        {description && (
          <div className="pt-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Опис</p>
            <span className="text-lg text-foreground">{description}</span>
          </div>
        )}
        <div className="pt-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Виставлено</p>
          <p className="text-sm text-foreground">{creatorName}</p>
        </div>
      </div>

      
    </div>
  );
}
