'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api, { type CartData, type DeliveryAddress, type Order } from '@/services/api';
import { formatPrice, BRAND } from '@/lib/constants';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useRazorpay, preloadRazorpay } from '@/hooks/useRazorpay';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { requireAuth, isAuthenticated } = useRequireAuth('/checkout');
  const { pay } = useRazorpay();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<DeliveryAddress>({
    name: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      requireAuth('checkout');
      return;
    }
    api.get('/cart').then((res) => setCart(res.data.data)).catch(() => setCart(null));

    // Preload Razorpay script early to reduce delay when user clicks pay
    // Don't block rendering on this; fire-and-forget
    preloadRazorpay().catch(() => {
      /* ignore preload errors */
    });
  }, [isAuthenticated, requireAuth]);

  function updateField(field: keyof DeliveryAddress, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!cart?.items?.length) return;
    setLoading(true);

    try {
      const orderRes = await api.post<{ success: boolean; data: Order }>('/orders', {
        deliveryAddress: form,
      });
      const order = orderRes.data.data;

      const payRes = await api.post('/payments/razorpay/order', { orderId: order._id });
      const payData = payRes.data.data;

      await pay({
        key: payData.keyId,
        amount: payData.amount,
        currency: payData.currency,
        name: payData.name,
        description: payData.description,
        order_id: payData.razorpayOrderId,
        prefill: payData.prefill,
        handler: async (response) => {
          const verifyRes = await api.post('/payments/razorpay/verify', {
            orderId: order._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          const finalized = verifyRes.data.data;
          // Clear frontend cart state instantly
          useCartStore.getState().clear();
          router.push(
            `/order/success?id=${finalized._id}&paymentId=${response.razorpay_payment_id}`
          );
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'try again clicking the button');
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="container-main py-10 md:py-14">
      <h1 className="section-title">Checkout — {BRAND.name}</h1>
      <form onSubmit={handlePayment} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 rounded-2xl border border-store-border p-6"
        >
          <h2 className="font-semibold">Delivery Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="input-elegant sm:col-span-2"
            />
            <input
              required
              type="tel"
              placeholder="Phone (10 digits)"
              pattern="[6-9][0-9]{9}"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="input-elegant"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="input-elegant"
            />
            <input
              required
              placeholder="Street address"
              value={form.street}
              onChange={(e) => updateField('street', e.target.value)}
              className="input-elegant sm:col-span-2"
            />
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="input-elegant"
            />
            <input
              required
              placeholder="State"
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
              className="input-elegant"
            />
            <input
              required
              placeholder="Pincode"
              pattern="[0-9]{6}"
              value={form.pincode}
              onChange={(e) => updateField('pincode', e.target.value)}
              className="input-elegant"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-fit rounded-2xl border border-store-border bg-store-faint p-6"
        >
          <h2 className="font-semibold">Order Summary</h2>
          {cart && (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }} className="flex justify-between text-green-700">
                <dt>Discount</dt>
                <dd>-{formatPrice(cart.discount)}</dd>
              </motion.div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{formatPrice(cart.deliveryCharge)}</dd>
              </div>
              <div className="flex justify-between border-t border-store-border pt-3 font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(cart.totalAmount)}</dd>
              </div>
            </dl>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !cart?.items?.length}
            className="btn-primary mt-6 w-full"
          >
            <span className="flex items-center justify-center gap-3">
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? 'Processing...' : !cart ? 'Loading...' : !cart.items?.length ? 'Cart empty' : 'Pay with Razorpay'}
            </span>
          </motion.button>
          <p className="mt-3 text-center text-xs text-store-muted">Secured by Razorpay</p>
        </motion.div>
      </form>
    </div>
  );
}
