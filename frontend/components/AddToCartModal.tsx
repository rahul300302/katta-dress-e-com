'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, X, Check } from 'lucide-react';
import type { Product } from '@/services/api';
import { formatPrice, getDiscountPercent } from '@/lib/constants';
import { normalizeProduct, stockForSize } from '@/lib/productStock';
import { useCartStore } from '@/store/cartStore';
import { rectCenter } from '@/lib/cartFly';

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
  initialSize?: string;
}

export default function AddToCartModal({ product, open, onClose, initialSize }: Props) {
  const imageRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const [mounted, setMounted] = useState(false);
  const p = normalizeProduct(product);
  const price = p.offerPrice && p.offerPrice < p.price ? p.offerPrice : p.price;
  const discount = getDiscountPercent(p.price, p.offerPrice);

  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedStock = size ? stockForSize(p, size) : 0;
  const noStockOnImage = Boolean(size && selectedStock <= 0);
  const canAdd = Boolean(size && selectedStock > 0 && qty <= selectedStock);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setSuccess(false);
    setError('');
    setQty(1);
    const preferred =
      (initialSize && p.sizes.includes(initialSize) ? initialSize : '') ||
      p.sizes.find((s) => stockForSize(p, s) > 0) ||
      p.sizes[0] ||
      '';
    setSize(preferred);
  }, [open, p._id, initialSize, p.sizes.join(',')]);

  useEffect(() => {
    if (size && qty > selectedStock && selectedStock > 0) {
      setQty(selectedStock);
    }
  }, [size, selectedStock, qty]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  async function handleAdd() {
    if (!size) {
      setError('Please select a size');
      return;
    }
    if (selectedStock <= 0) {
      setError(`Size ${size} is out of stock`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const origin = rectCenter(imageRef.current);
      await addItem(p._id, size, qty, {
        x: origin?.x ?? window.innerWidth / 2,
        y: origin?.y ?? window.innerHeight / 2,
        image: p.images[0],
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Could not add to cart');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain">
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <div className="relative flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-md max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl border border-store-border bg-store-bg text-store-text shadow-2xl sm:max-h-[min(90vh,calc(100dvh-2rem))] sm:rounded-3xl"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-30 rounded-full border border-store-border bg-store-faint p-2 text-store-text shadow-sm"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="overflow-y-auto overscroll-contain">
                {success ? (
                  <div className="p-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-store-faint text-green-600 dark:text-green-400"
                    >
                      <Check className="h-7 w-7 text-green-700" />
                    </motion.div>
                    <h2 className="mt-4 text-lg font-bold">Added to bag</h2>
                    <p className="mt-1 text-sm text-store-muted">
                      {qty}× {p.name} ({size})
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      ref={imageRef}
                      className="relative aspect-[4/3] shrink-0 bg-store-faint"
                    >
                      {discount > 0 && (
                        <span className="badge-offer absolute left-3 top-3 z-10">-{discount}%</span>
                      )}
                      {noStockOnImage && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55">
                          <span className="rounded-full bg-store-bg px-5 py-2 text-sm font-bold uppercase text-store-text">
                            No stock
                          </span>
                        </div>
                      )}
                      <Image
                        src={p.images[0] || '/placeholder.jpg'}
                        alt={p.name}
                        fill
                        className={`object-cover ${noStockOnImage ? 'opacity-60 grayscale' : ''}`}
                        sizes="400px"
                      />
                    </div>

                    <div className="p-5 pb-8">
                      <h2 className="pr-10 font-semibold leading-snug">{p.name}</h2>
                      <p className="mt-2 text-lg font-bold">{formatPrice(price)}</p>
                      {p.colors.length > 0 && (
                        <p className="mt-2 text-xs text-store-muted">
                          Colors: {p.colors.join(', ')}
                        </p>
                      )}

                      <p className="mt-5 text-sm font-semibold">Size</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {p.sizes.map((s) => {
                          const left = stockForSize(p, s);
                          const disabled = left <= 0;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setSize(s);
                                setQty(1);
                                setError('');
                              }}
                              className={`min-w-[52px] rounded-xl border px-3 py-2 text-sm font-medium ${
                                size === s
                                  ? disabled
                                    ? 'border-red-500/60 bg-store-faint text-red-500'
                                    : 'chip-active'
                                  : disabled
                                    ? 'chip-inactive opacity-50'
                                    : 'chip-inactive border'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>

                      {size && selectedStock > 0 && (
                        <div className="mt-5">
                          <p className="text-sm font-semibold">Quantity</p>
                          <div className="mt-2 inline-flex items-center rounded-full border border-store-border">
                            <button
                              type="button"
                              onClick={() => setQty((q) => Math.max(1, q - 1))}
                              className="p-2.5"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[36px] text-center font-semibold">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty((q) => Math.min(selectedStock, q + 1))}
                              className="p-2.5"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                      <button
                        type="button"
                        disabled={loading || !canAdd}
                        onClick={handleAdd}
                        className="btn-primary mt-5 w-full"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {loading ? 'Adding...' : canAdd ? 'Add to bag' : 'Select size'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
