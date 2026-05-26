import { useEffect, useState } from 'react';
import { useFavoriteStore } from '@/store/favoriteStore';
import { useAuthStore } from '@/store/authStore';
import { favoriteApi } from '@/services/api';

export function useFavorites() {
  const user = useAuthStore((s) => s.user);
  const favorites = useFavoriteStore((s) => s.favorites);
  const addFavorite = useFavoriteStore((s) => s.addFavorite);
  const removeFavorite = useFavoriteStore((s) => s.removeFavorite);
  const setFavorites = useFavoriteStore((s) => s.setFavorites);
  const [loading, setLoading] = useState(false);

  // Load favorites from server on mount if user is authenticated
  useEffect(() => {
    if (user && favorites.size === 0) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteApi.getFavorites();
      if (res.success) {
        const productIds = res.data.map((p) => p._id);
        setFavorites(productIds);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      console.warn('User not authenticated');
      return;
    }

    try {
      const res = await favoriteApi.toggleFavorite(productId);
      if (res.success) {
        if (res.isFavorite) {
          addFavorite(productId);
        } else {
          removeFavorite(productId);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };

  return {
    favorites,
    toggleFavorite,
    loadFavorites,
    loading,
  };
}
