'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import type { Product } from '@/services/api';
import { formatPrice, getDiscountPercent } from '@/lib/constants';
import { normalizeProduct, stockForSize } from '@/lib/productStock';
import api from '@/services/api';

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
  initialSize?: string;
}

export default function AddToCartModal({ product, open, onClose, initialSize }: Props) {
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
      await api.post('/cart', { productId: p._id, size, quantity: qty });
      setSuccess(true);
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
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain"
          aria-hidden={!open}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          {/* Centred panel — min-h-full + flex centers in scrollable viewport */}
          <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-to-cart-title"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-md max-h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-30 rounded-full border border-store-border bg-white p-2 shadow-sm transition hover:bg-store-faint"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="overflow-y-auto overscroll-contain">
                {success ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                      <ShoppingBag className="h-7 w-7 text-green-700" />
                    </div>
                    <h2 id="add-to-cart-title" className="mt-4 text-lg font-bold">
                      Added to cart
                    </h2>
                    <p className="mt-1 text-sm text-store-muted">
                      {qty}× {p.name} ({size})
                    </p>
                    <p className="mt-1 text-xs text-store-muted">
                      Adding the same size again increases quantity in your cart.
                    </p>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={onClose} className="btn-secondary flex-1">
                        Continue shopping
                      </button>
                      <a href="/cart" className="btn-primary flex-1 text-center">
                        View cart
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-[4/3] shrink-0 bg-store-faint">
                      {discount > 0 && (
                        <span className="badge-offer absolute left-3 top-3 z-10">-{discount}%</span>
                      )}
                      {noStockOnImage && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55">
                          <span className="rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-wider text-store-text">
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

                    <div className="p-5 pb-6">
                      <p className="text-xs uppercase tracking-wider text-store-muted">{p.collection}</p>
                      <h2 id="add-to-cart-title" className="mt-1 pr-10 font-semibold leading-snug">
                        {p.name}
                      </h2>
                      <p className="mt-2 text-lg font-bold">{formatPrice(price)}</p>

                      <p className="mt-5 text-sm font-semibold">Select size</p>
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
                              className={`min-w-[52px] rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                size === s
                                  ? disabled
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-store-text bg-store-text text-white'
                                  : disabled
                                    ? 'border-store-border bg-store-faint text-store-muted'
                                    : 'border-store-border hover:border-store-text'
                              }`}
                            >
                              <span className="block">{s}</span>
                              <span
                                className={`mt-0.5 block text-[10px] font-normal ${
                                  size === s && !disabled ? 'text-white/80' : ''
                                }`}
                              >
                                {left > 0 ? `${left} left` : 'Out'}
                              </span>
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
                              className="p-2.5 hover:bg-store-faint"
                              aria-label="Decrease"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[36px] text-center font-semibold">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty((q) => Math.min(selectedStock, q + 1))}
                              className="p-2.5 hover:bg-store-faint"
                              aria-label="Increase"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-store-muted">
                            {selectedStock} available in {size}
                          </p>
                        </div>
                      )}

                      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                      <button
                        type="button"
                        disabled={loading || !canAdd}
                        onClick={handleAdd}
                        className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {loading
                          ? 'Adding...'
                          : canAdd
                            ? 'Add to cart'
                            : size
                              ? 'Out of stock'
                              : 'Select a size'}
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
