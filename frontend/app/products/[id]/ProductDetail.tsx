'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Zap } from 'lucide-react';
import type { Product } from '@/services/api';
import { formatPrice, getDiscountPercent, type Size } from '@/lib/constants';
import { normalizeProduct, stockForSize } from '@/lib/productStock';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import api from '@/services/api';
import ProductCard from '@/components/ProductCard';
import ProductImageGallery from '@/components/ProductImageGallery';

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requireAuth } = useRequireAuth();
  const p = useMemo(() => normalizeProduct(product), [product]);
  const offeredSizes = p.sizes;

  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState<Size | ''>('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const sizeFromUrl = searchParams.get('size') || '';

  useEffect(() => setMounted(true), []);

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
      await api.post('/cart', { productId: p._id, size, quantity: qty });
      router.push(goCheckout ? '/checkout' : '/cart');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-main py-10 md:py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImageGallery
          images={p.images}
          alt={p.name}
          priority
          imageClassName={showOutOfStockOverlay ? 'opacity-60 grayscale' : ''}
          overlay={
            showOutOfStockOverlay ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                <span className="rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-wider">
                  No stock — {size}
                </span>
              </div>
            ) : undefined
          }
        />

        <div>
          <p className="text-xs uppercase tracking-wider text-store-muted">{p.collection}</p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{p.name}</h1>
          {discount > 0 && (
            <span className="mt-3 inline-block rounded-full bg-store-text px-3 py-1 text-xs font-semibold text-white">
              {discount}% OFF
            </span>
          )}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPrice(price)}</span>
            {p.offerPrice && p.offerPrice < p.price && (
              <span className="text-lg text-store-muted line-through">{formatPrice(p.price)}</span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-store-muted">{p.description}</p>

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {offeredSizes.map((s) => {
                const qtyLeft = stockForSize(p, s);
                const disabled = qtyLeft <= 0;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setSize(s as Size);
                      setQty(1);
                    }}
                    className={`min-w-[56px] rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      size === s
                        ? 'border-store-text bg-store-text text-white'
                        : disabled
                          ? 'cursor-not-allowed border-store-border bg-store-faint text-store-muted opacity-60'
                          : 'border-store-border hover:border-store-text'
                    }`}
                  >
                    <span className="block">{s}</span>
                    <span className={`mt-0.5 block text-[10px] font-normal ${size === s ? 'text-white/80' : ''}`}>
                      {qtyLeft > 0 ? `${qtyLeft} left` : 'Out'}
                    </span>
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
              {' · '}
              Colors: {p.colors.join(', ')}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: canPurchase ? 1.02 : 1 }}
              whileTap={{ scale: canPurchase ? 0.98 : 1 }}
              type="button"
              disabled={loading || !canPurchase}
              onClick={() => addToCart(false)}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
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
