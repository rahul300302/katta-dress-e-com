'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/services/api';
import { formatPrice, getDiscountPercent } from '@/lib/constants';
import {
  isOutOfStockForFilter,
  normalizeProduct,
  stockForSize,
} from '@/lib/productStock';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import AddToCartModal from '@/components/AddToCartModal';

interface Props {
  product: Product;
  index?: number;
  filterSize?: string;
}

export default function ProductCard({ product, index = 0, filterSize = '' }: Props) {
  const { requireAuth } = useRequireAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const p = normalizeProduct(product);
  const price = p.offerPrice && p.offerPrice < p.price ? p.offerPrice : p.price;
  const discount = getDiscountPercent(p.price, p.offerPrice);
  const outOfStockOnCard = isOutOfStockForFilter(p, filterSize || undefined);
  const allOutOfStock = p.sizes.length > 0 && p.sizes.every((s) => stockForSize(p, s) <= 0);
  const sizeLabel = filterSize
    ? `${filterSize}: ${stockForSize(p, filterSize)} left`
    : p.sizes.map((s) => `${s}(${stockForSize(p, s)})`).join(' · ');

  function handleAddClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth('add-to-cart')) return;
    setModalOpen(true);
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.5 }}
        className="product-card"
      >
        <Link href={`/products/${p._id}${filterSize ? `?size=${filterSize}` : ''}`} className="block">
          <motion.div
            whileHover={outOfStockOnCard ? undefined : { scale: 1.03 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-[3/4] overflow-hidden bg-store-faint"
          >
            {discount > 0 && <span className="badge-offer">-{discount}%</span>}
            {p.isHotSale && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                HOT
              </span>
            )}
            {outOfStockOnCard && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-store-text">
                  No stock
                </span>
              </div>
            )}
            <Image
              src={p.images[0] || '/placeholder.jpg'}
              alt={p.name}
              fill
              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
                outOfStockOnCard ? 'opacity-60 grayscale' : ''
              }`}
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </motion.div>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wider text-store-muted">{p.collection}</p>
            <h3 className="mt-1 font-semibold leading-snug">{p.name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-bold">{formatPrice(price)}</span>
              {p.offerPrice && p.offerPrice < p.price && (
                <span className="text-sm text-store-muted line-through">{formatPrice(p.price)}</span>
              )}
            </div>
            <p className="mt-2 text-xs text-store-muted">Stock: {sizeLabel}</p>
          </div>
        </Link>
        <div className="flex gap-2 border-t border-store-border p-4">
          <Link href={`/products/${p._id}`} className="btn-secondary flex-1 !py-2.5 text-xs">
            View
          </Link>
          <motion.button
            whileHover={{ scale: allOutOfStock ? 1 : 1.02 }}
            whileTap={{ scale: allOutOfStock ? 1 : 0.98 }}
            type="button"
            onClick={handleAddClick}
            disabled={allOutOfStock}
            className="btn-primary flex-1 !py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {allOutOfStock ? 'Sold out' : 'Add'}
          </motion.button>
        </div>
      </motion.article>

      <AddToCartModal
        product={p}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialSize={filterSize || undefined}
      />
    </>
  );
}
