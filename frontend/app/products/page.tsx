'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import api, { type Product } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { SIZES } from '@/lib/constants';

const COLORS = ['Black', 'White', 'Navy', 'Grey', 'Olive', 'Orange'];
const COLLECTIONS = ['Essentials', 'Street', 'Urban'];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    collection: searchParams.get('collection') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'latest',
    q: searchParams.get('q') || '',
    isHotSale: searchParams.get('isHotSale') || '',
    isOffer: searchParams.get('isOffer') || '',
    isNewArrival: searchParams.get('isNewArrival') || '',
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    api
      .get(`/products?${params}`)
      .then((res) => setProducts(res.data.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container-main py-10 md:py-14">
      <h1 className="section-title">Shop Men&apos;s T-Shirts</h1>
      <p className="mt-2 text-store-muted">Premium streetwear by KATTA</p>

      <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }} className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-store-border bg-store-faint p-6">
          <div>
            <label className="text-xs font-semibold uppercase">Sort</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="input-elegant mt-2"
            >
              <option value="latest">Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase">Size</label>
            <select
              value={filters.size}
              onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              className="input-elegant mt-2"
            >
              <option value="">All sizes</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {filters.size && (
              <p className="mt-2 text-xs text-store-muted">
                Products in {filters.size} with zero stock show &quot;No stock&quot; on the image.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase">Color</label>
            <select
              value={filters.color}
              onChange={(e) => setFilters({ ...filters, color: e.target.value })}
              className="input-elegant mt-2"
            >
              <option value="">All</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase">Collection</label>
            <select
              value={filters.collection}
              onChange={(e) => setFilters({ ...filters, collection: e.target.value })}
              className="input-elegant mt-2"
            >
              <option value="">All</option>
              {COLLECTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="input-elegant"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="input-elegant"
            />
          </div>
        </aside>

        <div>
          {loading ? (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="grid grid-cols-2 gap-4 lg:grid-cols-3"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-store-border" />
              ))}
            </motion.div>
          ) : products.length === 0 ? (
            <p className="py-20 text-center text-store-muted">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} filterSize={filters.size} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main py-20 text-center animate-pulse text-store-muted">Loading...</div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
