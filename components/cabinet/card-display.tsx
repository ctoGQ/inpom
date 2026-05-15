'use client';

import { CreditCard } from 'lucide-react';
import { formatAmount } from '@/lib/format-amount';

interface CardDisplayProps {
  cardType: string;
  balance: number;
  customerName: string;
}

export function CardDisplay({
  cardType,
  balance,
  customerName,
}: CardDisplayProps) {
  const getCardColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'black':
        return 'bg-gradient-to-br from-foreground/90 to-foreground/70';
      case 'gold':
        return 'bg-gradient-to-br from-amber-500 to-amber-700';
      case 'business plus':
        return 'bg-gradient-to-br from-purple-500 to-purple-700';
      default:
        return 'bg-gradient-to-br from-foreground/90 to-foreground/70';
    }
  };

  const getCardTextColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gold':
        return 'text-foreground';
      case 'business plus':
        return 'text-foreground';
      default:
        return 'text-primary';
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-6 shadow-lg overflow-hidden ${getCardColor(
        cardType
      )}`}
    >
      {/* Card background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>

      {/* Card content */}
      <div className="relative z-10 flex flex-col justify-between h-48">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs font-medium opacity-75 ${getCardTextColor(cardType)}`}>
              INPOM CARD
            </p>
            <h3 className={`text-lg font-display mt-1 ${getCardTextColor(cardType)}`}>
              {cardType.charAt(0).toUpperCase() + cardType.slice(1)}
            </h3>
          </div>
          <CreditCard className={`w-6 h-6 ${getCardTextColor(cardType)}`} />
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <p className={`text-xs opacity-75 ${getCardTextColor(cardType)}`}>БАЛАНС</p>
          <p className={`text-3xl font-display ${getCardTextColor(cardType)}`}>
            {formatAmount(balance)}
          </p>
          <p className={`text-xs ${getCardTextColor(cardType)}`}>inpom</p>
        </div>

        {/* Footer */}
        <div className={`text-xs ${getCardTextColor(cardType)}`}>
          {customerName}
        </div>
      </div>
    </div>
  );
}
