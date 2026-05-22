'use client';

import React, { useState } from 'react';
import { CardSlider } from './card-slider';
import { ActivitySection } from './activity-section';

interface CardData {
  id: number;
  card_type: string;
  balance: number;
  customer_id: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
}

interface CardSliderWrapperProps {
  cards: CardData[];
  customerId: number;
  initialTransactions: Transaction[];
}

export function CardSliderWrapper({
  cards,
  customerId,
  initialTransactions,
}: CardSliderWrapperProps) {
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || 0);
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCardChange = async (cardId: number) => {
    setSelectedCardId(cardId);
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/transactions?cardId=${cardId}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('[v0] Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-lg px-sm">
      <CardSlider cards={cards} onCardChange={handleCardChange} />
      {isLoading ? (
        <div className="space-y-md">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="cabinet-skeleton h-16 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <ActivitySection transactions={transactions} />
      )}
    </div>
  );
}
