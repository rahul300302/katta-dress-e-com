import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  favorites: Set<string>;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setFavorites: (productIds: string[]) => void;
  clear: () => void;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: new Set<string>(),

      addFavorite: (productId: string) => {
        set((state) => ({
          favorites: new Set(state.favorites).add(productId),
        }));
      },

      removeFavorite: (productId: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          newFavorites.delete(productId);
          return { favorites: newFavorites };
        });
      },

      toggleFavorite: (productId: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(productId)) {
            newFavorites.delete(productId);
          } else {
            newFavorites.add(productId);
          }
          return { favorites: newFavorites };
        });
      },

      isFavorite: (productId: string) => {
        return get().favorites.has(productId);
      },

      setFavorites: (productIds: string[]) => {
        set({ favorites: new Set(productIds) });
      },

      clear: () => {
        set({ favorites: new Set<string>() });
      },
    }),
    {
      name: 'favorites-storage',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          try {
            const parsed = JSON.parse(item);
            return {
              state: {
                ...parsed.state,
                favorites: new Set(parsed.state.favorites || []),
              },
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              favorites: Array.from(value.state.favorites || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
