'use client';

import { useState } from 'react';
import { formatAmountWithSign, formatAmount } from '@/lib/format-amount';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface TransactionDetailClientProps {
  transaction: any;
  invoice: any;
  otherCustomer: any;
  isIncoming: boolean;
  dateTime: { date: string; time: string };
  customer: any;
}

export function TransactionDetailClient({
  transaction,
  invoice,
  otherCustomer,
  isIncoming,
  dateTime,
  customer,
}: TransactionDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'invoice'>('details');

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      {/* Amount Display Card */}
      <div className="p-6 rounded-2xl border border-foreground/10 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Сума
            </p>
            <p className={`text-4xl font-bold ${
              isIncoming ? 'text-foreground' : 'text-foreground'
            }`}>
              {formatAmountWithSign(transaction.amount, isIncoming)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Валюта
            </p>
            <p className="text-lg font-semibold text-foreground">INPOM</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      {otherCustomer && (
        <div className="p-5 rounded-2xl border border-foreground/10 flex items-center gap-4">
          <div className="flex-shrink-0">
            {otherCustomer.avatar_url ? (
              <Image
                src={otherCustomer.avatar_url}
                alt={otherCustomer.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-foreground">
                  {getAvatarInitials(otherCustomer.name)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {transaction.type === 'payment_sent' ? 'Одержувач' : 'Плательщик'}
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {otherCustomer.name}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-foreground/5 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'details'
              ? 'bg-foreground/10 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Деталі
        </button>
        {invoice && (
          <button
            onClick={() => setActiveTab('invoice')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'invoice'
                ? 'bg-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Інвойс
          </button>
        )}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-0.5 rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
          <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
            <p className="text-sm text-muted-foreground">Дата</p>
            <p className="text-sm font-medium text-foreground">{dateTime.date}</p>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
            <p className="text-sm text-muted-foreground">Час</p>
            <p className="text-sm font-medium text-foreground">{dateTime.time}</p>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
            <p className="text-sm text-muted-foreground">ID транзакції</p>
            <p className="text-sm font-medium text-foreground font-mono">#{transaction.id}</p>
          </div>

          {transaction.description && (
            <div className="p-4 flex flex-col gap-1 hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Опис</p>
              <p className="text-sm font-medium text-foreground">{transaction.description}</p>
            </div>
          )}

          <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
            <p className="text-sm text-muted-foreground">Тип операції</p>
            <p className="text-sm font-medium text-foreground">
              {transaction.type === 'payment_sent' ? 'Оплачено' : 
               transaction.type === 'payment_received' ? 'Отримано' :
               transaction.type === 'deposit' ? 'Депозит' :
               transaction.type === 'withdraw' ? 'Вивід' : transaction.type}
            </p>
          </div>
        </div>
      )}

      {/* Invoice Tab */}
      {activeTab === 'invoice' && invoice && (
        <div className="space-y-0.5 rounded-2xl border border-foreground/10 overflow-hidden divide-y divide-foreground/10">
          <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
            <p className="text-sm text-muted-foreground">Статус</p>
            <p className={`text-sm font-medium ${
              invoice.status === 'paid' ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {invoice.status === 'paid' ? '✓ Оплачено' : '⏳ Очікує'}
            </p>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
            <p className="text-sm text-muted-foreground">Сума</p>
            <p className="text-sm font-medium text-foreground">{formatAmount(invoice.amount)} INPOM</p>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
            <p className="text-sm text-muted-foreground">Створено</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(invoice.created_at).toLocaleDateString('uk-UA')}
            </p>
          </div>

          {invoice.expires_at && (
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Дійсна до</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(invoice.expires_at).toLocaleDateString('uk-UA')}
              </p>
            </div>
          )}

          {invoice.description && (
            <div className="p-4 flex flex-col gap-1 hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Опис</p>
              <p className="text-sm font-medium text-foreground">{invoice.description}</p>
            </div>
          )}

          {invoice.creator_name && (
            <div className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <p className="text-sm text-muted-foreground">Автор</p>
              <p className="text-sm font-medium text-foreground">{invoice.creator_name}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="p-4">
            <Link
              href={
                transaction.type === 'payment_sent'
                  ? `/mycabinet/pay-invoice/${invoice.id}`
                  : `/mycabinet/invoices/${invoice.id}`
              }
            >
              <button className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {transaction.type === 'payment_sent'
                  ? 'Переглянути статус'
                  : 'Переглянути інвойс'}
                <ExternalLink className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Back Button */}
      <Link href="/mycabinet/transactions">
        <button className="w-full px-4 py-3 rounded-lg border border-foreground/10 text-foreground font-medium text-sm hover:bg-foreground/5 transition-colors">
          Повернутись до історії
        </button>
      </Link>
    </div>
  );
}
