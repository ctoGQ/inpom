'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { formatAmount } from '@/lib/format-amount';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
}

interface Invoice {
  id: number;
  creator_customer_id: number;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface TransactionInvoiceTabsProps {
  transactions: Transaction[];
  invoices: Invoice[];
}

const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('uk-UA');
    const timeStr = date.toLocaleTimeString('uk-UA');
    return `${dateStr} в ${timeStr}`;
  } catch {
    return dateString;
  }
};

export function TransactionInvoiceTabs({ transactions, invoices }: TransactionInvoiceTabsProps) {
  const [activeTab, setActiveTab] = useState('transactions');

  const getInvoiceLink = (transaction: Transaction): string | null => {
    if (!transaction.invoice_id) return null;
    if (transaction.type === 'payment_sent') {
      return `/mycabinet/pay-invoice/${transaction.invoice_id}`;
    } else if (transaction.type === 'payment_received') {
      return `/mycabinet/invoices/${transaction.invoice_id}`;
    }
    return null;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="transactions">
          Трансакції ({transactions.length})
        </TabsTrigger>
        <TabsTrigger value="invoices">
          Інвойси ({invoices.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="transactions" className="space-y-3">
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Link
                key={transaction.id}
                href={`/mycabinet/transactions/${transaction.id}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center justify-between p-4 bg-foreground/5 border border-foreground/10 rounded-lg hover:bg-foreground/10 hover:border-foreground/20 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground capitalize">
                      {transaction.type.replace(/_/g, ' ')}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDateTime(transaction.created_at)}
                    </p>
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          transaction.type.includes('deposit') ||
                          transaction.type.includes('payment_received')
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {transaction.type.includes('deposit') ||
                        transaction.type.includes('payment_received')
                          ? '+'
                          : '-'}
                        {formatAmount(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">inpom</p>
                    </div>
                    {transaction.invoice_id && getInvoiceLink(transaction) && (
                      <Link
                        href={getInvoiceLink(transaction)!}
                        className="flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          title={
                            transaction.type === 'payment_sent'
                              ? 'Переглянути статус оплати'
                              : 'Переглянути інвойс'
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Жодних трансакцій досі
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="invoices" className="space-y-3">
        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((invoice) => {
              const isExpired = (() => {
                try {
                  return new Date(invoice.expires_at) < new Date();
                } catch {
                  return false;
                }
              })();

              return (
                <Link
                  key={invoice.id}
                  href={`/mycabinet/invoices/${invoice.id}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center justify-between p-4 bg-foreground/5 border border-foreground/10 rounded-lg hover:bg-foreground/10 hover:border-foreground/20 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Інвойс #{invoice.id}
                      </p>
                      {invoice.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {invoice.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(invoice.created_at)}
                      </p>
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatAmount(invoice.amount)}
                        </p>
                        <p
                          className={`text-xs font-medium mt-1 ${
                            invoice.status === 'paid'
                              ? 'text-green-500'
                              : invoice.status === 'expired'
                                ? 'text-red-500'
                                : 'text-yellow-500'
                          }`}
                        >
                          {invoice.status === 'paid'
                            ? '✓ Оплачено'
                            : invoice.status === 'expired'
                              ? '✗ Закінчився'
                              : '⏳ Очікує'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">inpom</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Жодних інвойсів досі
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
