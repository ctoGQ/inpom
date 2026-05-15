'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MobileTopNavProps {
  title?: string;
  showBack?: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  userName?: string;
}

export function MobileTopNav({
  title,
  showBack = false,
  showAvatar = false,
  avatarUrl = '/placeholder-user.jpg',
  userName = '',
}: MobileTopNavProps) {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
      <div className="flex items-center justify-between px-3 h-14">
        {/* Left: Back Button or Logo */}
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-foreground/10 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/inpom-logo.png"
              alt="INPOM"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          </Link>
        )}

        {/* Center: Title */}
        {title && (
          <h1 className="text-sm font-medium text-foreground truncate flex-1 text-center">
            {title}
          </h1>
        )}

        {/* Right: Avatar or Spacer */}
        {showAvatar ? (
          <Link
            href="/mycabinet/account"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:ring-2 hover:ring-foreground/20 transition-all overflow-hidden"
            aria-label="Account"
          >
            <Image
              src={avatarUrl}
              alt={userName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </Link>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </div>
  );
}
