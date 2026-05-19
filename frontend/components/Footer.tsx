'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-store-border bg-store-faint">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container-main grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
          <BrandLogo size="lg" href="/" />
          <p className="mt-3 text-sm text-store-muted">{BRAND.tagline}</p>
          <address className="mt-4 not-italic text-sm leading-relaxed text-store-muted">
            <MapPin className="mb-2 inline h-4 w-4" />
            <br />
            {BRAND.address.line1}
            <br />
            {BRAND.address.line2}
            <br />
            {BRAND.address.city}
            <br />
            {BRAND.address.country}
          </address>
        </motion.div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm text-store-muted">
            <li><Link href="/products" className="hover:text-store-text">All T-Shirts</Link></li>
            <li><Link href="/products?isHotSale=true" className="hover:text-store-text">Hot Sales</Link></li>
            <li><Link href="/products?isOffer=true" className="hover:text-store-text">Offers</Link></li>
            <li><Link href="/products?isNewArrival=true" className="hover:text-store-text">New Arrivals</Link></li>
          </ul>
        </div>

        <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Policies</h4>
          <ul className="space-y-2 text-sm text-store-muted">
            <li><Link href="#" className="hover:text-store-text">Shipping & Delivery</Link></li>
            <li><Link href="#" className="hover:text-store-text">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-store-text">Terms of Service</Link></li>
          </ul>
        </motion.div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm text-store-muted">
            <li>
              <a
                href={BRAND.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition hover:text-store-text"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp {BRAND.phone}
              </a>
            </li>
            <li>
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 transition hover:text-store-text"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {BRAND.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-center gap-2 transition hover:text-store-text"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {BRAND.email}
              </a>
            </li>
          </ul>
          <div className="mt-6 flex gap-4">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="KATTA on Instagram"
              className="rounded-full border border-store-border p-2 transition hover:border-store-text hover:bg-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="rounded-full border border-store-border p-2 transition hover:border-store-text hover:bg-white"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              aria-label="Email KATTA"
              className="rounded-full border border-store-border p-2 transition hover:border-store-text hover:bg-white"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>

      <div
        className="border-t border-store-border py-6 text-center text-xs text-store-muted"
        suppressHydrationWarning
      >
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
