'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, viewportOnce } from '@/lib/motion';

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function AnimatedHeading({ title, subtitle, className = '' }: Props) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={className}>
        <h1 className="section-title">{title}</h1>
        {subtitle && <p className="mt-2 text-store-muted">{subtitle}</p>}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      className={className}
    >
      <motion.h1
        variants={fadeUp}
        className="section-title bg-gradient-to-r from-store-text via-store-text to-store-muted bg-clip-text"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p variants={fadeUp} transition={{ delay: 0.08 }} className="mt-2 text-store-muted">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
