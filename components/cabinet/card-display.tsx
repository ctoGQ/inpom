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
    <div className="cabinet-card mb-6">
      <div className="flex flex-col lg:flex-row lg:gap-6 lg:items-center">
        {/* Left side: Balance Info */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-lg">
            <p className="text-tiny text-secondary mb-md">
              INPOM CARD
            </p>
            <h3 className="text-h3">
              {cardType.charAt(0).toUpperCase() + cardType.slice(1)}
            </h3>
          </div>

          {/* Balance */}
          <div className="space-y-md mb-2xl">
            <p className="text-small text-secondary">БАЛАНС</p>
            <p className="text-h1 font-bold">
              {formatAmount(balance)}
            </p>
            <p className="text-tiny font-mono tracking-wider text-secondary">inpom</p>
          </div>

          {/* Footer */}
          <div className="text-small text-secondary mt-2xl">
            {customerName}
          </div>
        </div>

        {/* Right side: 3D Animated Card */}
        <div className="flex items-center justify-center mt-lg lg:mt-0 lg:flex-1">
          <div className="w-full max-w-sm slide-in-card-container">
            <TierCard 
              variant={getTierVariant(cardType)} 
              imageUrl={getCardImageUrl(cardType)}
            />
          </div>

          <style jsx>{`
            .slide-in-card-container {
              opacity: 0;
              animation: fadeIn 0.8s ease-out forwards;
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
