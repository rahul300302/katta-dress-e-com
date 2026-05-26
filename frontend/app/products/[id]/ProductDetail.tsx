'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Zap, Heart } from 'lucide-react';
import type { Product } from '@/services/api';
import { formatPrice, getDiscountPercent, type Size } from '@/lib/constants';
import { normalizeProduct, stockForSize } from '@/lib/productStock';
import { getColorVariants, getDisplayImages } from '@/lib/colorVariants';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCartStore } from '@/store/cartStore';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/authStore';
import { rectCenter } from '@/lib/cartFly';
import ProductCard from '@/components/ProductCard';
import ProductImageGallery from '@/components/ProductImageGallery';
import ColorSelector from '@/components/ColorSelector';

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requireAuth } = useRequireAuth();
  const addItem = useCartStore((s) => s.addItem);
  const { toggleFavorite, favorites } = useFavorites();
  const user = useAuthStore((s) => s.user);
  const [addedToast, setAddedToast] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const p = useMemo(() => normalizeProduct(product), [product]);
  const colorVariants = useMemo(() => getColorVariants(p), [p]);
  const offeredSizes = p.sizes;
  const isFav = favorites.has(p._id);

  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [size, setSize] = useState<Size | ''>('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const sizeFromUrl = searchParams.get('size') || '';
  const displayImages = useMemo(
    () => getDisplayImages(p, selectedColor),
    [p, selectedColor]
  );
  const selectedVariantImage =
    colorVariants.find((v) => v.name === selectedColor)?.image || displayImages[0];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const first = colorVariants[0]?.name || '';
    setSelectedColor(first);
  }, [p._id, colorVariants.map((v) => v.name).join(',')]);

  useEffect(() => {
    const preferred =
      (sizeFromUrl && offeredSizes.includes(sizeFromUrl) ? sizeFromUrl : '') ||
      offeredSizes.find((s) => stockForSize(p, s) > 0) ||
      offeredSizes[0] ||
      '';
    setSize(preferred as Size | '');
    setQty(1);
  }, [p._id, sizeFromUrl, offeredSizes.join(','), p]);

  const selectedStock = size ? stockForSize(p, size) : 0;
  const showOutOfStockOverlay = mounted && size && selectedStock <= 0;
  const price = p.offerPrice && p.offerPrice < p.price ? p.offerPrice : p.price;
  const discount = getDiscountPercent(p.price, p.offerPrice);
  const canPurchase = size && selectedStock > 0;

  async function addToCart(goCheckout = false) {
    if (!requireAuth(goCheckout ? 'checkout' : 'add-to-cart')) return;
    if (!size) {
      alert('Please select a size');
      return;
    }
    if (selectedStock <= 0) {
      alert(`Size ${size} is out of stock`);
      return;
    }
    setLoading(true);
    try {
      const origin = rectCenter(galleryRef.current);
      await addItem(p._id, size, qty, {
        x: origin?.x ?? window.innerWidth / 2,
        y: origin?.y ?? window.innerHeight / 2,
        image: selectedVariantImage,
      });
      if (goCheckout) {
        router.push('/checkout');
      } else {
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2500);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleFavorite = async () => {
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
    <div className="container-main pt-8 pb-28 sm:pt-10 sm:pb-14 md:pt-14 md:pb-14">
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed left-1/2 top-24 z-[60] -translate-x-1/2 rounded-full bg-store-text px-5 py-2.5 text-sm font-semibold text-store-bg shadow-lg"
          >
            Added to bag ✓
          </motion.div>
        )}
      </AnimatePresence>
 
      <div className="grid gap-10 lg:grid-cols-2 min-w-0">
        <div ref={galleryRef} className="min-w-0">
          <ProductImageGallery
            images={displayImages}
            alt={p.name}
            priority
            imageClassName={showOutOfStockOverlay ? 'opacity-60 grayscale' : ''}
            overlay={
              showOutOfStockOverlay ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-store-bg px-5 py-2 text-sm font-bold uppercase tracking-wider text-store-text">
                    No stock — {size}
                  </span>
                </div>
              ) : undefined
            }
          />
        </div>
 
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-store-muted">{p.collection}</p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            {discount > 0 && (
              <span className="inline-block rounded-full bg-store-text px-3 py-1 text-xs font-semibold text-store-bg">
                {discount}% OFF
              </span>
            )}
            <button
              onClick={handleToggleFavorite}
              disabled={isTogglingFav}
              className="rounded-full border border-store-border p-2.5 transition hover:bg-store-faint disabled:opacity-50"
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={20}
                className={`transition-colors ${
                  isFav ? 'fill-red-500 text-red-500' : 'text-store-muted hover:text-red-500'
                }`}
              />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPrice(price)}</span>
            {p.offerPrice && p.offerPrice < p.price && (
              <span className="text-lg text-store-muted line-through">{formatPrice(p.price)}</span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-store-muted">{p.description}</p>

          <ColorSelector
            variants={colorVariants}
            selected={selectedColor}
            onSelect={setSelectedColor}
          />

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold">Size</p>
            <div className="flex flex-wrap gap-3">
              {offeredSizes.map((s) => {
                const qtyLeft = stockForSize(p, s);
                const disabled = qtyLeft <= 0;
                const isSelected = size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setSize(s as Size);
                      setQty(1);
                    }}
                    className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition ${
                      isSelected
                        ? 'chip-active'
                        : disabled
                          ? 'chip-inactive line-through opacity-40'
                          : 'chip-inactive'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold">Quantity</p>
            <div className="inline-flex items-center rounded-full border border-store-border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3 hover:bg-store-faint"
                aria-label="Decrease"
                disabled={!canPurchase}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[40px] text-center font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(selectedStock, q + 1))}
                className="p-3 hover:bg-store-faint"
                aria-label="Increase"
                disabled={!canPurchase}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-store-muted">
              {size
                ? selectedStock > 0
                  ? `${selectedStock} available in size ${size}`
                  : `No stock in size ${size}`
                : 'Select a size'}
            </p>
          </div>

          <div className="mt-10 hidden flex-col gap-3 sm:flex sm:flex-row">
            <motion.button
              whileHover={{ scale: canPurchase ? 1.02 : 1 }}
              whileTap={{ scale: canPurchase ? 0.98 : 1 }}
              type="button"
              disabled={loading || !canPurchase}
              onClick={() => addToCart(false)}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to bag
            </motion.button>
            <motion.button
              whileHover={{ scale: canPurchase ? 1.02 : 1 }}
              whileTap={{ scale: canPurchase ? 0.98 : 1 }}
              type="button"
              disabled={loading || !canPurchase}
              onClick={() => addToCart(true)}
              className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              Buy Now
            </motion.button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-store-border bg-store-bg-95 p-4 backdrop-blur-md sm:hidden">
        <div className="container-main flex gap-2">
          <motion.button
            type="button"
            disabled={loading || !canPurchase}
            onClick={() => addToCart(false)}
            className="btn-primary flex-1 !py-3 text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to bag
          </motion.button>
          <motion.button
            type="button"
            disabled={loading || !canPurchase}
            onClick={() => addToCart(true)}
            className="btn-secondary flex-1 !py-3 text-sm"
          >
            Buy now
          </motion.button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-store-border pt-16">
          <h2 className="section-title mb-8">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item, i) => (
              <ProductCard key={item._id} product={item} index={i} filterSize={sizeFromUrl || undefined} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
