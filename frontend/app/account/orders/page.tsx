'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import api, { type Order } from '@/services/api';
import { formatPrice } from '@/lib/constants';
import { useMounted } from '@/hooks/useMounted';
import { useAuthStore } from '@/store/authStore';

const statusColors: Record<string, string> = {
  placed: 'bg-store-faint text-store-muted',
  confirmed: 'bg-store-faint text-blue-600 dark:text-blue-400',
  shipped: 'bg-store-faint text-amber-600 dark:text-amber-400',
  delivered: 'bg-store-faint text-green-600 dark:text-green-400',
  cancelled: 'bg-store-faint text-red-500',
};

export default function MyOrdersPage() {
  const router = useRouter();
  const mounted = useMounted();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/account/orders');
      return;
    }
    api
      .get('/orders/my')
      .then((res) => setOrders(res.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className="container-main py-20 text-center text-store-muted">Loading...</div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-main py-10 md:py-14"
    >
      <h1 className="section-title">My Orders</h1>
      <p className="mt-2 text-store-muted">Track your KATTA orders and delivery status</p>

      {loading ? (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-12 text-center text-store-muted"
        >
          Loading orders...
        </motion.div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 flex flex-col items-center rounded-2xl border border-store-border bg-store-faint py-16 text-center"
        >
          <Package className="mb-4 h-14 w-14 text-store-muted" />
          <p className="font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-store-muted">Your purchases will appear here</p>
          <Link href="/products" className="btn-primary mt-6">
            Shop T-Shirts
          </Link>
        </motion.div>
      ) : (
        <div className="mt-10 space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/order/success?id=${order._id}${order.razorpayPaymentId ? `&paymentId=${order.razorpayPaymentId}` : ''}`}
                className="surface-card group flex flex-col gap-4 p-5 transition hover:border-store-text hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-4">
                  <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }} className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="relative h-14 w-12 overflow-hidden rounded-lg border-2 border-white bg-store-faint flex items-center justify-center"
                      >
                        {item.image ? (
                          <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <span className="text-[8px] text-store-muted text-center px-0.5">No img</span>
                        )}
                      </div>
                    ))}
                  </motion.div>
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
                        ? 'bg-store-faint text-green-600 dark:text-green-400'
                        : 'bg-store-faint text-store-muted'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                  <ChevronRight className="h-5 w-5 text-store-muted transition group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
