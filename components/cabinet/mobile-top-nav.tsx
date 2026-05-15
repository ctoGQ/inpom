'use client';

import { ChevronLeft, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface MobileTopNavProps {
  title?: string;
  showBack?: boolean;
  onMenuClick?: () => void;
}

export function MobileTopNav({
  title,
  showBack = false,
  onMenuClick,
}: MobileTopNavProps) {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
      <div className="flex items-center justify-between px-3 h-14">
        {/* Left: Back Button */}
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-foreground/10 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <span className="text-lg font-display text-foreground">MOTHERS</span>
          </div>
        )}

        {/* Center: Title */}
        {title && (
          <h1 className="text-sm font-medium text-foreground truncate">
            {title}
          </h1>
        )}

        {/* Right: Menu Button */}
        {onMenuClick ? (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-foreground/10 transition-colors"
            aria-label="Menu"
          >
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </div>
  );
}
