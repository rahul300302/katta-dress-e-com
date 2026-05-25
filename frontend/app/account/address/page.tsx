'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { DeliveryAddress } from '@/services/api';
import {
  buildAddressFromUser,
  emptyDeliveryAddress,
  formatSavedAddressBlock,
  geolocationErrorMessage,
  getAccuratePosition,
  isAddressComplete,
  reverseGeocode,
  sanitizeAddress,
} from '@/lib/addressUtils';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import ProfileAddressForm from '@/components/ProfileAddressForm';

export default function AccountAddressPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user)!;
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState(user.name || '');
  const [address, setAddress] = useState<DeliveryAddress>(() =>
    buildAddressFromUser(user, user.addresses?.[0])
  );
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageOk, setMessageOk] = useState(false);

  const applyUser = useCallback(
    (fresh: typeof user) => {
      setName(fresh.name || '');
      setAddress(buildAddressFromUser(fresh, fresh.addresses?.[0]));
    },
    []
  );

  useEffect(() => {
    applyUser(user);
  }, [user, applyUser]);

  const savedComplete = isAddressComplete(address);
  const previewLines = savedComplete ? formatSavedAddressBlock(address) : [];

  const handleFieldChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress((c) => ({ ...c, [field]: value }));
  };

  const handleUseLocation = async () => {
    setLocating(true);
    setMessage(null);
    try {
      const pos = await getAccuratePosition();
      const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setAddress((a) =>
        sanitizeAddress({
          ...a,
          area: geo.street || a.area,
          city: geo.city || a.city,
          state: geo.state || a.state,
          pincode: geo.pincode || a.pincode,
        })
      );
      setMessageOk(false);
      setMessage('Location filled — verify fields, then save.');
    } catch (err) {
      setMessageOk(false);
      if (err && typeof err === 'object' && 'code' in err) {
        setMessage(geolocationErrorMessage((err as GeolocationPositionError).code));
      } else {
        setMessage(err instanceof Error ? err.message : 'Could not get location');
      }
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessageOk(false);
      setMessage('Please enter recipient name.');
      return;
    }

    const saved = sanitizeAddress({ ...address, name: trimmedName, email: user.email });

    if (!/^[6-9]\d{9}$/.test(saved.phone)) {
      setMessageOk(false);
      setMessage('Enter a valid 10-digit mobile number.');
      return;
    }
    if (saved.alternatePhone && !/^[6-9]\d{9}$/.test(saved.alternatePhone)) {
      setMessageOk(false);
      setMessage('Alternate phone must be 10 digits or empty.');
      return;
    }
    if (!isAddressComplete(saved)) {
      setMessageOk(false);
      setMessage('Complete flat/area, city, state and pincode.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch('/auth/me', { name: trimmedName, addresses: [saved] });
      if (res.data.success) {
        setAuth(token ?? '', res.data.data);
        applyUser(res.data.data);
        setMessageOk(true);
        setMessage('Address saved successfully.');
      }
    } catch (err: unknown) {
      setMessageOk(false);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage(msg || 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <MapPin className="h-5 w-5" />
          Delivery address
        </h2>
        <p className="mt-1 text-sm text-store-muted">
          Used for all KATTA deliveries and &quot;Saved address&quot; at checkout.
        </p>
      </div>

      {savedComplete && (
        <div className="rounded-2xl border border-green-500/30 bg-store-faint p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Current saved address
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {previewLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="surface-card rounded-2xl border border-store-border p-6">
        <ProfileAddressForm
          name={name}
          email={user.email}
          address={address}
          locating={locating}
          onNameChange={setName}
          onFieldChange={handleFieldChange}
          onUseLocation={handleUseLocation}
        />

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                messageOk ? 'text-green-600 dark:text-green-400' : 'text-red-600'
              }`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={saving} className="btn-primary mt-6 w-full">
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Save delivery address'
          )}
        </button>
      </form>
    </div>
  );
}
