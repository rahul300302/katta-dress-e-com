'use client';

import { SlidersHorizontal } from 'lucide-react';
import { SIZES } from '@/lib/constants';
import SideDrawer from '@/components/SideDrawer';

const COLORS = ['Black', 'White', 'Navy', 'Grey', 'Olive', 'Orange'];
const COLLECTIONS = ['Essentials', 'Street', 'Urban'];

export type ProductFiltersState = {
  size: string;
  color: string;
  collection: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  q: string;
  isHotSale: string;
  isOffer: string;
  isNewArrival: string;
  isBestSeller: string;
};

interface Props {
  filters: ProductFiltersState;
  onChange: (patch: Partial<ProductFiltersState>) => void;
  onClear: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function FilterFields({
  filters,
  onChange,
}: {
  filters: ProductFiltersState;
  onChange: (patch: Partial<ProductFiltersState>) => void;
}) {
  return (
    <div className="space-y-5 p-5 lg:p-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-store-muted">
          Sort by
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { value: 'latest', label: 'Latest' },
            { value: 'price_asc', label: 'Price ↑' },
            { value: 'price_desc', label: 'Price ↓' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ sort: opt.value })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filters.sort === opt.value ? 'chip-active' : 'chip-inactive border'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-store-muted">
          Size
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ size: '' })}
            className={`min-w-[44px] rounded-full border px-3 py-2 text-sm font-medium ${
              !filters.size ? 'chip-active' : 'chip-inactive'
            }`}
          >
            All
          </button>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ size: s })}
              className={`min-w-[44px] rounded-full border px-3 py-2 text-sm font-medium ${
                filters.size === s ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-store-muted">
          Color
        </label>
        <select
          value={filters.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="input-elegant mt-2"
        >
          <option value="">All colors</option>
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-store-muted">
          Collection
        </label>
        <select
          value={filters.collection}
          onChange={(e) => onChange({ collection: e.target.value })}
          className="input-elegant mt-2"
        >
          <option value="">All collections</option>
          {COLLECTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-store-muted">
          Price range (₹)
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="input-elegant"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="input-elegant"
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductFilters({
  filters,
  onChange,
  onClear,
  mobileOpen,
  onMobileOpenChange,
  children,
}: Props) {
  const activeCount = [
    filters.size,
    filters.color,
    filters.collection,
    filters.minPrice,
    filters.maxPrice,
    filters.sort !== 'latest' ? filters.sort : '',
  ].filter(Boolean).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => onMobileOpenChange(true)}
          className="inline-flex items-center gap-2 rounded-full border border-store-border bg-store-faint px-4 py-2.5 text-sm font-semibold text-store-text"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter & Sort
          {activeCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-store-text px-1.5 text-[10px] font-bold text-store-bg">
              {activeCount}
            </span>
          )}
        </button>
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
          {[
            { value: 'latest', label: 'Latest' },
            { value: 'price_asc', label: 'Low–High' },
            { value: 'price_desc', label: 'High–Low' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ sort: opt.value })}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                filters.sort === opt.value ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <SideDrawer
        open={mobileOpen}
        onClose={() => onMobileOpenChange(false)}
        title="Filter & Sort"
        side="right"
      >
        <FilterFields filters={filters} onChange={onChange} />
        <div className="border-t border-store-border p-5">
          <button type="button" onClick={onClear} className="btn-secondary w-full text-sm">
            Clear all
          </button>
          <button
            type="button"
            onClick={() => onMobileOpenChange(false)}
            className="btn-primary mt-2 w-full text-sm"
          >
            Show results
          </button>
        </div>
      </SideDrawer>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 surface-card shadow-card">
            <div className="border-b border-store-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-store-muted">
                Filter & Sort
              </p>
            </div>
            <FilterFields filters={filters} onChange={onChange} />
            {activeCount > 0 && (
              <div className="border-t border-store-border p-4">
                <button type="button" onClick={onClear} className="text-sm font-medium underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </>
  );
}
