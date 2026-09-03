'use client';

import { CreditCard, ArrowRightLeft, ShoppingBag, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    href: '/mycabinet',
    icon: CreditCard,
    label: 'Карта',
  },
  {
    href: '/mycabinet/pick',
    icon: Sparkles,
    label: 'Pick',
  },
  {
    href: '/mycabinet/transactions',
    icon: ArrowRightLeft,
    label: 'Трансакції',
  },
  {
    href: '/mycabinet/shop',
    icon: ShoppingBag,
    label: 'Магазин',
  },
  {
    href: '/mycabinet/events',
    icon: Calendar,
    label: 'Евенти',
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="cabinet-bottom-nav">
      <div className="w-full flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/mycabinet' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cabinet-nav-item ${
                isActive
                  ? 'active'
                  : ''
              }`}
              aria-label={item.label}
            >
              <Icon className="cabinet-nav-item-icon" />
              <span className="cabinet-nav-item-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
