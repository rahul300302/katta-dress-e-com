import { Suspense } from 'react';
import ProductDetail from './ProductDetail';
import serverApi from '@/services/serverApi';
import type { Product } from '@/services/api';

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await serverApi.get(`/products/${id}`);

    return res.data?.data || null;
  } catch (error: any) {
    console.log(error.response?.data || error.message, 'API ERROR');
    return null;
  }
}

async function getRelated(collection: string, id: string): Promise<Product[]> {
  try {
    const res = await serverApi.get(
      `/products?collection=${collection}&limit=4`
    );

    return (res.data?.data?.products as Product[] || []).filter(
      (p) => p._id !== id
    );
  } catch (error: any) {
    console.log(error.response?.data || error.message, 'RELATED API ERROR');
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  const related = await getRelated(product.collection, product._id);

  return (
    <Suspense
      fallback={
        <div className="container-main py-20 text-center">Loading...</div>
      }
    >
      <ProductDetail product={product} related={related} />
    </Suspense>
  );
}