'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import api, { type CartData } from '@/services/api';
import { formatPrice } from '@/lib/constants';
import { useMounted } from '@/hooks/useMounted';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function CartPage() {
  const router = useRouter();
  const mounted = useMounted();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const { requireAuth } = useRequireAuth('/cart');
  const fetchCart = useCartStore((s) => s.fetchCart);
  const setFromCart = useCartStore((s) => s.setFromCart);
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchCart()
      .then((data) => {
        if (cancelled) return;
        setCart(data);
        if (data) setFromCart(data);
      })
      .catch(() => {
        if (!cancelled) setCart(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, isAuthenticated, fetchCart, setFromCart]);

  if (!mounted) {
    return (
      <div className="container-main py-20 text-center text-store-muted">Loading...</div>
    );
  }

  async function updateQty(itemId: string, quantity: number) {
    const res = await api.patch(`/cart/${itemId}`, { quantity });
    const data = res.data.data;
    setCart(data);
    setFromCart(data);
  }

  async function removeItem(itemId: string) {
    const res = await api.delete(`/cart/${itemId}`);
    const data = res.data.data;
    setCart(data);
    setFromCart(data);
  }

  function handleCheckout() {
    if (!requireAuth('checkout')) return;
    router.push('/checkout');
  }

  if (!isAuthenticated) {
    return (
      <div className="container-main flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-store-muted" />
        <h1 className="section-title">Your Cart</h1>
        <p className="mt-2 text-store-muted">Sign in with Google to view and manage your cart</p>
        <Link href="/auth/login?redirect=/cart" className="btn-primary mt-8">
          Sign in with Google
        </Link>
        <Link href="/products" className="mt-4 text-sm underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-main py-20 text-center">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          Loading cart...
        </motion.div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container-main flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-store-muted" />
        <h1 className="section-title">Cart is empty</h1>
        <Link href="/products" className="btn-primary mt-8">
          Shop T-Shirts
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="container-main py-10 md:py-14">
      <h1 className="section-title">Your Cart</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cart.items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-card flex gap-4 p-4"
            >
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-store-faint flex items-center justify-center">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                    sizes="96px"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-store-muted/30 to-store-muted/10 flex items-center justify-center">
                    <span className="text-xs text-store-muted">No image</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-store-muted">Size: {item.size}</p>
                  <p className="font-bold">{formatPrice(item.price)}</p>
                </motion.div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-store-border">
                    <button
                      type="button"
                      onClick={() => updateQty(item._id, Math.max(1, item.quantity - 1))}
                      className="p-2"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[32px] text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item._id, item.quantity + 1)}
                      className="p-2"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item._id)}
                    className="text-store-muted hover:text-red-600"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-fit rounded-2xl border border-store-border bg-store-faint p-6"
        >
          <h2 className="font-semibold">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }} className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </motion.div>
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <dt>Discount</dt>
              <dd>-{formatPrice(cart.discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{formatPrice(cart.deliveryCharge)}</dd>
            </div>
            <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }} className="flex justify-between border-t border-store-border pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(cart.totalAmount)}</dd>
            </motion.div>
          </dl>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleCheckout}
            className="btn-primary mt-6 w-full"
          >
            Proceed to Checkout
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
