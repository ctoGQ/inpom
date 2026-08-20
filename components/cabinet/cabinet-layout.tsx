'use client';

import { ReactNode } from 'react';
import { MobileTopNav } from './mobile-top-nav';
import { MobileBottomNav } from './mobile-bottom-nav';
import { DesktopSidebar } from './desktop-sidebar';

interface CabinetLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showAvatar?: boolean;
  showNav?: boolean;
  showHeader?: boolean;
  avatarUrl?: string;
  userName?: string;
  backHref?: string;
}

export function CabinetLayout({
  children,
  title,
  showBack = false,
  showAvatar = false,
  showNav = true,
  showHeader = true,
  avatarUrl = '/placeholder-user.jpg',
  userName = '',
  backHref,
}: CabinetLayoutProps) {
  return (
    <div className="mycabinet-container">
      <DesktopSidebar />
      <div className="min-w-0 flex-1">
      {showHeader && (
        <MobileTopNav
          title={title}
          showBack={showBack}
          showAvatar={showAvatar}
          avatarUrl={avatarUrl}
          userName={userName}
          backHref={backHref}
        />
      )}
      <main className="mycabinet-main">
        {children}
      </main>
      {showNav && <MobileBottomNav />}
      </div>
    </div>
  );
}
