'use client';

import { useEffect } from 'react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useSiteStore } from '@/store/siteStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const refreshCart = useCartStore((s) => s.refresh);
  const clearCart = useCartStore((s) => s.clear);
  const fetchBranding = useSiteStore((s) => s.fetchBranding);
  const branding = useSiteStore((s) => s.branding);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  useEffect(() => {
    if (branding && typeof window !== 'undefined') {
      const name = branding.name || 'KATTA';
      const tagline = branding.tagline ? ` — ${branding.tagline}` : '';
      document.title = `${name}${tagline}`;

      if (branding.logo) {
        const favicons = document.querySelectorAll("link[rel*='icon']");
        favicons.forEach((fav) => {
          (fav as HTMLLinkElement).href = branding.logo;
        });
      }
    }
  }, [branding]);

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
