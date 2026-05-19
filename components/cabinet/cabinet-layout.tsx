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
    <div className="mycabinet-container">
      <MobileTopNav
        title={title}
        showBack={showBack}
        showAvatar={showAvatar}
        avatarUrl={avatarUrl}
        userName={userName}
      />
      <main className="mycabinet-main">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
