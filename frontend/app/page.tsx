import HeroCarousel from '@/components/HeroCarousel';
import ViewTshirtsCTA from '@/components/ViewTshirtsCTA';
import ProductSection from '@/components/ProductSection';
import StoreLocation from '@/components/StoreLocation';
import TrustPaymentBar from '@/components/TrustPaymentBar';
import api, { type Product } from '@/services/api';

async function getHomeData() {
  try {
    const res = await api.get('/products/home');
    return res.data.data as {
      hotSales: Product[];
      offers: Product[];
      newArrivals: Product[];
      bestSellers: Product[];
      collection: Product[];
    };
  } catch {
    return {
      hotSales: [],
      offers: [],
      newArrivals: [],
      bestSellers: [],
      collection: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <HeroCarousel />
      <ViewTshirtsCTA products={data.collection} />
      <TrustPaymentBar />
      <ProductSection
        title="Hot Sales"
        subtitle="Trending tees at unbeatable prices"
        products={data.hotSales}
        href="/products?isHotSale=true"
      />
      <ProductSection
        title="Special Offers"
        subtitle="Limited-time deals you don't want to miss"
        products={data.offers}
        href="/products?isOffer=true"
      />
      <ProductSection
        title="T-Shirt Collection"
        subtitle="Curated styles for every vibe"
        products={data.collection}
        href="/products"
      />
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh drops just landed"
        products={data.newArrivals}
        href="/products?isNewArrival=true"
      />
      <ProductSection
        title="Best Sellers"
        subtitle="Customer favourites"
        products={data.bestSellers}
        href="/products?sort=latest"
      />
      <StoreLocation />
    </>
  );
}
