'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Package } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export default function StoreLocation() {
  return (
    <section className="border-y border-store-border bg-store-faint py-16">
      <motion.div className="container-main grid gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Visit KATTA</h2>
          <p className="mt-4 text-store-muted">
            Our store in Nagercoil — try fits in person or pick up your online order.
          </p>
          <address className="mt-6 not-italic">
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <strong className="block font-semibold text-store-text">{BRAND.name}</strong>
                {BRAND.address.line1}
                <br />
                {BRAND.address.line2}
                <br />
                {BRAND.address.city}
              </span>
            </p>
          </address>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2"
        >
          <div className="rounded-2xl border border-store-border bg-white p-6">
            <Clock className="mb-3 h-6 w-6" />
            <h3 className="font-semibold">Store Hours</h3>
            <p className="mt-2 text-sm text-store-muted">Mon – Sat: 10:00 AM – 8:00 PM</p>
            <p className="text-sm text-store-muted">Sunday: 11:00 AM – 6:00 PM</p>
          </div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="rounded-2xl border border-store-border bg-white p-6"
          >
            <Package className="mb-3 h-6 w-6" />
            <h3 className="font-semibold">Order Info</h3>
            <p className="mt-2 text-sm text-store-muted">Delivery across India in 3–7 business days</p>
            <p className="text-sm text-store-muted">Secure Razorpay payments · Quality assured</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
