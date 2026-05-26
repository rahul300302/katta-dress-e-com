'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { Settings, Moon, Sun, Shirt, Heart } from 'lucide-react';

export default function AccountPreferencesPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const user = useAuthStore((s) => s.user);
  const preferredSize = user?.addresses?.[0]?.preferredSize;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Settings className="h-5 w-5" />
          Preferences
        </h2>
        <p className="mt-1 text-sm text-store-muted">Customize how KATTA looks and shops for you.</p>
      </div>

      <section className="surface-card rounded-2xl border border-store-border p-6">
        <h3 className="font-semibold">Appearance</h3>
        <p className="mt-1 text-sm text-store-muted">Light or dark mode across the store.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              theme === 'light' ? 'chip-active' : 'chip-inactive'
            }`}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              theme === 'dark' ? 'chip-active' : 'chip-inactive'
            }`}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
          <ThemeToggle />
        </div>
      </section>

      <section className="surface-card rounded-2xl border border-store-border p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <Shirt className="h-5 w-5" />
          Usual t-shirt size
        </h3>
        <p className="mt-1 text-sm text-store-muted">
          Set under{' '}
          <Link href="/account/address" className="font-semibold underline">
            Delivery address
          </Link>{' '}
          — we remember it for quicker checkout.
        </p>
        <p className="mt-4 text-lg font-bold">
          {preferredSize ? `Size ${preferredSize}` : 'Not set yet'}
        </p>
      </section>

      <section className="surface-card rounded-2xl border border-store-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <Heart className="h-5 w-5" />
              Favorites
            </h3>
            <p className="mt-1 text-sm text-store-muted">View and manage your saved products.</p>
          </div>
          <Link
            href="/account/preferences/favorites"
            className="rounded-lg border border-store-border px-4 py-2 text-sm font-semibold transition hover:bg-store-faint"
          >
            View Favorites
          </Link>
        </div>
      </section>

      <section className="surface-card rounded-2xl border border-store-border p-6">
        <h3 className="font-semibold">Notifications</h3>
        <p className="mt-1 text-sm text-store-muted">
          Order updates are sent to your email ({user?.email}). SMS alerts
          coming soon.
        </p>
      </section>
    </div>
  );
}
