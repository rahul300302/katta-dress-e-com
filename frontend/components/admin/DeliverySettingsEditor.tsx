'use client';

import { useEffect, useState } from 'react';
import { IndianRupee, Loader2, Save, Truck } from 'lucide-react';
import api from '@/services/api';
import { formatPrice } from '@/lib/constants';

interface DeliverySettings {
  charge: number;
  freeDeliveryMinOrder: number;
}

export default function DeliverySettingsEditor() {
  const [charge, setCharge] = useState('49');
  const [freeMin, setFreeMin] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/site/delivery')
      .then((res) => {
        if (res.data.success) {
          const d = res.data.data as DeliverySettings;
          setCharge(String(d.charge ?? 49));
          setFreeMin(String(d.freeDeliveryMinOrder ?? 0));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/site/delivery', {
        charge: Number(charge),
        freeDeliveryMinOrder: Number(freeMin),
      });
      if (res.data.success) {
        const d = res.data.data as DeliverySettings;
        setCharge(String(d.charge));
        setFreeMin(String(d.freeDeliveryMinOrder));
        setMessage('Delivery settings saved. Cart and checkout will use these values.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage(msg || 'Failed to save delivery settings');
    } finally {
      setSaving(false);
    }
  }

  const chargeNum = Number(charge) || 0;
  const freeNum = Number(freeMin) || 0;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-store-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading delivery settings...
      </div>
    );
  }

  return (
    <section className="surface-card p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-store-muted">
        <Truck className="h-4 w-4" />
        Store delivery
      </p>
      <h2 className="mt-1 font-display text-xl font-bold">Delivery charge</h2>
      <p className="mt-1 text-sm text-store-muted">
        Set the delivery fee shown in cart and checkout. Orders are calculated on the server using
        these values.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Standard delivery charge (₹)</span>
          <div className="relative mt-2">
            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-store-muted" />
            <input
              type="number"
              min={0}
              step={1}
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              className="input-elegant !pl-9"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Free delivery above (₹ subtotal)</span>
          <div className="relative mt-2">
            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-store-muted" />
            <input
              type="number"
              min={0}
              step={1}
              value={freeMin}
              onChange={(e) => setFreeMin(e.target.value)}
              className="input-elegant !pl-9"
              placeholder="0 = always charge delivery"
            />
          </div>
          <p className="mt-1 text-xs text-store-muted">Use 0 to disable free-delivery rule.</p>
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-store-border bg-store-faint p-4 text-sm">
        <p className="font-semibold">Preview</p>
        <ul className="mt-2 space-y-1 text-store-muted">
          <li>
            Subtotal below {freeNum > 0 ? formatPrice(freeNum) : 'any amount'} → delivery{' '}
            {formatPrice(chargeNum)}
          </li>
          {freeNum > 0 && (
            <li>
              Subtotal {formatPrice(freeNum)} or more → <span className="text-green-600">FREE delivery</span>
            </li>
          )}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save delivery settings'}
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 rounded-xl px-4 py-3 text-sm ${
            message.includes('saved') ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
