'use client';

import { Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect') || '/products';

    if (!token) {
      router.replace('/auth/login?error=oauth');
      return;
    }

    setAuth(token, {
      id: '',
      name: '',
      email: '',
      avatar: '',
      role: (searchParams.get('role') as 'user' | 'admin') || 'user',
    });

    api
      .get('/auth/me')
      .then((res) => {
        if (res.data.success) {
          setAuth(token, res.data.data);
          router.replace(redirect);
        } else {
          router.replace('/auth/login?error=oauth');
        }
      })
      .catch(() => router.replace('/auth/login?error=oauth'));
  }, [searchParams, router, setAuth]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-main flex min-h-[50vh] items-center justify-center"
    >
      <p className="animate-pulse text-store-muted">Signing you in to KATTA...</p>
    </motion.div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main animate-pulse py-20 text-center text-store-muted">
          Loading...
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
