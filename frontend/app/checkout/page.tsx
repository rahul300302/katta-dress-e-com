'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, MapPin, RotateCcw, Save } from 'lucide-react';
import { sanitizeAddress } from '@/lib/addressUtils';
import api, { type CartData, type Order } from '@/services/api';
import { formatPrice, BRAND } from '@/lib/constants';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useRazorpay, preloadRazorpay } from '@/hooks/useRazorpay';
import { useCartStore } from '@/store/cartStore';
import { useDeliveryAddress } from '@/hooks/useDeliveryAddress';
import AnimatedHeading from '@/components/motion/AnimatedHeading';
import { popIn, slideInLeft, slideInRight } from '@/lib/motion';

export default function CheckoutPage() {
  const router = useRouter();
  const { requireAuth, isAuthenticated } = useRequireAuth('/checkout');
  const { pay } = useRazorpay();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    form,
    updateField,
    addressSource,
    loadingAddress,
    locationLoading,
    locationError,
    locationPreview,
    hasSavedAddress,
    savingAddress,
    applySavedAddress,
    useCurrentLocation,
    saveAddressToProfile,
  } = useDeliveryAddress(isAuthenticated);

  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    if (!isAuthenticated) {
      requireAuth('checkout');
      return;
    }
    let cancelled = false;
    fetchCart()
      .then((data) => {
        if (!cancelled) setCart(data);
      })
      .catch(() => {
        if (!cancelled) setCart(null);
      });
    preloadRazorpay().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, fetchCart]);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!cart?.items?.length) return;
    setLoading(true);

    try {
      const orderRes = await api.post<{ success: boolean; data: Order }>('/orders', {
        deliveryAddress: sanitizeAddress(form),
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
      <AnimatedHeading title={`Checkout — ${BRAND.name}`} subtitle="Secure payment via Razorpay" />
      <form onSubmit={handlePayment} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideInLeft}
          className="surface-card space-y-4 p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-store-text">Delivery Address</h2>
              {loadingAddress && !form.street ? (
                <p className="mt-1 text-sm text-store-muted">Loading your saved address...</p>
              ) : addressSource === 'saved' ? (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  Filled from your saved address. You can edit any field below.
                </p>
              ) : addressSource === 'location' ? (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  Street, city and pincode filled from your current location.
                </p>
              ) : (
                <p className="mt-1 text-sm text-store-muted">
                  Enter your address or use the buttons below to auto-fill.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {hasSavedAddress && (
                <button
                  type="button"
                  onClick={applySavedAddress}
                  disabled={loadingAddress}
                  className="btn-secondary flex items-center gap-1.5 !px-3 !py-2 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Saved address
                </button>
              )}
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locationLoading || loadingAddress}
                className="btn-secondary flex items-center gap-1.5 !px-3 !py-2 text-xs"
              >
                {locationLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                {locationLoading ? 'Locating...' : 'Use current location'}
              </button>
            </div>
          </div>

          {locationPreview && !locationError && (
            <p className="rounded-xl border border-store-border bg-store-faint px-4 py-3 text-sm text-store-muted">
              {locationPreview}
            </p>
          )}

          {locationError && (
            <p className="rounded-xl border border-red-500/30 bg-store-faint px-4 py-3 text-sm text-red-500">
              {locationError}
            </p>
          )}

          <button
            type="button"
            onClick={() => saveAddressToProfile()}
            disabled={savingAddress || loadingAddress}
            className="btn-secondary flex w-full items-center justify-center gap-2 text-sm sm:w-auto"
          >
            {savingAddress ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savingAddress ? 'Saving...' : 'Save this address to my profile'}
          </button>

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
          initial="hidden"
          animate="visible"
          variants={slideInRight}
          className="h-fit rounded-2xl border border-store-border bg-store-faint p-6"
        >
          <h2 className="font-semibold text-store-text">Order Summary</h2>
          {cart && (
            <dl className="mt-4 space-y-2 text-sm text-store-text">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <dt>Discount</dt>
                <dd>-{formatPrice(cart.discount)}</dd>
              </div>
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
              {loading
                ? 'Processing...'
                : !cart
                  ? 'Loading...'
                  : !cart.items?.length
                    ? 'Cart empty'
                    : 'Pay with Razorpay'}
            </span>
          </motion.button>
          <p className="mt-3 text-center text-xs text-store-muted">Secured by Razorpay</p>
        </motion.div>
      </form>
    </div>
  );
}
