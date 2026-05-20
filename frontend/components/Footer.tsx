'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Mail, Phone, MessageCircle, Loader2, Send } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import BrandLogo from '@/components/BrandLogo';
import api from '@/services/api';

const mailtoHref = `mailto:${BRAND.email}?subject=${encodeURIComponent('KATTA — Customer inquiry')}`;

function openEmail() {
  window.location.href = mailtoHref;
}

export default function Footer() {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setFeedbackStatus('idle');
    setFeedbackMessage('');
    try {
      const res = await api.post('/contact/feedback', {
        name: feedback.name.trim(),
        email: feedback.email.trim() || undefined,
        message: feedback.message.trim(),
      });
      if (res.data.success) {
        setFeedbackStatus('success');
        setFeedbackMessage(res.data.message || 'Feedback sent!');
        setFeedback({ name: '', email: '', message: '' });
      }
    } catch (err: unknown) {
      setFeedbackStatus('error');
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFeedbackMessage(msg || 'Could not send feedback. Try again or email us directly.');
    } finally {
      setSending(false);
    }
  }

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
                href={mailtoHref}
                onClick={(e) => {
                  e.stopPropagation();
                  openEmail();
                }}
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
              href={mailtoHref}
              onClick={(e) => {
                e.stopPropagation();
                openEmail();
              }}
              aria-label="Email KATTA"
              className="rounded-full border border-store-border p-2 transition hover:border-store-text hover:bg-white"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="mt-8 space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Send Feedback</h4>
            <p className="text-xs text-store-muted">
              Your message is sent to {BRAND.email}
            </p>
            <input
              required
              type="text"
              placeholder="Your name"
              value={feedback.name}
              onChange={(e) => setFeedback((f) => ({ ...f, name: e.target.value }))}
              className="input-elegant !py-2 text-sm"
              maxLength={80}
            />
            <input
              type="email"
              placeholder="Your email (optional)"
              value={feedback.email}
              onChange={(e) => setFeedback((f) => ({ ...f, email: e.target.value }))}
              className="input-elegant !py-2 text-sm"
            />
            <textarea
              required
              placeholder="Your feedback..."
              value={feedback.message}
              onChange={(e) => setFeedback((f) => ({ ...f, message: e.target.value }))}
              rows={3}
              maxLength={2000}
              className="input-elegant resize-none text-sm"
            />
            <button
              type="submit"
              disabled={sending}
              className="btn-primary flex w-full items-center justify-center gap-2 !py-2.5 text-sm"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? 'Sending...' : 'Send feedback'}
            </button>
            {feedbackMessage && (
              <p
                className={`text-xs ${
                  feedbackStatus === 'success' ? 'text-green-700' : 'text-red-600'
                }`}
              >
                {feedbackMessage}
              </p>
            )}
          </form>
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
