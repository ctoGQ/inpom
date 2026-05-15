'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: number;
  type: string;
  amount: number | string;
  description: string;
  created_at: string;
  invoice_id?: number;
}

interface Invoice {
  id: number;
  creator_customer_id: number;
  amount: number | string;
  description: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface CabinetTabsProps {
  transactions: Transaction[];
  invoices: Invoice[];
}

export function CabinetTabs({ transactions, invoices }: CabinetTabsProps) {
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
    <div className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display text-foreground">
          Активність
        </h2>
        <Link href="/mycabinet/transactions">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Більше
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">
            Транзакції
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Інвойси
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction: Transaction) => (
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
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {transaction.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(transaction.created_at).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
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
                        {typeof transaction.amount === 'number'
                          ? transaction.amount.toFixed(2)
                          : parseFloat(transaction.amount as string).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">inpom</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-foreground/5 border border-foreground/10 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Немає транзакцій
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice: Invoice) => {
                const isExpired = invoice.expires_at && new Date(invoice.expires_at) < new Date();
                const isPaid = invoice.status === 'paid';

                return (
                  <Link
                    key={invoice.id}
                    href={`/mycabinet/invoices/${invoice.id}`}
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center justify-between p-4 bg-foreground/5 border border-foreground/10 rounded-lg hover:bg-foreground/10 hover:border-foreground/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            Invoice #{invoice.id}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isPaid
                                ? 'bg-green-500/20 text-green-600'
                                : isExpired
                                ? 'bg-red-500/20 text-red-600'
                                : 'bg-blue-500/20 text-blue-600'
                            }`}
                          >
                            {isPaid ? 'Оплачено' : isExpired ? 'Закінчилось' : 'Очікує'}
                          </span>
                        </div>
                        {invoice.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {invoice.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(invoice.created_at).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-foreground">
                          {typeof invoice.amount === 'number'
                            ? invoice.amount.toFixed(2)
                            : parseFloat(invoice.amount as string).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">inpom</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-foreground/5 border border-foreground/10 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Немає інвойсів
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
