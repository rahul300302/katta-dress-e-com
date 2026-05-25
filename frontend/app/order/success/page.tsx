'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import api, { type Order } from '@/services/api';
import { formatPrice, BRAND } from '@/lib/constants';
import { useCartStore } from '@/store/cartStore';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const paymentId = searchParams.get('paymentId');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Sync cart store on success mount
    useCartStore.getState().refresh();
  }, []);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.data)).catch(() => {});
  }, [orderId]);

  return (
    <div className="container-main py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="surface-card mx-auto max-w-2xl p-8 text-center shadow-card md:p-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        </motion.div>
        <h1 className="mt-6 font-display text-3xl font-bold">Thank you!</h1>
        <p className="mt-2 text-store-muted">Your order with {BRAND.name} was placed successfully.</p>

        <div className="mt-8 rounded-2xl bg-store-faint p-6 text-left text-sm">
          <p><strong>Order ID:</strong> {orderId}</p>
          <p className="mt-1"><strong>Payment ID:</strong> {paymentId || order?.razorpayPaymentId}</p>
          {order && (
            <p className="mt-1"><strong>Total:</strong> {formatPrice(order.totalAmount)}</p>
          )}
        </div>

        {order?.deliveryAddress && (
          <div className="mt-6 rounded-2xl border border-store-border p-6 text-left text-sm">
            <h3 className="font-semibold">Delivery Address</h3>
            <p className="mt-2 text-store-muted">
              {order.deliveryAddress.name}<br />
              {order.deliveryAddress.street}<br />
              {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}<br />
              {order.deliveryAddress.phone}
            </p>
          </div>
        )}

        {order?.items && order.items.length > 0 && (
          <div className="mt-6 space-y-3 text-left">
            <h3 className="font-semibold">Ordered Items</h3>
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-3 rounded-xl border border-store-border p-3">
                <motion.div whileHover={{ scale: 1.05 }} className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-store-faint flex items-center justify-center">
                  {item.image ? (
                    <Image src={item.image} alt={item.name || ''} fill className="object-cover" sizes="56px" />
                  ) : (
                    <span className="text-xs text-store-muted">No image</span>
                  )}
                </motion.div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-store-muted">Size {item.size} × {item.quantity}</p>
                  <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/products" className="btn-primary mt-10 inline-flex">
          Continue Shopping
        </Link>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container-main py-20 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
