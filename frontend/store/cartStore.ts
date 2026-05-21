'use client';

import { create } from 'zustand';
import api, { type CartData } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export interface FlyOrigin {
  x: number;
  y: number;
  image?: string;
}

interface CartState {
  itemCount: number;
  bumpKey: number;
  fly: FlyOrigin | null;
  refresh: () => Promise<void>;
  addItem: (productId: string, size: string, quantity: number, flyFrom?: FlyOrigin) => Promise<void>;
  clear: () => void;
}

function countItems(cart: CartData) {
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  itemCount: 0,
  bumpKey: 0,
  fly: null,

  clear: () => set({ itemCount: 0, fly: null }),

  refresh: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ itemCount: 0 });
      return;
    }
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        set({ itemCount: countItems(res.data.data) });
      }
    } catch {
      set({ itemCount: 0 });
    }
  },

  addItem: async (productId, size, quantity, flyFrom) => {
    await api.post('/cart', { productId, size, quantity });
    if (flyFrom) set({ fly: flyFrom });
    await get().refresh();
    set((s) => ({ bumpKey: s.bumpKey + 1 }));
  },
}));
