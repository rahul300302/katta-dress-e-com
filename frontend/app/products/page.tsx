'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { type Product } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import ProductFilters, { type ProductFiltersState } from '@/components/ProductFilters';
import AnimatedHeading from '@/components/motion/AnimatedHeading';
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid';
import ShimmerSkeleton from '@/components/motion/ShimmerSkeleton';
import { fadeUp } from '@/lib/motion';

function readFiltersFromParams(searchParams: URLSearchParams): ProductFiltersState {
  return {
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
    isBestSeller: searchParams.get('isBestSeller') || '',
  };
}

function filtersToParams(filters: ProductFiltersState) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const hasSection =
    filters.isHotSale || filters.isNewArrival || filters.isOffer || filters.isBestSeller;
  if (hasSection) params.set('limit', '48');
  return params;
}

function getPageHeading(filters: ProductFiltersState) {
  if (filters.isHotSale === 'true') return { title: 'Hot Sales', subtitle: 'Trending picks' };
  if (filters.isNewArrival === 'true') return { title: 'New Arrivals', subtitle: 'Fresh drops' };
  if (filters.isOffer === 'true') return { title: 'Offers', subtitle: 'Limited deals' };
  if (filters.isBestSeller === 'true') return { title: 'Best Sellers', subtitle: 'Top rated' };
  if (filters.q) return { title: 'Search', subtitle: `"${filters.q}"` };
  return { title: 'All Collections', subtitle: "Premium men's tees by KATTA" };
}

const EMPTY_FILTERS: ProductFiltersState = {
  size: '',
  color: '',
  collection: '',
  minPrice: '',
  maxPrice: '',
  sort: 'latest',
  q: '',
  isHotSale: '',
  isOffer: '',
  isNewArrival: '',
  isBestSeller: '',
};

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();

  const urlFilters = useMemo(() => readFiltersFromParams(searchParams), [paramsKey, searchParams]);

  const [filters, setFilters] = useState(urlFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    setFilters(urlFilters);
  }, [urlFilters]);

  const pushFilters = useCallback(
    (next: ProductFiltersState) => {
      const params = filtersToParams(next);
      const qs = params.toString();
      router.push(qs ? `/products?${qs}` : '/products', { scroll: false });
    },
    [router]
  );

  function updateFilters(patch: Partial<ProductFiltersState>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    pushFilters(next);
  }

  function clearFilters() {
    const kept: ProductFiltersState = {
      ...EMPTY_FILTERS,
      isHotSale: filters.isHotSale,
      isNewArrival: filters.isNewArrival,
      isOffer: filters.isOffer,
      isBestSeller: filters.isBestSeller,
      q: filters.q,
    };
    setFilters(kept);
    pushFilters(kept);
  }

  useEffect(() => {
    setLoading(true);
    const params = filtersToParams(filters);
    api
      .get(`/products?${params}`)
      .then((res) => setProducts(res.data.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const { title, subtitle } = getPageHeading(filters);

  return (
    <div className="container-main py-8 md:py-12">
      <AnimatedHeading title={title} subtitle={subtitle} className="mb-6 md:mb-8" />

      <ProductFilters
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        mobileOpen={filterDrawerOpen}
        onMobileOpenChange={setFilterDrawerOpen}
      >
        <motion.p
          key={loading ? 'loading' : String(products.length)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-xs text-store-muted"
        >
          {loading ? 'Loading...' : `${products.length} product${products.length === 1 ? '' : 's'}`}
        </motion.p>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
            >
              <ShimmerSkeleton count={8} />
            </motion.div>
          ) : products.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center text-store-muted"
            >
              No products found.
            </motion.p>
          ) : (
            <motion.div
              key="grid"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <StaggerGrid className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {products.map((p, i) => (
                  <StaggerItem key={p._id}>
                    <ProductCard product={p} index={i} filterSize={filters.size} compact priority={i < 6} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </motion.div>
          )}
        </AnimatePresence>
      </ProductFilters>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main animate-pulse py-20 text-center text-store-muted">
          Loading...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
