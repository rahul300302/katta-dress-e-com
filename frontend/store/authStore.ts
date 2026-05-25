'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryAddress } from '@/services/api';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  addresses?: DeliveryAddress[];
}

interface AuthState {
  token: string | null;
  user: ApiUser | null;
  setAuth: (token: string, user: ApiUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'katta-auth' }
  )
);
