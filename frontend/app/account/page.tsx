'use client';

import Link from 'next/link';
import {
  User,
  MapPin,
  Package,
  Settings,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isAddressComplete, formatSavedAddressBlock } from '@/lib/addressUtils';

const cards = [
  {
    href: '/account/details',
    title: 'Personal details',
    desc: 'Update your display name',
    icon: User,
  },
  {
    href: '/account/address',
    title: 'Delivery address',
    desc: 'Flat, area, pincode & delivery notes',
    icon: MapPin,
  },
  {
    href: '/account/orders',
    title: 'My orders',
    desc: 'View order history & status',
    icon: Package,
  },
  {
    href: '/account/preferences',
    title: 'Preferences',
    desc: 'Dark mode & usual t-shirt size',
    icon: Settings,
  },
];

export default function AccountOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const addr = user?.addresses?.[0];
  const hasAddress = isAddressComplete(addr);
  const preview = hasAddress && addr ? formatSavedAddressBlock(addr).slice(0, 3) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="mt-1 text-sm text-store-muted">
          Manage everything for your KATTA account in one place.
        </p>
      </div>

      <div className="surface-card rounded-2xl border border-store-border p-5">
        <p className="text-sm font-semibold">Quick status</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-2">
            {hasAddress ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            )}
            <span>
              {hasAddress ? (
                <>
                  Delivery address saved
                  {preview.length > 0 && (
                    <span className="mt-1 block text-store-muted">{preview.join(' · ')}</span>
                  )}
                </>
              ) : (
                <>
                  No delivery address yet —{' '}
                  <Link href="/account/address" className="font-semibold underline">
                    add one
                  </Link>{' '}
                  for faster checkout.
                </>
              )}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <span>Signed in as {user?.name}</span>
          </li>
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(({ href, title, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="surface-card group flex items-start gap-4 rounded-2xl border border-store-border p-5 transition hover:border-store-text hover:shadow-card"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-store-faint">
              <Icon className="h-5 w-5 text-store-text" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold group-hover:underline">{title}</p>
              <p className="mt-1 text-xs text-store-muted">{desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-store-muted transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
