'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useRequireAuth(redirectPath?: string) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  function requireAuth(action?: string): boolean {
    if (isAuthenticated) return true;
    const current =
      redirectPath ||
      (typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/');
    const params = new URLSearchParams({ redirect: current });
    if (action) params.set('action', action);
    router.push(`/auth/login?${params.toString()}`);
    return false;
  }

  return { requireAuth, isAuthenticated };
}
