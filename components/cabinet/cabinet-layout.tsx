'use client';

import { ReactNode } from 'react';
import { MobileTopNav } from './mobile-top-nav';
import { MobileBottomNav } from './mobile-bottom-nav';

interface CabinetLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onMenuClick?: () => void;
}

export function CabinetLayout({
  children,
  title,
  showBack = false,
  onMenuClick,
}: CabinetLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileTopNav title={title} showBack={showBack} onMenuClick={onMenuClick} />
      <main className="pt-14 px-3">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
