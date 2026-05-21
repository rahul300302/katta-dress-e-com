'use client';

import { create } from 'zustand';
import api from '@/services/api';

export interface Branding {
  name: string;
  logo: string;
  tagline: string;
}

interface SiteState {
  branding: Branding;
  loadingBranding: boolean;
  fetchBranding: () => Promise<void>;
  updateBranding: (branding: Branding) => Promise<void>;
}

const DEFAULT_BRANDING: Branding = {
  name: 'KATTA',
  logo: '/logo.png',
  tagline: "Premium Men's T-Shirts",
};

export const useSiteStore = create<SiteState>((set) => ({
  branding: DEFAULT_BRANDING,
  loadingBranding: false,
  fetchBranding: async () => {
    try {
      const res = await api.get('/site/branding');
      if (res.data.success && res.data.data) {
        set({ branding: res.data.data });
      }
    } catch {
      // fallback to default
    }
  },
  updateBranding: async (branding: Branding) => {
    set({ loadingBranding: true });
    try {
      const res = await api.put('/site/branding', branding);
      if (res.data.success && res.data.data) {
        set({ branding: res.data.data });
      }
    } finally {
      set({ loadingBranding: false });
    }
  },
}));
