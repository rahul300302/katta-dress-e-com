'use client';

import { useEffect } from 'react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const refreshCart = useCartStore((s) => s.refresh);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    if (!token) {
      clearCart();
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        if (res.data.success) {
          setAuth(token, res.data.data);
          refreshCart();
        }
      })
      .catch(() => {
        logout();
        clearCart();
      });
  }, [token, setAuth, logout, refreshCart, clearCart]);

  return <>{children}</>;
}
