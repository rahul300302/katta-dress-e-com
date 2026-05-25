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
  fetchCart: () => Promise<CartData | null>;
  setFromCart: (cart: CartData) => void;
  addItem: (productId: string, size: string, quantity: number, flyFrom?: FlyOrigin) => Promise<void>;
  clear: () => void;
}

function countItems(cart: CartData) {
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

let loadCartPromise: Promise<CartData | null> | null = null;

async function loadCartOnce(): Promise<CartData | null> {
  const token = useAuthStore.getState().token;
  if (!token) return null;

  if (loadCartPromise) return loadCartPromise;

  loadCartPromise = api
    .get('/cart')
    .then((res) => (res.data.success ? (res.data.data as CartData) : null))
    .catch(() => null)
    .finally(() => {
      loadCartPromise = null;
    });

  return loadCartPromise;
}

export const useCartStore = create<CartState>((set, get) => ({
  itemCount: 0,
  bumpKey: 0,
  fly: null,

  setFromCart: (cart) => set({ itemCount: countItems(cart) }),

  fetchCart: () => loadCartOnce(),

  refresh: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ itemCount: 0 });
      return;
    }
    const cart = await loadCartOnce();
    set({ itemCount: cart ? countItems(cart) : 0 });
  },

  clear: () => {
    loadCartPromise = null;
    set({ itemCount: 0, fly: null });
  },

  addItem: async (productId, size, quantity, flyFrom) => {
    await api.post('/cart', { productId, size, quantity });
    if (flyFrom) set({ fly: flyFrom });
    loadCartPromise = null;
    await get().refresh();
    set((s) => ({ bumpKey: s.bumpKey + 1 }));
  },
}));
