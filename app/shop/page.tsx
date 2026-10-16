'use client';

import { Suspense } from 'react';
import { ShopCatalog } from '@/components/shop/shop-catalog';

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ShopCatalog />
    </Suspense>
  );
}
