'use client';

import { ReactNode } from 'react';
import { MobileTopNav } from './mobile-top-nav';
import { MobileBottomNav } from './mobile-bottom-nav';

interface CabinetLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  userName?: string;
}

export function CabinetLayout({
  children,
  title,
  showBack = false,
  showAvatar = false,
  avatarUrl = '/placeholder-user.jpg',
  userName = '',
}: CabinetLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileTopNav
        title={title}
        showBack={showBack}
        showAvatar={showAvatar}
        avatarUrl={avatarUrl}
        userName={userName}
      />
      <main className="pt-14 px-3">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
