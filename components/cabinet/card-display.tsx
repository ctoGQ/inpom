'use client';

import { formatAmount } from '@/lib/format-amount';
import { TierCard } from '@/components/tier-card';

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
  const getCardImageUrl = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'gold':
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-gold-vHG68mRIsgnDlRj8J1tHxKS6QprtDK.png";
      case 'business plus':
      case 'business':
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-business-LSbBGlxtQ42dQC1ZITco7TuzkE9BMw.png";
      case 'black':
      default:
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-black-0aBd3LaMBBrIShqWZtY2IMJDaubFWn.png";
    }
  };

  const getTierVariant = (type: string): 'black' | 'gold' | 'business' => {
    switch (type.toLowerCase()) {
      case 'gold':
        return 'gold';
      case 'business plus':
      case 'business':
        return 'business';
      case 'black':
      default:
        return 'black';
    }
  };

  const getTextColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gold':
        return 'text-foreground';
      case 'business plus':
      case 'business':
        return 'text-foreground';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-foreground/10">
      {/* Layout: Text on left, 3D Card on right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-6 items-stretch">
        {/* Left side: Balance Info */}
        <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-between bg-foreground/[0.02]">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className={`text-xs font-medium opacity-75 ${getTextColor(cardType)}`}>
                INPOM CARD
              </p>
              <h3 className={`text-lg font-display mt-1 ${getTextColor(cardType)}`}>
                {cardType.charAt(0).toUpperCase() + cardType.slice(1)}
              </h3>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-2 mb-auto">
            <p className={`text-xs opacity-75 ${getTextColor(cardType)}`}>БАЛАНС</p>
            <p className={`text-4xl lg:text-5xl font-display font-bold ${getTextColor(cardType)}`}>
              {formatAmount(balance)}
            </p>
            <p className={`text-xs font-mono tracking-wider ${getTextColor(cardType)}`}>inpom</p>
          </div>

          {/* Footer */}
          <div className={`text-xs mt-8 ${getTextColor(cardType)}`}>
            {customerName}
          </div>
        </div>

        {/* Right side: 3D Animated Card */}
        <div className="lg:col-span-3 relative p-6 lg:p-8 flex items-center justify-center min-h-96 lg:min-h-auto overflow-hidden">
          {/* Background gradient hint */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-foreground rounded-full blur-3xl" />
          </div>

          {/* TierCard Component - Slides in from right */}
          <div 
            className="absolute w-full max-w-md z-10 slide-in-card"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <TierCard 
              variant={getTierVariant(cardType)} 
              imageUrl={getCardImageUrl(cardType)}
            />
          </div>

          <style jsx>{`
            .slide-in-card {
              animation: slideInFromRight 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
              right: -100%;
            }

            @keyframes slideInFromRight {
              to {
                right: -50%;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
