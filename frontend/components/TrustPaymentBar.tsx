'use client';

import { motion } from 'framer-motion';
import { Shield, Truck, Shirt, CreditCard } from 'lucide-react';
import AnimatedSection from '@/components/motion/AnimatedSection';
import { popIn, viewportOnce } from '@/lib/motion';

const items = [
  { icon: Shield, label: 'Secure Checkout' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: Shirt, label: 'Premium Cotton' },
  { icon: CreditCard, label: 'Razorpay Payments' },
];

export default function TrustPaymentBar() {
  return (
    <AnimatedSection className="py-10">
      <div className="container-main grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={popIn}
            transition={{ delay: i * 0.12 }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.5 }}
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-store-border bg-store-faint glow-ring"
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <span className="text-xs font-semibold sm:text-sm">{label}</span>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
}
