'use client';

import { useEffect } from 'react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!token) return;
    api
      .get('/auth/me')
      .then((res) => {
        if (res.data.success) setAuth(token, res.data.data);
      })
      .catch(() => logout());
  }, [token, setAuth, logout]);

  return <>{children}</>;
}
