'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import api, { type Order } from '@/services/api';
import { formatPrice } from '@/lib/constants';
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid';

const statusColors: Record<string, string> = {
  placed: 'bg-store-faint text-store-muted',
  confirmed: 'bg-store-faint text-blue-600 dark:text-blue-400',
  shipped: 'bg-store-faint text-amber-600 dark:text-amber-400',
  delivered: 'bg-store-faint text-green-600 dark:text-green-400',
  cancelled: 'bg-store-faint text-red-500',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/my')
      .then((res) => setOrders(res.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Package className="h-5 w-5" />
          My orders
        </h2>
        <p className="mt-1 text-sm text-store-muted">Track your KATTA orders and delivery status.</p>
      </div>

      {loading ? (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="py-16 text-center text-store-muted"
        >
          Loading orders...
        </motion.div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center rounded-2xl border border-store-border bg-store-faint py-16 text-center"
        >
          <Package className="mb-4 h-14 w-14 text-store-muted" />
          <p className="font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-store-muted">Your purchases will appear here</p>
          <Link href="/products" className="btn-primary mt-6">
            Shop T-Shirts
          </Link>
        </motion.div>
      ) : (
        <StaggerGrid className="space-y-4">
          {orders.map((order) => (
            <StaggerItem key={order._id}>
              <Link
                href={`/order/success?id=${order._id}${order.razorpayPaymentId ? `&paymentId=${order.razorpayPaymentId}` : ''}`}
                className="surface-card group flex flex-col gap-4 p-5 transition hover:border-store-text hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="relative flex h-14 w-12 items-center justify-center overflow-hidden rounded-lg border-2 border-store-bg bg-store-faint"
                      >
                        {item.image ? (
                          <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <span className="px-0.5 text-center text-[8px] text-store-muted">No img</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-store-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                    <p className="mt-1 font-bold">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusColors[order.orderStatus] || statusColors.placed
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.paymentStatus === 'paid'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-store-muted'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                  <ChevronRight className="h-5 w-5 text-store-muted transition group-hover:translate-x-1" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
