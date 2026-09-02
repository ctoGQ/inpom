'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatAmount } from '@/lib/format-amount';
import { ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, QrCode, Bell, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CardData {
  id: number;
  card_type: string;
  balance: number;
  customer_id: number;
  isOffer?: boolean;
}

interface CardSliderProps {
  cards: CardData[];
  onCardChange: (cardId: number) => void;
  customerAvatar?: string;
  customerName?: string;
  activeCardId?: number;
}

export function CardSlider({
  cards,
  onCardChange,
  customerAvatar,
  customerName,
  activeCardId,
}: CardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync internal index when parent tells us which card is active
  useEffect(() => {
    if (activeCardId === undefined) return;
    const idx = cards.findIndex((c) => c.id === activeCardId);
    if (idx >= 0 && idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [activeCardId, cards]);

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
    const key = (type || '').toString().trim().toUpperCase();
    const gradients: Record<string, { bg: string; layers: { color: string; size: string; position: string; speed: string }[] }> = {
      BLACK: {
        bg: '#0a0a0a',
        layers: [
          { color: '#1a1a2e', size: '300px', position: '20% 30%', speed: '25s' },
          { color: '#16213e', size: '250px', position: '80% 70%', speed: '30s' },
          { color: '#0f3460', size: '350px', position: '50% 50%', speed: '20s' },
          { color: '#1a1a2e', size: '200px', position: '30% 80%', speed: '35s' },
        ]
      },
      GOLD: {
        bg: '#1a1207',
        layers: [
          { color: '#ffd700', size: '300px', position: '20% 30%', speed: '25s' },
          { color: '#daa520', size: '250px', position: '80% 70%', speed: '30s' },
          { color: '#b8860b', size: '350px', position: '50% 50%', speed: '20s' },
          { color: '#ffed4a', size: '200px', position: '30% 80%', speed: '35s' },
        ]
      },
      BUSINESS: {
        bg: '#1a0b2e',
        layers: [
          { color: '#8b5cf6', size: '300px', position: '20% 30%', speed: '25s' },
          { color: '#7c3aed', size: '250px', position: '80% 70%', speed: '30s' },
          { color: '#6d28d9', size: '350px', position: '50% 50%', speed: '20s' },
          { color: '#a78bfa', size: '200px', position: '30% 80%', speed: '35s' },
        ]
      },
      'BUSINESS PLUS': {
        bg: '#1a0b2e',
        layers: [
          { color: '#8b5cf6', size: '300px', position: '20% 30%', speed: '25s' },
          { color: '#7c3aed', size: '250px', position: '80% 70%', speed: '30s' },
          { color: '#6d28d9', size: '350px', position: '50% 50%', speed: '20s' },
          { color: '#a78bfa', size: '200px', position: '30% 80%', speed: '35s' },
        ]
      },
      BUSINESS_PLUS: {
        bg: '#1a0b2e',
        layers: [
          { color: '#8b5cf6', size: '300px', position: '20% 30%', speed: '25s' },
          { color: '#7c3aed', size: '250px', position: '80% 70%', speed: '30s' },
          { color: '#6d28d9', size: '350px', position: '50% 50%', speed: '20s' },
          { color: '#a78bfa', size: '200px', position: '30% 80%', speed: '35s' },
        ]
      },
    };

    return gradients[key] || { bg: '#0a0a0a', layers: [
      { color: '#1a1a2e', size: '300px', position: '20% 30%', speed: '25s' },
      { color: '#16213e', size: '250px', position: '80% 70%', speed: '30s' },
      { color: '#0f3460', size: '350px', position: '50% 50%', speed: '20s' },
      { color: '#1a1a2e', size: '200px', position: '30% 80%', speed: '35s' },
    ]};
  };

  const getCardTypeLabel = (type: string): string => {
    const key = (type || '').toString().trim().toUpperCase();
    const labels: Record<string, string> = {
      BLACK: 'BLACK CARD',
      GOLD: 'GOLD CARD',
      BUSINESS: 'BUSINESS PLUS',
      'BUSINESS PLUS': 'BUSINESS PLUS',
      BUSINESS_PLUS: 'BUSINESS PLUS',
    };
    return labels[key] || type;
  };

  if (!currentCard) return null;

  const normalize = (t?: string) =>
    (t || '').toString().trim().toUpperCase().replace(/\s+/g, '_');

  const getOfferPath = (type: string) => {
    const key = normalize(type);
    if (key === 'GOLD') return '/goldcard';
    if (key === 'BUSINESS' || key === 'BUSINESS_PLUS' || key === 'BUSINESS+PLUS') return '/businesspluscard';
    return '/goldcard';
  };

  return (
    <div className="mt-0">
      {/* Card Container */}
      <motion.div
        style={{
          background: getCardGradient(currentCard.card_type).bg,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
        className="relative p-6 rounded-b-4xl overflow-hidden"
        layoutId="card-slider"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Deep Depth Animated Layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
          }}
        >
          {getCardGradient(currentCard.card_type).layers.map((layer, index) => (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                width: layer.size,
                height: layer.size,
                background: layer.color,
                left: layer.position.split(' ')[0],
                top: layer.position.split(' ')[1],
                filter: 'blur(80px)',
                opacity: 0.4 - (index * 0.05),
                animation: `blob-move ${layer.speed} ease-in-out infinite`,
                animationDelay: `${index * 0.5}s`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Additional Depth Layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Gradient Shine Effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
            zIndex: 2
          }}
        />

        {/* Top Icons */}
        <div className="flex justify-between items-center mb-12 relative z-20">
          <motion.div
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-6 h-6 text-black" />
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
        <div className="text-center space-y-4 relative z-20">
          {/* Card Type Label */}
          <motion.p
            className="text-sm font-bold text-white/90 tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {getCardTypeLabel(currentCard.card_type)}
          </motion.p>

          {/* Balance or Offer CTA */}
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-1"
          >
            { (currentCard as any).isOffer ? (
              <div className="flex justify-center">
                <Link href={getOfferPath(currentCard.card_type)}>
                  <motion.a
                    className="inline-flex items-center justify-center w-36 h-12 bg-white text-black font-semibold rounded-full shadow-md"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Відкрити
                  </motion.a>
                </Link>
              </div>
            ) : (
              <span className="text-5xl font-normal text-white leading-tight">
                {formatAmount(currentCard.balance)}
              </span>
            ) }
          </motion.div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8 mb-8 relative z-20">
          {cards.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                onCardChange(cards[index].id);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white/80'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Quick Actions Grid or Offer CTA */}
        { (currentCard as any).isOffer ? (
          <div className="pt-6 relative z-20">
            <div className="grid grid-cols-3 gap-2">
              <Link href={ `/mycabinet/deposit` }>
                <motion.button
                  className="w-full flex flex-col items-center justify-center bg-white/10 rounded-2xl p-3 transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2">
                    <ArrowDownLeft className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-white text-xs font-medium">Депозит</span>
                </motion.button>
              </Link>
              <Link href={ `/mycabinet/create-invoice` }>
                <motion.button
                  className="w-full flex flex-col items-center justify-center bg-white/10 rounded-2xl p-3 transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2">
                    <QrCode className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-white text-xs font-medium">Інвойс</span>
                </motion.button>
              </Link>
              <Link href={ `/mycabinet/withdraw` }>
                <motion.button
                  className="w-full flex flex-col items-center justify-center bg-white/10 rounded-2xl p-3 transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2">
                    <ArrowUpRight className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-white text-xs font-medium">Вивести</span>
                </motion.button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 pt-6 relative z-20">
            <Link href={`/mycabinet/deposit?cardId=${currentCard.id}`}>
              <motion.button
                className="w-full flex flex-col items-center justify-center bg-white/10 rounded-2xl p-3 transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2">
                  <ArrowDownLeft className="w-5 h-5 text-black" />
                </div>
                <span className="text-white text-xs font-medium">Депозит</span>
              </motion.button>
            </Link>
            <Link href={`/mycabinet/create-invoice?cardId=${currentCard.id}`}>
              <motion.button
                className="w-full flex flex-col items-center justify-center bg-white/10 rounded-2xl p-3 transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2">
                  <QrCode className="w-5 h-5 text-black" />
                </div>
                <span className="text-white text-xs font-medium">Інвойс</span>
              </motion.button>
            </Link>
            <Link href={`/mycabinet/withdraw?cardId=${currentCard.id}`}>
              <motion.button
                className="w-full flex flex-col items-center justify-center bg-white/10 rounded-2xl p-3 transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2">
                  <ArrowUpRight className="w-5 h-5 text-black" />
                </div>
                <span className="text-white text-xs font-medium">Вивести</span>
              </motion.button>
            </Link>
          </div>
        ) }

        {/* Navigation arrows removed - global swipe/keyboard handled by wrapper */}
      </motion.div>
    </div>
  );
}
