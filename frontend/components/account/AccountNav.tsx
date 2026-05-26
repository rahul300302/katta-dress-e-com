'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  User,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  ChevronRight,
  Heart,
} from 'lucide-react';

const items = [
  {
    href: '/account',
    label: 'Overview',
    description: 'Account summary',
    icon: LayoutGrid,
    exact: true,
  },
  {
    href: '/account/details',
    label: 'Personal details',
    description: 'Name & email',
    icon: User,
  },
  {
    href: '/account/address',
    label: 'Delivery address',
    description: 'Shipping for orders',
    icon: MapPin,
  },
  {
    href: '/account/orders',
    label: 'My orders',
    description: 'Track purchases',
    icon: Package,
  },
  {
    href: '/account/preferences',
    label: 'Preferences',
    description: 'Theme & shopping',
    icon: Settings,
  },
  {
    href: '/account/preferences/favorites',
    label: 'Favorites',
    description: 'Your saved products',
    icon: Heart,
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  if (compact) {
    return (
      <nav className="flex gap-2" aria-label="Account settings">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                active ? 'chip-active' : 'chip-inactive'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-1" aria-label="Account settings">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-store-muted">Settings</p>
      {items.map(({ href, label, description, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
              active
                ? 'border-store-text bg-store-text text-store-bg shadow-card'
                : 'border-store-border bg-store-faint/50 text-store-text hover:border-store-text hover:bg-store-faint'
            }`}
          >
            <Icon
              className={`h-5 w-5 shrink-0 ${active ? 'text-store-bg' : 'text-store-muted group-hover:text-store-text'}`}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{label}</span>
              <span className={`block text-xs ${active ? 'text-store-bg/80' : 'text-store-muted'}`}>
                {description}
              </span>
            </span>
            <ChevronRight
              className={`h-4 w-4 shrink-0 ${active ? 'text-store-bg' : 'text-store-muted'}`}
            />
          </Link>
        );
      })}
      <Link
        href="/products"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-store-border px-4 py-3 text-sm font-semibold text-store-muted transition hover:border-store-text hover:text-store-text"
      >
        <ShoppingBag className="h-5 w-5" />
        Continue shopping
      </Link>
    </nav>
  );
}
