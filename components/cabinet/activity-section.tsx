'use client';

import { ArrowDown, ArrowUp, Banknote, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatAmount } from '@/lib/format-amount';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
}

interface ActivitySectionProps {
  transactions: Transaction[];
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

const getTransactionIcon = (type: string) => {
  if (type.includes('deposit') || type.includes('payment_received')) {
    return <ArrowDown className="w-6 h-6" />;
  } else if (type.includes('invoice')) {
    return <Banknote className="w-6 h-6" />;
  } else if (type.includes('withdraw') || type.includes('payment_sent')) {
    return <ArrowUp className="w-6 h-6" />;
  }
  return <TrendingUp className="w-6 h-6" />;
};

const getTransactionTitle = (type: string): string => {
  const titles: Record<string, string> = {
    deposit: 'Депозит балансу',
    payment_received: 'Оплата Інвойсу',
    payment_sent: 'Оплата Інвойсу',
    invoice: 'Інвойс',
    withdraw: 'Вивід',
  };
  
  for (const [key, title] of Object.entries(titles)) {
    if (type.includes(key)) return title;
  }
  return type.replace(/_/g, ' ');
};

export function ActivitySection({ transactions }: ActivitySectionProps) {
  const isIncome = (type: string) =>
    type.includes('deposit') || type.includes('payment_received');

  if (transactions.length === 0) {
    return (
      <motion.div
        className="space-y-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between px-sm">
          <h2 className="text-h3">Активність</h2>
          <span className="text-sm text-muted-foreground">↗°</span>
        </div>

        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4">
            <Banknote className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold mb-1">Немає транзакцій</p>
          <p className="text-sm text-muted-foreground">Ваша історія операцій з'явиться тут</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-h3">Активність</h2>
      </div>

      {/* Transactions List */}
      <div className="space-y-md px-sm">
        {transactions.map((transaction, index) => {
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
                <div className="group relative overflow-hidden rounded-2xl">
                  {/* Background border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Card */}
                  <div className="relative bg-card border border-foreground/10 rounded-2xl p-4 hover:border-foreground/20 transition-all duration-300">
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
                          {transaction.description || 'inpom'}
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
                    <div className="mt-3 pt-3 border-t border-foreground/5">
                      <p className="text-xs text-muted-foreground text-right">
                        {date}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
