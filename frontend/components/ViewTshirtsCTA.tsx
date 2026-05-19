'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '@/services/api';
import { formatPrice, getDiscountPercent } from '@/lib/constants';

interface Props {
  products?: Product[];
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
  'https://images.unsplash.com/photo-1622445275463-afa6ab5c4ecc?w=600&q=80',
];

export default function ViewTshirtsCTA({ products = [] }: Props) {
  const preview = products.slice(0, 3);
  const images =
    preview.length > 0
      ? preview.map((p) => p.images?.[0]).filter(Boolean)
      : fallbackImages;

  return (
    <section className="relative overflow-hidden border-y border-store-border bg-store-text py-16 text-white md:py-24">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="container-main relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              Men&apos;s T-Shirts Only
            </span>
            <h2 className="mt-6 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
              View T-Shirts
            </h2>
            <p className="mt-4 max-w-lg text-lg text-white/70">
              Premium streetwear tees for every day. Explore our full collection — hot sales, new
              drops, and bestsellers from KATTA.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary !bg-white !text-store-text hover:!bg-store-faint">
                Shop All T-Shirts
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?isHotSale=true"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Hot Sales
              </Link>
            </div>

            {preview.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-6">
                {preview.map((p) => {
                  const price = p.offerPrice && p.offerPrice < p.price ? p.offerPrice : p.price;
                  const discount = getDiscountPercent(p.price, p.offerPrice);
                  return (
                    <div key={p._id} className="text-sm">
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-white/60">
                        {formatPrice(price)}
                        {discount > 0 && (
                          <span className="ml-2 text-green-300">-{discount}%</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="grid grid-cols-3 gap-3">
              {images.map((src, i) => (
                <motion.div
                  key={String(src)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`relative overflow-hidden rounded-2xl bg-white/10 ${
                    i === 1 ? 'mt-8' : i === 2 ? 'mt-4' : ''
                  }`}
                >
                  <motion.div
                    className={`relative w-full ${i === 1 ? 'aspect-[3/5]' : 'aspect-[3/4]'}`}
                  >
                    <Image
                      src={src as string}
                      alt="KATTA T-shirt"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/40 px-5 py-2 text-center text-xs font-medium backdrop-blur-md"
            >
              100% Premium Cotton · Made for Men
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
