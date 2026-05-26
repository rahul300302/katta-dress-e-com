'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/services/api';
import ProductCard from './ProductCard';
import AnimatedSection from '@/components/motion/AnimatedSection';
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid';
import { fadeUp, viewportOnce } from '@/lib/motion';

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
}

export default function ProductSection({ title, subtitle, products, href }: Props) {
  if (!products?.length) return null;

  return (
    <AnimatedSection className="py-16 md:py-20">
      <div className="container-main">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="mt-2 text-store-muted">{subtitle}</p>}
          </div>
          {href && (
            <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Link
                href={href}
                className="animate-underline text-sm font-semibold underline-offset-4"
              >
                View all →
              </Link>
            </motion.div>
          )}
        </motion.div>
        <StaggerGrid className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <StaggerItem key={p._id}>
              <ProductCard product={p} index={i} priority={i < 4} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </AnimatedSection>
  );
}
