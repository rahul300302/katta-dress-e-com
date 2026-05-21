'use client';

import Image from 'next/image';
import type { ColorVariant } from '@/lib/colorVariants';

interface Props {
  variants: ColorVariant[];
  selected: string;
  onSelect: (name: string) => void;
}

export default function ColorSelector({ variants, selected, onSelect }: Props) {
  if (!variants.length) return null;

  const active = selected || variants[0]?.name;

  return (
    <div className="mt-6">
      <p className="mb-3 text-sm font-semibold">
        Color: <span className="font-normal text-store-muted">{active}</span>
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {variants.map((v) => {
          const isActive = v.name === active;
          return (
            <button
              key={v.name}
              type="button"
              onClick={() => onSelect(v.name)}
              className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-lg transition ${
                isActive
                  ? 'ring-2 ring-store-text ring-offset-2 ring-offset-store-bg dark:ring-white dark:ring-offset-store-bg'
                  : 'opacity-80 hover:opacity-100'
              }`}
              aria-label={`Color ${v.name}`}
              aria-pressed={isActive}
            >
              {v.image ? (
                <Image src={v.image} alt={v.name} fill className="object-cover" sizes="56px" />
              ) : (
                <span className="flex h-full items-center justify-center bg-store-faint text-xs">
                  {v.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
