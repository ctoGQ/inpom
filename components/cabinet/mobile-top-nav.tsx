'use client';

import { ChevronLeft, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MobileTopNavProps {
  title?: string;
  showBack?: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  userName?: string;
  backHref?: string;
}

export function MobileTopNav({
  title,
  showBack = false,
  showAvatar = false,
  avatarUrl = '/placeholder-user.jpg',
  userName = '',
  backHref,
}: MobileTopNavProps) {
  const router = useRouter();

  return (
    <div className="cabinet-top-nav">
      <div className="cabinet-top-nav-left">
        {/* Left: Back Button or Logo */}
        {showBack ? (
          backHref ? (
            <Link href={backHref} className="cabinet-top-nav-back-btn" aria-label="Go back">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          ) : (
            <button
              onClick={() => router.back()}
              className="cabinet-top-nav-back-btn"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )
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
      </div>

      {/* Center: Title */}
      {title && (
        <h1 className="cabinet-top-nav-title">
          {title}
        </h1>
      )}

      {/* Right: More Menu Button or Spacer */}
      <div className="cabinet-top-nav-right">
        {showAvatar ? (
          <button
            className="cabinet-top-nav-menu-btn"
            aria-label="More options"
          >
            <MoreVertical className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </div>
  );
}
