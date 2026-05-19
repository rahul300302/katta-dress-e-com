import type { Product } from '@/services/api';

export type SizeStockMap = Record<string, number>;

export function buildSizeStockFromLegacy(sizes: string[] = [], totalStock = 0): SizeStockMap {
  const sizeStock: SizeStockMap = {};
  const total = Math.max(0, Number(totalStock) || 0);
  if (!sizes.length) return sizeStock;

  const base = Math.floor(total / sizes.length);
  let remainder = total % sizes.length;
  for (const size of sizes) {
    sizeStock[size] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }
  return sizeStock;
}

export function normalizeProduct(product: Product): Product {
  let sizeStock = product.sizeStock;

  if (!sizeStock || !Object.keys(sizeStock).length) {
    sizeStock = buildSizeStockFromLegacy(product.sizes || [], product.stock);
  } else {
    const cleaned: SizeStockMap = {};
    for (const [size, qty] of Object.entries(sizeStock)) {
      cleaned[size] = Math.max(0, Number(qty) || 0);
    }
    sizeStock = cleaned;
  }

  const stock = Object.values(sizeStock).reduce((sum, n) => sum + n, 0);
  return {
    ...product,
    sizeStock,
    sizes: Object.keys(sizeStock),
    stock,
  };
}

export function stockForSize(product: Product, size: string): number {
  const p = normalizeProduct(product);
  return p.sizeStock?.[size] ?? 0;
}

export function productOffersSize(product: Product, size: string): boolean {
  const p = normalizeProduct(product);
  return Object.prototype.hasOwnProperty.call(p.sizeStock || {}, size);
}

export function firstInStockSize(product: Product): string | null {
  const p = normalizeProduct(product);
  const entry = Object.entries(p.sizeStock || {}).find(([, qty]) => qty > 0);
  return entry?.[0] ?? null;
}

export function isOutOfStockForFilter(product: Product, filterSize?: string): boolean {
  const p = normalizeProduct(product);
  if (filterSize) {
    if (!productOffersSize(p, filterSize)) return true;
    return stockForSize(p, filterSize) <= 0;
  }
  return p.stock <= 0;
}
