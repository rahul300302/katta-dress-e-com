'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/services/api';
import ProductCard from './ProductCard';

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
}

export default function ProductSection({ title, subtitle, products, href }: Props) {
  if (!products?.length) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="mt-2 text-store-muted">{subtitle}</p>}
          </div>
          {href && (
            <Link href={href} className="text-sm font-semibold underline-offset-4 hover:underline">
              View all →
            </Link>
          )}
        </motion.div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
