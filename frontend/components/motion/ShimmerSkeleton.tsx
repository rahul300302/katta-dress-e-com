'use client';

import { motion } from 'framer-motion';

interface Props {
  count?: number;
  className?: string;
}

export default function ShimmerSkeleton({ count = 8, className = 'aspect-[3/4]' }: Props) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
          className={`rounded-xl bg-gradient-to-r from-store-faint via-store-border/60 to-store-faint bg-[length:200%_100%] animate-shimmer ${className}`}
        />
      ))}
    </>
  );
}
