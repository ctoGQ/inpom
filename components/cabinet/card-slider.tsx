'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatAmount } from '@/lib/format-amount';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CardData {
  id: number;
  card_type: string;
  balance: number;
  customer_id: number;
}

interface CardSliderProps {
  cards: CardData[];
  onCardChange: (cardId: number) => void;
}

export function CardSlider({ cards, onCardChange }: CardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  }, [cards.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  }, [cards.length]);

  const currentCard = cards[currentIndex];

  const getCardGradient = (cardType: string): string => {
    const type = cardType.toLowerCase();
    if (type === 'gold') {
      return 'from-orange-300 via-yellow-300 to-amber-300';
    } else if (type.includes('business')) {
      return 'from-purple-300 via-pink-300 to-rose-300';
    } else {
      return 'from-red-300 via-orange-300 to-yellow-300'; // Black card
    }
  };

  const getCardBackground = (cardType: string): string => {
    const type = cardType.toLowerCase();
    if (type === 'gold') {
      return 'bg-gradient-to-br from-orange-300 via-yellow-300 to-amber-300';
    } else if (type.includes('business')) {
      return 'bg-gradient-to-br from-purple-300 via-pink-300 to-rose-300';
    } else {
      return 'bg-gradient-to-br from-red-300 via-orange-300 to-yellow-300';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  if (!currentCard) return null;

  return (
    <motion.div
      className="space-y-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Card Display */}
      <div className={`${getCardBackground(currentCard.card_type)} rounded-3xl p-6 relative overflow-hidden shadow-2xl`}>
        {/* Decorative dots pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-repeat" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        <motion.div className="relative z-10 space-y-4" variants={itemVariants}>
          {/* Header with time and icons */}
          <div className="flex justify-between items-start">
            <div className="text-xl font-bold text-black">9:41</div>
            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5S9.51 16.5 12 16.5s4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5z" />
              </svg>
            </div>
          </div>

          {/* Card Type and Balance */}
          <div className="text-center pt-4">
            <p className="text-sm font-bold text-black uppercase tracking-widest mb-2">
              {currentCard.card_type}
            </p>
            <p className="text-5xl font-black text-black leading-tight">
              {formatAmount(currentCard.balance).replace(/\s/g, '')}
            </p>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 pt-4">
            {cards.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  onCardChange(cards[index].id);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-black w-8' : 'bg-white/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls (Optional - for testing) */}
      {cards.length > 1 && (
        <div className="flex gap-2 justify-center">
          <motion.button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
