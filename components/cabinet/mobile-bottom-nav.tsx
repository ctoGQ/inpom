'use client';

import { CreditCard, ArrowRightLeft, ShoppingBag, Calendar } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    href: '/mycabinet',
    icon: CreditCard,
    label: 'Карта',
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-foreground/10">
      <div className="flex items-center justify-around px-3 h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/mycabinet' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-foreground/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
