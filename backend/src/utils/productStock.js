/** @typedef {Record<string, number>} SizeStockMap */

export function buildSizeStockFromLegacy(sizes = [], totalStock = 0) {
  /** @type {SizeStockMap} */
  const sizeStock = {};
  const list = Array.isArray(sizes) ? sizes : [];
  const total = Math.max(0, Number(totalStock) || 0);
  if (!list.length) return sizeStock;

  const base = Math.floor(total / list.length);
  let remainder = total % list.length;
  for (const size of list) {
    sizeStock[size] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }
  return sizeStock;
}

export function parseSizeStockInput(sizeStock, sizes, stock) {
  if (sizeStock && typeof sizeStock === 'object' && !Array.isArray(sizeStock)) {
    /** @type {SizeStockMap} */
    const parsed = {};
    for (const [size, qty] of Object.entries(sizeStock)) {
      if (qty === '' || qty == null) continue;
      parsed[size] = Math.max(0, Number(qty) || 0);
    }
    return parsed;
  }
  return buildSizeStockFromLegacy(sizes, stock);
}

export function normalizeProductRecord(product) {
  const row = product?.toJSON ? product.toJSON() : { ...product };
  let sizeStock = row.sizeStock;

  if (!sizeStock || typeof sizeStock !== 'object' || Array.isArray(sizeStock) || !Object.keys(sizeStock).length) {
    sizeStock = buildSizeStockFromLegacy(row.sizes || [], row.stock);
  } else {
    /** @type {SizeStockMap} */
    const cleaned = {};
    for (const [size, qty] of Object.entries(sizeStock)) {
      cleaned[size] = Math.max(0, Number(qty) || 0);
    }
    sizeStock = cleaned;
  }

  row.sizeStock = sizeStock;
  row.sizes = Object.keys(sizeStock);
  row.stock = totalStock(sizeStock);
  return row;
}

export function totalStock(sizeStock) {
  return Object.values(sizeStock || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);
}

export function stockForSize(product, size) {
  const normalized = normalizeProductRecord(product);
  return normalized.sizeStock?.[size] ?? 0;
}

export function productOffersSize(product, size) {
  const normalized = normalizeProductRecord(product);
  return Object.prototype.hasOwnProperty.call(normalized.sizeStock, size);
}

export function decrementSizeStock(product, size, quantity) {
  const normalized = normalizeProductRecord(product);
  const sizeStock = { ...normalized.sizeStock };
  if (!Object.prototype.hasOwnProperty.call(sizeStock, size)) {
    throw new Error(`Size ${size} unavailable`);
  }
  const available = sizeStock[size] ?? 0;
  if (available < quantity) throw new Error('Insufficient stock');
  sizeStock[size] = available - quantity;
  return {
    sizeStock,
    sizes: Object.keys(sizeStock),
    stock: totalStock(sizeStock),
  };
}
