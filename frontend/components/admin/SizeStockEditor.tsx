'use client';

import { SIZES } from '@/lib/constants';
import type { SizeStockMap } from '@/lib/productStock';

interface Props {
  value: SizeStockMap;
  onChange: (value: SizeStockMap) => void;
}

export default function SizeStockEditor({ value, onChange }: Props) {
  function setSizeStock(size: string, raw: string) {
    const next = { ...value };
    if (raw === '') {
      delete next[size];
    } else {
      next[size] = Math.max(0, Number(raw) || 0);
    }
    onChange(next);
  }

  const offered = Object.keys(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase text-store-muted">Sizes & stock</label>
        <span className="text-xs text-store-muted">
          {offered.length} size{offered.length !== 1 ? 's' : ''} ·{' '}
          {Object.values(value).reduce((a, b) => a + b, 0)} total units
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SIZES.map((size) => (
          <label
            key={size}
            className="flex flex-col gap-1 rounded-xl border border-store-border bg-store-faint px-3 py-2"
          >
            <span className="text-xs font-semibold">{size}</span>
            <input
              type="number"
              min={0}
              placeholder="—"
              value={value[size] ?? ''}
              onChange={(e) => setSizeStock(size, e.target.value)}
              className="input-elegant !py-1.5 text-sm"
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-store-muted">
        Enter stock per size. Leave blank if the product is not sold in that size. Use 0 for out of stock.
      </p>
    </div>
  );
}
