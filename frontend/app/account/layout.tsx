'use client';

import { Loader2 } from 'lucide-react';
import AccountNav from '@/components/account/AccountNav';
import { useAccountGuard } from '@/hooks/useAccountGuard';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { ready, loading, user, isAuthenticated } = useAccountGuard();

  if (!isAuthenticated && !loading) {
    return null;
  }

  if (!ready) {
    return (
      <div className="container-main flex min-h-[50vh] flex-col items-center justify-center gap-3 py-20 text-store-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading account...</p>
      </div>
    );
  }

  return (
    <div className="container-main py-8 md:py-12">
      <div className="mb-8 flex items-center gap-4">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="h-14 w-14 rounded-full border border-store-border object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-store-border bg-store-faint text-lg font-bold">
            {user?.name?.charAt(0) || '?'}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Account settings
          </h1>
          <p className="truncate text-sm text-store-muted">{user?.email}</p>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto pb-1 lg:hidden">
        <AccountNav compact />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
