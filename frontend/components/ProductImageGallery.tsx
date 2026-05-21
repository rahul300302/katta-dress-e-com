'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
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
    <div className={className}>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-store-faint">
        {overlay}
        <div className="absolute inset-0">
          <Image
            key={safeImages[selected]}
            src={safeImages[selected]}
            alt={`${alt} — image ${selected + 1}`}
            fill
            className={`object-cover transition-opacity duration-200 ${imageClassName}`}
            priority={priority && selected === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-store-border bg-store-bg text-store-text shadow-md transition hover:bg-store-faint md:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-store-border bg-store-bg text-store-text shadow-md transition hover:bg-store-faint md:opacity-100"
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
    </div>
  );
}
