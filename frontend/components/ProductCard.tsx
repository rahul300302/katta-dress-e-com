'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cardLift, springSoft } from '@/lib/motion';
import { useState } from 'react';
import type { Product } from '@/services/api';
import { formatPrice, getDiscountPercent } from '@/lib/constants';
import { isOutOfStockForFilter, normalizeProduct } from '@/lib/productStock';
import { getDisplayImages } from '@/lib/colorVariants';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/authStore';

interface Props {
  product: Product;
  index?: number;
  filterSize?: string;
  /** Minimal grid: image + name + price only (SAFUU-style shop) */
  compact?: boolean;
  /** Set to true for LCP images above the fold */
  priority?: boolean;
}

export default function ProductCard({
  product,
  index = 0,
  filterSize = '',
  compact = true,
  priority = false,
}: Props) {
  const p = normalizeProduct(product);
  const price = p.offerPrice && p.offerPrice < p.price ? p.offerPrice : p.price;
  const discount = getDiscountPercent(p.price, p.offerPrice);
  const outOfStockOnCard = isOutOfStockForFilter(p, filterSize || undefined);
  
  const allImages = getDisplayImages(p);
  const thumb = allImages[0] || '/placeholder.jpg';
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const displayImage = allImages[currentImageIndex] || thumb;

  const { toggleFavorite, favorites } = useFavorites();
  const user = useAuthStore((s) => s.user);
  const isFav = favorites.has(p._id);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      console.warn('Please log in to add favorites');
      return;
    }

    setIsTogglingFav(true);
    try {
      await toggleFavorite(p._id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFav(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={cardLift}
      className={compact ? 'product-card-compact group' : 'product-card'}
    >
      <Link
        href={`/products/${p._id}${filterSize ? `?size=${filterSize}` : ''}`}
        className="block"
      >
        <div 
          className="relative aspect-[3/4] overflow-hidden bg-store-faint"
          onMouseEnter={() => setCurrentImageIndex(0)}
          onMouseMove={(e) => {
            if (allImages.length > 1) {
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const section = Math.floor((y / rect.height) * allImages.length);
              setCurrentImageIndex(Math.min(section, allImages.length - 1));
            }
          }}
          onMouseLeave={() => setCurrentImageIndex(0)}
        >
          {discount > 0 && <span className="badge-offer">-{discount}%</span>}
          {p.isHotSale && (
            <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Hot
            </span>
          )}
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFav}
            className="absolute right-2 top-2 z-20 rounded-full bg-white/90 p-2 backdrop-blur-sm transition hover:bg-white disabled:opacity-50"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={18}
              className={`transition-colors ${
                isFav ? 'fill-red-500 text-red-500' : 'text-store-muted hover:text-red-500'
              }`}
            />
          </button>
          {outOfStockOnCard && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-store-bg px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-store-text">
                Sold out
              </span>
            </div>
          )}
          {displayImage ? (
            <motion.div className="absolute inset-0" whileHover={{ scale: 1.06 }} transition={springSoft}>
            <Image
              key={displayImage}
              src={displayImage}
              alt={p.name}
              fill
              className={`object-cover transition-opacity duration-500 ${
                outOfStockOnCard ? 'opacity-60 grayscale' : ''
              }`}
              sizes="(max-width: 640px) 50vw, 33vw"
              priority={priority}
            />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-store-muted/30 to-store-muted/10 flex items-center justify-center">
              <span className="text-xs text-store-muted">No image</span>
              </div>
            )}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 right-2 z-10 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
        <div className={compact ? 'px-1 pb-1 pt-3' : 'p-4'}>
          {!compact && (
            <p className="text-xs uppercase tracking-wider text-store-muted">{p.collection}</p>
          )}
          <h3
            className={`font-medium leading-snug text-store-text ${
              compact ? 'text-sm line-clamp-2' : 'mt-1 font-semibold'
            }`}
          >
            {p.name}
          </h3>
          <div className={`flex items-center gap-2 ${compact ? 'mt-1.5' : 'mt-2'}`}>
            <span className={`font-bold ${compact ? 'text-sm' : ''}`}>{formatPrice(price)}</span>
            {p.offerPrice && p.offerPrice < p.price && (
              <span className="text-xs text-store-muted line-through">
                {formatPrice(p.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
