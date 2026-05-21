'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { DEFAULT_HERO_SLIDES, type HeroSlide } from '@/lib/heroSlides';
import { slideIsVideo } from '@/lib/mediaUtils';
import api from '@/services/api';

interface Props {
  slides?: HeroSlide[];
}

export default function HeroCarousel({ slides: initialSlides }: Props) {
  const [slides, setSlides] = useState<HeroSlide[]>(
    initialSlides?.length ? initialSlides : DEFAULT_HERO_SLIDES
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api
      .get('/site/hero')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length) {
          setSlides(res.data.data);
        } else if (initialSlides?.length) {
          setSlides(initialSlides);
        }
      })
      .catch(() => {
        if (initialSlides?.length) setSlides(initialSlides);
        else setSlides(DEFAULT_HERO_SLIDES);
      });
  }, [initialSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  if (!slides.length) return null;

  const current = slides[index] || slides[0];
  const mediaUrl = current.media || current.image;
  const isVideo = slideIsVideo(current);

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container-main">
        <div className="relative grid min-h-[420px] items-center gap-8 py-12 md:min-h-[520px] md:grid-cols-2 md:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current.id}`}
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
                {current.title}
              </h1>
              <p className="mt-4 max-w-md text-lg text-store-muted">{current.subtitle}</p>
              <Link href={current.href} className="btn-primary mt-8">
                {current.cta}
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-float md:aspect-square">
            <AnimatePresence mode="wait">
              <motion.div
                key={`media-${current.id}-${isVideo ? 'video' : 'image'}-${mediaUrl}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                {isVideo ? (
                  <video
                    key={mediaUrl}
                    src={mediaUrl}
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={mediaUrl}
                    alt={current.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {slides.length > 1 && (
            <>
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
                className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-store-border bg-store-bg p-2 text-store-text shadow md:flex"
                aria-label="Previous"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % slides.length)}
                className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-store-border bg-store-bg p-2 text-store-text shadow md:flex"
                aria-label="Next"
              >
                <ChevronRight />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
