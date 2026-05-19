'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const slides = [
  {
    title: 'Streetwear Essentials',
    subtitle: 'Premium men\'s tees crafted for everyday style',
    cta: 'Shop Collection',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80',
  },
  {
    title: 'Hot Sales — Up to 30% Off',
    subtitle: 'Limited time offers on bestsellers',
    cta: 'View Offers',
    href: '/products?isHotSale=true',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1600&q=80',
  },
  {
    title: 'New Arrivals',
    subtitle: 'Fresh drops every week',
    cta: 'Explore New',
    href: '/products?isNewArrival=true',
    image: 'https://images.unsplash.com/photo-1622445275463-afa6ab5c4ecc?w=1600&q=80',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative grid min-h-[420px] items-center gap-8 py-12 md:min-h-[520px] md:grid-cols-2 md:py-16"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
              className="z-10"
            >
              <div className="mb-4 flex items-center gap-3">
                <BrandLogo size="sm" showName={false} href={null} />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-store-muted">
                  KATTA · Men&apos;s T-Shirts
                </p>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                {slides[index].title}
              </h1>
              <p className="mt-4 max-w-md text-lg text-store-muted">{slides[index].subtitle}</p>
              <Link href={slides[index].href} className="btn-primary mt-8">
                {slides[index].cta}
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-float md:aspect-square">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <Image
                  src={slides[index].image}
                  alt={slides[index].title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2 md:left-auto md:right-8 md:translate-x-0">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-8 bg-store-text' : 'w-2 bg-store-border'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow md:flex"
            aria-label="Previous"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow md:flex"
            aria-label="Next"
          >
            <ChevronRight />
          </button>
        </motion.div>
      </div>
    </section>
  );
}