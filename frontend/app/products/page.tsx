'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { type Product } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import ProductFilters, { type ProductFiltersState } from '@/components/ProductFilters';

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
      <div className="mb-6 md:mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-store-muted">{subtitle}</p>
      </div>

      <ProductFilters
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        mobileOpen={filterDrawerOpen}
        onMobileOpenChange={setFilterDrawerOpen}
      >
        <p className="mb-4 text-xs text-store-muted">
          {loading ? 'Loading...' : `${products.length} product${products.length === 1 ? '' : 's'}`}
        </p>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-store-border" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-20 text-center text-store-muted">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} filterSize={filters.size} compact />
            ))}
          </div>
        )}
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
