'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatAmount } from '@/lib/format-amount';
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp, Banknote, Bell, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CardData {
  id: number;
  card_type: string;
  balance: number;
  customer_id: number;
}

interface CardSliderProps {
  cards: CardData[];
  onCardChange: (cardId: number) => void;
  customerAvatar?: string;
  customerName?: string;
}

export function CardSlider({
  cards,
  onCardChange,
  customerAvatar,
  customerName,
}: CardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    const newIndex = (currentIndex - 1 + cards.length) % cards.length;
    setCurrentIndex(newIndex);
    onCardChange(cards[newIndex].id);
  }, [currentIndex, cards, onCardChange]);

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % cards.length;
    setCurrentIndex(newIndex);
    onCardChange(cards[newIndex].id);
  }, [currentIndex, cards, onCardChange]);

  const currentCard = cards[currentIndex];

  const getCardGradient = (type: string) => {
    const gradients: Record<string, string> = {
      GOLD: 'from-amber-300 via-yellow-300 to-orange-200',
      'BUSINESS PLUS': 'from-blue-400 via-purple-400 to-pink-400',
    };
    return gradients[type] || 'from-amber-300 via-yellow-300 to-orange-200';
  };

  const getCardTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      BLACK: 'BLACK CARD',
      GOLD: 'GOLD CARD',
      'BUSINESS PLUS': 'BUSINESS PLUS',
    };
    return labels[type] || type;
  };

  if (!currentCard) return null;

  return (
    <div className="space-y-4">
      {/* Card Container */}
      <motion.div
        {...(currentCard.card_type === 'BLACK'
          ? {
              style: {
                background: 'linear-gradient(146deg, #FFDC93 10%, #FFCB7E 13%, #FFBE6C 26%, #FF978A 55%, #FF9488 65%, #F58D8B 78%, #F58A89 88%, #EE4E6A 100%)',
                borderRadius: '8px 8px 40px 40px',
              },
              className: 'relative rounded-3xl p-6 shadow-2xl overflow-hidden',
            }
          : {
              className: `relative bg-gradient-to-br ${getCardGradient(currentCard.card_type)} rounded-3xl p-6 shadow-2xl overflow-hidden`,
            })}
        layoutId="card-slider"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Top Icons */}
        <div className="flex justify-between items-center mb-12">
          <motion.div
            className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/40 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-6 h-6 text-white" />
          </motion.div>
          <Link href="/mycabinet/account">
            <motion.div
              className="w-12 h-12 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-2 border-white/40 flex-shrink-0 hover:border-white/60 transition-colors cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {customerAvatar ? (
                <Image
                  src={customerAvatar}
                  alt={customerName || 'User'}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/20">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </motion.div>
          </Link>
        </div>

        {/* Card Content */}
        <div className="text-center space-y-4">
          {/* Card Type Label */}
          <motion.p
            className="text-sm font-bold text-black/70 tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {getCardTypeLabel(currentCard.card_type)}
          </motion.p>

          {/* Balance */}
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-1"
          >
            <p className="text-6xl font-black text-black leading-tight">
              {formatAmount(currentCard.balance)}
            </p>
          </motion.div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8 mb-8">
          {cards.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                onCardChange(cards[index].id);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-black/40'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-1 pt-6">
          <Link href="/mycabinet/deposit">
            <motion.button
              className="w-full aspect-square bg-black flex flex-col items-center justify-center gap-2 text-white font-semibold text-xs transition-all shadow-lg hover:shadow-xl"
              style={{ borderRadius: '8px 8px 8px 26px' }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowDown className="w-6 h-6" />
              <span className="text-center">ДЕПОЗИТ</span>
            </motion.button>
          </Link>
          <Link href="/mycabinet/create-invoice">
            <motion.button
              className="w-full aspect-square bg-black rounded-2xl flex flex-col items-center justify-center gap-2 text-white font-semibold text-xs transition-all shadow-lg hover:shadow-xl"
              style={{ borderRadius: '8px 8px 8px 8px' }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Banknote className="w-6 h-6" />
              <span className="text-center">ІНВОЙС</span>
            </motion.button>
          </Link>
          <Link href="/mycabinet/withdraw">
            <motion.button
              className="w-full aspect-square bg-black flex flex-col items-center justify-center gap-2 text-white font-semibold text-xs transition-all shadow-lg hover:shadow-xl"
              style={{ borderRadius: '8px 8px 26px 8px' }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="w-6 h-6" />
              <span className="text-center">ВИВЕСТИ</span>
            </motion.button>
          </Link>
        </div>

        {/* Navigation Arrows */}
        {cards.length > 1 && (
          <div className="flex justify-between items-center mt-4 px-2">
            <motion.button
              onClick={goToPrevious}
              className="text-black/40 hover:text-black/60 transition-colors p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <div className="text-xs text-black/40 font-medium">
              {currentIndex + 1} / {cards.length}
            </div>
            <motion.button
              onClick={goToNext}
              className="text-black/40 hover:text-black/60 transition-colors p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
