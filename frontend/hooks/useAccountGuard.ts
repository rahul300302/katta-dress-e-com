'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useMounted } from '@/hooks/useMounted';

export function useAccountGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      const redirect = pathname || '/account';
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .get('/auth/me')
      .then((res) => {
        if (cancelled || !res.data.success) return;
        if (token) setAuth(token, res.data.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, isAuthenticated, pathname, router, token, setAuth]);

  const ready = mounted && isAuthenticated && !!user && !loading;

  return { ready, loading: !mounted || loading, user, token, setAuth, isAuthenticated };
}
