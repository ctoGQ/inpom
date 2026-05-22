'use client';

import { motion } from 'framer-motion';
import { formatAmount } from '@/lib/format-amount';
import { ArrowDown, ArrowUp, Banknote } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

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

export function ActivitySection({ transactions }: ActivitySectionProps) {
  const getTransactionIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('deposit') || lowerType.includes('in')) {
      return ArrowDown;
    } else if (lowerType.includes('invoice') || lowerType.includes('sent')) {
      return Banknote;
    } else {
      return ArrowUp;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), {
        addSuffix: true,
        locale: uk,
      });
    } catch {
      return dateString;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  if (transactions.length === 0) {
    return (
      <div className="cabinet-empty-state">
        <div className="cabinet-empty-state-icon mx-auto">
          <Banknote className="w-12 h-12" />
        </div>
        <h3 className="cabinet-empty-state-title">Немає транзакцій</h3>
        <p className="cabinet-empty-state-description">
          Ваша історія транзакцій з&apos;явиться тут
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-h3 font-semibold">Активність</h3>
        <motion.button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ scale: 1.1 }}
        >
          сортування
        </motion.button>
      </div>

      {/* Transactions List */}
      <motion.div
        className="space-y-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {transactions.map((transaction) => {
          const Icon = getTransactionIcon(transaction.type);
          const isIncoming = transaction.amount >= 0;

          return (
            <motion.div
              key={transaction.id}
              variants={itemVariants}
              className="cabinet-list-item group"
              whileHover={{ x: 4 }}
            >
              {/* Left: Icon */}
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${isIncoming ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${isIncoming ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              </div>

              {/* Middle: Transaction Info */}
              <div className="flex-1 min-w-0 mx-3">
                <h4 className="cabinet-list-item-title truncate">
                  {transaction.description}
                </h4>
                <p className="cabinet-list-item-subtitle text-xs">
                  {formatDate(transaction.created_at)}
                </p>
              </div>

              {/* Right: Amount */}
              <div className="flex-shrink-0 text-right">
                <p className={`font-bold text-sm ${getTransactionColor(transaction.amount)}`}>
                  {isIncoming ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
                </p>
                <p className="text-xs text-muted-foreground">inpom</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
