'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAmount } from '@/lib/format-amount';

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
    <div className="cabinet-section p-lg">
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-h3">
          Активність
        </h2>
        <Link href="/mycabinet/transactions">
          <Button
            className="cabinet-button cabinet-button-ghost text-small"
          >
            Більше
            <ArrowRight className="w-4 h-4 ml-md" />
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="cabinet-tabs">
          <TabsTrigger value="transactions" className="cabinet-tab">
            Транзакції
          </TabsTrigger>
          <TabsTrigger value="invoices" className="cabinet-tab">
            Інвойси
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-lg">
          {transactions.length > 0 ? (
            <div className="cabinet-list">
              {transactions.map((transaction: Transaction) => (
                <Link
                  key={transaction.id}
                  href={`/mycabinet/transactions/${transaction.id}`}
                  className="cabinet-list-item"
                >
                  <div className="cabinet-list-item-main">
                    <p className="cabinet-list-item-title capitalize">
                      {transaction.type.replace(/_/g, ' ')}
                    </p>
                    {transaction.description && (
                      <p className="cabinet-list-item-subtitle truncate">
                        {transaction.description}
                      </p>
                    )}
                    <p className="cabinet-list-item-subtitle mt-md">
                      {new Date(transaction.created_at).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                  <div className="cabinet-list-item-amount">
                    <p
                      className={`${
                        transaction.type.includes('deposit') ||
                        transaction.type.includes('payment_received')
                          ? 'text-success'
                          : 'text-destructive'
                      }`}
                    >
                      {transaction.type.includes('deposit') ||
                      transaction.type.includes('payment_received')
                        ? '+'
                        : '-'}
                      {formatAmount(transaction.amount)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="cabinet-empty-state">
              <p className="cabinet-empty-state-description">
                Немає транзакцій
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-lg">
          {invoices.length > 0 ? (
            <div className="cabinet-list">
              {invoices.map((invoice: Invoice) => {
                const isExpired = invoice.expires_at && new Date(invoice.expires_at) < new Date();
                const isPaid = invoice.status === 'paid';

                return (
                  <Link
                    key={invoice.id}
                    href={`/mycabinet/invoices/${invoice.id}`}
                    className="cabinet-list-item"
                  >
                    <div className="cabinet-list-item-main">
                      <div className="flex items-center gap-sm">
                        <p className="cabinet-list-item-title">
                          Invoice #{invoice.id}
                        </p>
                        <span
                          className={`cabinet-list-item-status ${
                            isPaid
                              ? 'completed'
                              : isExpired
                              ? 'failed'
                              : 'pending'
                          }`}
                        >
                          {isPaid ? 'Оплачено' : isExpired ? 'Закінчилось' : 'Очікує'}
                        </span>
                      </div>
                      {invoice.description && (
                        <p className="cabinet-list-item-subtitle truncate">
                          {invoice.description}
                        </p>
                      )}
                      <p className="cabinet-list-item-subtitle mt-md">
                        {new Date(invoice.created_at).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                    <div className="cabinet-list-item-amount">
                      <p className="font-medium">
                        {formatAmount(invoice.amount)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="cabinet-empty-state">
              <p className="cabinet-empty-state-description">
                Немає інвойсів
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
