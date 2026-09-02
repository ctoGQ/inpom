'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CardSlider } from './card-slider';
import { ActivitySection } from './activity-section';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DesktopCardOverview } from './desktop-card-overview';

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
  other_customer_name?: string;
  other_customer_avatar?: string;
}

interface CardSliderWrapperProps {
  cards: CardData[];
  customerId: number;
  initialTransactions: Transaction[];
  customerAvatar?: string;
  customerName?: string;
}

export function CardSliderWrapper({
  cards,
  customerId,
  initialTransactions,
  customerAvatar,
  customerName,
}: CardSliderWrapperProps) {
  // Build display slides: ensure GOLD and BUSINESS_PLUS offer slides exist even if user doesn't own them
  const displayCards = useMemo(() => {
    const desiredKeys = ['BLACK', 'GOLD', 'BUSINESS_PLUS'];
    const normalize = (t?: string) =>
      (t || '')
        .toString()
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_');

    const existingKeys = new Set(cards.map((c) => normalize(c.card_type)));
    const result: CardData[] & { isOffer?: boolean }[] = [...cards];
    let placeholderId = -1;
    const keyToLabel: Record<string, string> = {
      BLACK: 'BLACK',
      GOLD: 'GOLD',
      BUSINESS_PLUS: 'BUSINESS PLUS',
    };

    for (const key of desiredKeys) {
      if (!existingKeys.has(key)) {
        result.push({
          id: placeholderId--,
          card_type: keyToLabel[key] || key,
          balance: 0,
          customer_id: customerId,
          isOffer: true,
        } as any);
      }
    }

    // Ensure order: BLACK, GOLD, BUSINESS_PLUS, then any extras
    const orderMap: Record<string, number> = { BLACK: 0, GOLD: 1, BUSINESS_PLUS: 2 };
    result.sort((a, b) => {
      const ak = normalize(a.card_type);
      const bk = normalize(b.card_type);
      const av = orderMap[ak] ?? 99;
      const bv = orderMap[bk] ?? 99;
      return av - bv;
    });

    return result;
  }, [cards, customerId]);

  const [selectedCardId, setSelectedCardId] = useState(displayCards[0]?.id || 0);
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCardChange = async (cardId: number) => {
    setSelectedCardId(cardId);
    // If this is an offer slide (no real card), don't fetch transactions
    const isOffer = displayCards.find((c) => c.id === cardId && (c as any).isOffer);
    if (isOffer) {
      setTransactions([]);
      return;
    }

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
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Global swipe & keyboard handlers to change cards from the page
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 40;

  const goToIndex = (newIndex: number) => {
    if (!displayCards || displayCards.length === 0) return;
    const idx = (newIndex + displayCards.length) % displayCards.length;
    const id = displayCards[idx].id;
    handleCardChange(id);
  };

  const goToNext = () => {
    const currentIndex = displayCards.findIndex((c) => c.id === selectedCardId);
    goToIndex(currentIndex + 1);
  };

  const goToPrevious = () => {
    const currentIndex = displayCards.findIndex((c) => c.id === selectedCardId);
    goToIndex(currentIndex - 1);
  };

  useEffect(() => {
    // Keep selectedCardId in sync if displayCards change
    if (!selectedCardId && displayCards?.[0]) {
      setSelectedCardId(displayCards[0].id);
    }
  }, [displayCards]);

  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) return;

    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches?.[0]?.clientX ?? null;
      touchStartY.current = e.touches?.[0]?.clientY ?? null;
    }

    function onTouchMove(e: TouchEvent) {
      // If horizontal movement dominates, prevent the browser back/forward edge-swipe
      if (touchStartX.current === null || touchStartY.current === null) return;
      const moveX = e.touches?.[0]?.clientX ?? null;
      const moveY = e.touches?.[0]?.clientY ?? null;
      if (moveX === null || moveY === null) return;
      const deltaX = moveX - touchStartX.current;
      const deltaY = moveY - touchStartY.current;

      // Only prevent default if horizontal movement is clearly dominant
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
        e.preventDefault();
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const endX = e.changedTouches?.[0]?.clientX ?? null;
      const endY = e.changedTouches?.[0]?.clientY ?? null;
      if (endX === null || endY === null) return;

      const deltaX = endX - touchStartX.current;
      const deltaY = endY - touchStartY.current;

      touchStartX.current = null;
      touchStartY.current = null;

      // Only trigger card change if horizontal movement is clearly dominant
      // and exceeds threshold
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.5) return; // Not clearly horizontal

      if (deltaX < 0) {
        // swipe left -> next
        goToNext();
      } else {
        // swipe right -> previous
        goToPrevious();
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    // touchmove must be non-passive to allow preventDefault()
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedCardId, cards]);

  return (
    <>
    <DesktopCardOverview
      cards={displayCards}
      selectedCardId={selectedCardId}
      onCardChange={handleCardChange}
      transactions={transactions}
      customerId={customerId}
      customerAvatar={customerAvatar}
      customerName={customerName}
      isLoading={isLoading}
    />
    <div
      className="mobile-cabinet-view mt-0"
      style={{ touchAction: 'pan-y', overscrollBehaviorX: 'contain' }}
    >
      <CardSlider 
        cards={displayCards} 
        onCardChange={handleCardChange}
        customerAvatar={customerAvatar}
        customerName={customerName}
        activeCardId={selectedCardId}
      />
      
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
        <ActivitySection transactions={transactions} customerId={customerId} cardId={selectedCardId} />
      )}
    </div>
    </>
  );
}
