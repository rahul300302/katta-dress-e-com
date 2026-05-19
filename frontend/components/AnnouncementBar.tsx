'use client';

import { Truck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-store-text py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
      <span className="inline-flex items-center gap-2">
        <Truck className="h-3.5 w-3.5" />
        Free shipping on orders above ₹999 · Premium men&apos;s tees only
      </span>
    </div>
  );
}
