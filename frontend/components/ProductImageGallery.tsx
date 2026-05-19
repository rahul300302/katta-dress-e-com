'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  overlay?: React.ReactNode;
  showThumbnails?: boolean;
  priority?: boolean;
}

export default function ProductImageGallery({
  images,
  alt,
  className = '',
  imageClassName = '',
  overlay,
  showThumbnails = true,
  priority = false,
}: Props) {
  const safeImages = images?.filter(Boolean).length ? images.filter(Boolean) : [];
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setSelected(0);
  }, [images.join(',')]);

  const total = safeImages.length;
  const hasMultiple = total > 1;

  const goPrev = useCallback(() => {
    setSelected((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setSelected((i) => (i === total - 1 ? 0 : i + 1));
  }, [total]);

  useEffect(() => {
    if (!hasMultiple) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasMultiple, goPrev, goNext]);

  if (!total) {
    return (
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-3xl bg-store-faint ${className}`}
      >
        <div className="flex h-full items-center justify-center text-sm text-store-muted">
          No image
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={className}>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-store-faint">
        {overlay}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={safeImages[selected]}
              alt={`${alt} — image ${selected + 1}`}
              fill
              className={`object-cover ${imageClassName}`}
              priority={priority && selected === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-store-text shadow-md opacity-0 transition hover:bg-white group-hover:opacity-100 focus:opacity-100 md:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-store-text shadow-md opacity-0 transition hover:bg-white group-hover:opacity-100 focus:opacity-100 md:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute right-3 top-3 z-20 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
              {selected + 1} / {total}
            </span>
          </>
        )}
      </div>

      {showThumbnails && hasMultiple && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {safeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === selected ? 'true' : undefined}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                i === selected
                  ? 'border-store-text ring-2 ring-store-text/20'
                  : 'border-store-border opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
