'use client';

import { Compass, Heart, ScanQrCode, ShoppingBag, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/mycabinet/dashboard', icon: Compass, label: 'Головна' },
  { href: '/mycabinet/pick', icon: Heart, label: 'Мій Вибір' },
  { href: '/mycabinet/shop', icon: ShoppingBag, label: 'Простір' },
  { href: '/mycabinet/', icon: CreditCard, label: 'Баланс' },
];

export function MobileBottomNav({ alwaysVisible = false }: { alwaysVisible?: boolean }) {
  const pathname = usePathname();

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      window.location.href = 'intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      // Permission is handled by the browser and the button remains safe to use.
    }
  };

  return (
    <nav className={`cabinet-bottom-nav${alwaysVisible ? ' cabinet-bottom-nav-always' : ''}`}>
      <div className="cabinet-bottom-nav-inner">
        {NAV_ITEMS.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={`cabinet-nav-item${isActive ? ' active' : ''}`} aria-label={item.label}>
              <Icon className="cabinet-nav-item-icon" />
              <span className="cabinet-nav-item-label">{item.label}</span>
            </Link>
          );
        })}
        <button type="button" className="cabinet-qr-button" onClick={openCamera} aria-label="Відкрити камеру для сканування QR-коду">
          <ScanQrCode className="cabinet-qr-icon" />
        </button>
        {NAV_ITEMS.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={`cabinet-nav-item${isActive ? ' active' : ''}`} aria-label={item.label}>
              <Icon className="cabinet-nav-item-icon" />
              <span className="cabinet-nav-item-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
