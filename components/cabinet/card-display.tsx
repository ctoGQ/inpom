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
      {/* Layout: Text on left, 3D Card on right - Single block */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center p-6 lg:p-8 bg-foreground/[0.02]">
        {/* Left side: Balance Info */}
        <div className="lg:col-span-2 flex flex-col justify-between">
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
        <div className="lg:col-span-3 flex items-center justify-center slide-in-card-container overflow-hidden">
          <div className="w-full max-w-xs lg:max-w-md slide-in-card">
            <TierCard 
              variant={getTierVariant(cardType)} 
              imageUrl={getCardImageUrl(cardType)}
            />
          </div>

          <style jsx>{`
            .slide-in-card-container {
              opacity: 0;
              animation: fadeIn 0.8s ease-out forwards;
              animation-delay: 0.2s;
              min-h-[200px];
            }

            .slide-in-card {
              animation: slideInCard 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
              animation-delay: 0.2s;
            }

            @keyframes fadeIn {
              to {
                opacity: 1;
              }
            }

            @keyframes slideInCard {
              from {
                transform: translateY(100px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }

            @media (min-width: 1024px) {
              .slide-in-card {
                animation: slideInCardDesktop 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                animation-delay: 0.2s;
              }

              @keyframes slideInCardDesktop {
                from {
                  transform: translateX(100px);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
