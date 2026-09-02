'use client';

import { ArrowDown, ArrowUp, Banknote, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatAmount } from '@/lib/format-amount';
import { useState, useEffect } from 'react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
  other_customer_name?: string;
  other_customer_avatar?: string;
  status?: string;
  donation_reference?: string;
}

interface ActivitySectionProps {
  transactions: Transaction[];
  customerId?: number;
  cardId?: number;
}

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateStr = date.toLocaleDateString('uk-UA');
    return { time, date: dateStr };
  } catch {
    return { time: '', date: dateString };
  }
};

const getTransactionTitle = (type: string): string => {
  const titles: Record<string, string> = {
    deposit: 'Депозит балансу',
    payment_received: 'Оплата Інвойсу',
    payment_sent: 'Оплата Інвойсу',
    invoice: 'Інвойс',
    withdraw: 'Вивід',
    donation_pending: 'Пожертва INPOM',
  };
  
  for (const [key, title] of Object.entries(titles)) {
    if (type.includes(key)) return title;
  }
  return type.replace(/_/g, ' ');
};

const getTransactionIcon = (type: string) => {
  if (type.includes('deposit')) return <ArrowDown className="w-5 h-5" />;
  if (type.includes('payment_received') || type.includes('invoice')) return <Banknote className="w-5 h-5" />;
  if (type.includes('payment_sent') || type.includes('withdraw') || type.includes('donation')) return <ArrowUp className="w-5 h-5" />;
  return <TrendingUp className="w-5 h-5" />;
};

export function ActivitySection({ transactions, customerId, cardId }: ActivitySectionProps) {
  const isIncome = (type: string) =>
    type.includes('deposit') || type.includes('payment_received');

  const [tab, setTab] = useState<'transactions' | 'invoices'>('transactions');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    if (tab !== 'invoices') return;
    if (!customerId) {
      setInvoices([]);
      return;
    }
    let cancelled = false;
    setLoadingInvoices(true);
    fetch(`/api/invoices?customerId=${customerId}&limit=20`)
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((data) => {
        if (cancelled) return;
        const list = (data && (data.invoices || data.items || data)) || [];
        // If caller provided a cardId, filter invoices by creator_card_id when available
        const filtered = cardId
          ? list.filter((inv: any) => inv.creator_card_id === cardId)
          : list;
        setInvoices(filtered || []);
      })
      .catch(() => {
        if (cancelled) return;
        setInvoices([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingInvoices(false);
      });
    return () => { cancelled = true; };
  }, [tab, customerId, cardId]);

  return (
    <motion.div
      className="space-y-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Tabs */}
      <div className="flex items-center justify-center px-4 gap-4 pt-4">
        <button
          onClick={() => setTab('transactions')}
          className={`pt-2 px-4 pb-3 rounded-full ${tab === 'transactions' ? 'bg-card text-foreground dark:text-white' : 'text-muted-foreground'}`}
        >
          Транзакції
        </button>
        <button
          onClick={() => setTab('invoices')}
          className={`pt-2 px-4 pb-3 rounded-full ${tab === 'invoices' ? 'bg-card text-foreground dark:text-white' : 'text-muted-foreground'}`}
        >
          Інвойси
        </button>
      </div>

      {/* Content */}
      <div className="space-y-md px-sm">
        {tab === 'transactions' ? (
          // show up to 5 transactions preview
          (transactions || []).slice(0, 5).map((transaction, index) => {
            const { time, date } = formatDateTime(transaction.created_at);
            const income = isIncome(transaction.type);

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/mycabinet/transactions/${transaction.id}`}>
                  <div className="group relative overflow-hidden ">
                    {/* Background border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Card */}
                    <div className="relative p-4 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        {/* Icon Container */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          income 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-semibold text-sm truncate">
                            {getTransactionTitle(transaction.type)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {transaction.type === 'donation_pending' ? `Очікує перевірки · ${transaction.donation_reference || 'INPOM'}` : (transaction.description || 'inpom')}
                          </p>
                        </div>

                        {/* Right Content */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className={`font-bold text-sm ${
                            income ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {income ? '+' : '-'}
                            {formatAmount(transaction.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {time}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Date */}
                      <div className="mt-3 pt-3 border-t border-foreground/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {transaction.other_customer_avatar ? (
                            <Image
                              src={transaction.other_customer_avatar}
                              alt={transaction.other_customer_name || 'User'}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground truncate">
                            {transaction.other_customer_name || 'Unknown'}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {date}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        ) : (
          // invoices preview (caller should pass cardId via prop; we'll attempt to fetch from /api/invoices)
          loadingInvoices ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Завантаження інвойсів...</div>
          ) : invoices.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Немає інвойсів</div>
          ) : (
            invoices.slice(0, 5).map((inv: any, idx: number) => {
              const created = inv.created_at || inv.created || new Date().toISOString();
              const { time, date } = formatDateTime(created);
              return (
                <Link key={inv.id || idx} href={`/mycabinet/invoices/${inv.id}`} className="block">
                  <div className="group relative overflow-hidden">
                    <div className="relative p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-foreground/10 text-foreground`}>
                          <Banknote className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-semibold text-sm truncate">{inv.title || 'Інвойс'}</p>
                          <p className="text-xs text-muted-foreground truncate">{inv.description || 'Опис відсутній'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className={`font-bold text-sm text-foreground`}>{formatAmount(inv.amount || 0)}</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )
        )}
      </div>
    </motion.div>
  );
}
