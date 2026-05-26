'use client';

import { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { favoriteApi, Product } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loadFavorites } = useFavorites();

  useEffect(() => {
    loadFavoritesData();
  }, []);

  const loadFavoritesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await favoriteApi.getFavorites();
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await favoriteApi.removeFavorite(productId);
      setFavorites(favorites.filter((p) => p._id !== productId));
      await loadFavorites();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Heart className="h-5 w-5" />
          Favorites
        </h2>
        <p className="mt-1 text-sm text-store-muted">Your saved products and wishlist items.</p>
      </div>

      {error && (
        <div className="surface-card rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-store-muted">Loading favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="surface-card rounded-2xl border border-store-border p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-store-muted/50" />
          <h3 className="mt-4 text-lg font-semibold text-store-text">No favorites yet</h3>
          <p className="mt-2 text-store-muted">
            Start adding products to your favorites by clicking the heart icon on product cards.
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm text-store-muted">{favorites.length} favorite item(s)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {favorites.map((product, index) => (
              <div key={product._id} className="group relative">
                <ProductCard product={product} index={index} compact />
                <button
                  onClick={() => handleRemoveFavorite(product._id)}
                  className="absolute right-2 top-2 z-30 rounded-full bg-red-500 p-2 text-white opacity-0 backdrop-blur-sm transition hover:bg-red-600 group-hover:opacity-100"
                  title="Remove from favorites"
                >
                  <Heart size={16} className="fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
