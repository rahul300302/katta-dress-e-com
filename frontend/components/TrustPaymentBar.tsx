'use client';

import { motion } from 'framer-motion';
import { Shield, Truck, Shirt, CreditCard } from 'lucide-react';

const items = [
  { icon: Shield, label: 'Secure Checkout' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: Shirt, label: 'Premium Cotton' },
  { icon: CreditCard, label: 'Razorpay Payments' },
];

export default function TrustPaymentBar() {
  return (
    <section className="py-10">
      <motion.div className="container-main grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-store-border bg-store-faint">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold sm:text-sm">{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
