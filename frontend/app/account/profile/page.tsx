'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useMounted } from '@/hooks/useMounted';
import type { DeliveryAddress } from '@/services/api';
import {
  geolocationErrorMessage,
  getAccuratePosition,
  isAddressComplete,
  reverseGeocode,
  sanitizeAddress,
} from '@/lib/addressUtils';
import { Loader2, MapPin } from 'lucide-react';

const emptyAddress: DeliveryAddress = {
  name: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const mounted = useMounted();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState(user?.name ?? '');
  const [address, setAddress] = useState<DeliveryAddress>(
    user?.addresses?.[0] ?? {
      ...emptyAddress,
      email: user?.email ?? '',
    }
  );
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/account/profile');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    const saved = user.addresses?.[0];
    setAddress(
      saved
        ? { ...saved, name: saved.name || user.name, email: saved.email || user.email }
        : { ...emptyAddress, name: user.name, email: user.email }
    );
  }, [user]);

  if (!mounted) {
    return (
      <div className="container-main py-20 text-center text-store-muted">
        Loading profile...
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const handleFieldChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage('Please enter your name.');
      return;
    }

    // Normalize phone: strip non-digits, remove leading country code if present
    let phoneDigits = (address.phone || '').replace(/\D/g, '');
    if (phoneDigits.startsWith('91') && phoneDigits.length > 10) {
      phoneDigits = phoneDigits.slice(-10);
    }

    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      setMessage('Please enter a valid 10-digit Indian phone number (example: 9876543210).');
      return;
    }

    setSaving(true);

    const saved = sanitizeAddress({
      ...address,
      name: trimmedName,
      email: user.email,
      phone: phoneDigits,
    });

    if (!isAddressComplete(saved)) {
      setMessage('Please fill street, city, state and a valid 6-digit pincode.');
      return;
    }

    try {
      const payload = {
        name: trimmedName,
        addresses: [saved],
      };

      const response = await api.patch('/auth/me', payload);
      if (response.data.success) {
        setAuth(token ?? '', response.data.data);
        setMessage('Profile saved successfully.');
      } else {
        setMessage(response.data.message || 'Unable to save profile.');
      }
    } catch (error) {
      setMessage('Unable to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-main py-10 md:py-14">
      <h1 className="section-title">My Profile</h1>
      <p className="mt-2 text-store-muted">Update your name and saved delivery address for faster checkout.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="surface-card rounded-3xl border border-store-border p-6">
          <h2 className="text-lg font-semibold">Account Details</h2>
          <p className="mt-2 text-sm text-store-muted">Your email is managed through Google sign-in.</p>
          <div className="mt-6 space-y-4 text-sm text-store-text">
            <div>
              <p className="font-semibold">Name</p>
              <p className="mt-1 text-store-muted">{user.name}</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p className="mt-1 text-store-muted">{user.email}</p>
            </div>
            <div>
              <p className="font-semibold">Role</p>
              <p className="mt-1 text-store-muted capitalize">{user.role}</p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="surface-card rounded-3xl border border-store-border p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Saved Shipping Address</h2>
              <p className="mt-2 text-sm text-store-muted">
                This exact address is used when you tap &quot;Saved address&quot; at checkout.
              </p>
            </div>
            <button
              type="button"
              disabled={locating}
              onClick={async () => {
                setLocating(true);
                setMessage(null);
                try {
                  const pos = await getAccuratePosition();
                  const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                  setAddress((a) =>
                    sanitizeAddress({
                      ...a,
                      street: geo.street || a.street,
                      city: geo.city || a.city,
                      state: geo.state || a.state,
                      pincode: geo.pincode || a.pincode,
                    })
                  );
                  setMessage('Location filled — please verify street and pincode, then Save Profile.');
                } catch (err) {
                  if (err && typeof err === 'object' && 'code' in err) {
                    setMessage(geolocationErrorMessage((err as GeolocationPositionError).code));
                  } else {
                    setMessage(
                      err instanceof Error ? err.message : 'Could not get location'
                    );
                  }
                } finally {
                  setLocating(false);
                }
              }}
              className="btn-secondary flex items-center gap-2 !px-3 !py-2 text-xs"
            >
              {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
              {locating ? 'Locating...' : 'Use current location'}
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Full name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input-elegant mt-2 w-full"
                placeholder="Recipient name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                value={user.email}
                readOnly
                className="input-elegant mt-2 w-full bg-store-bg/80"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Phone</span>
              <input
                type="tel"
                value={address.phone}
                onChange={(event) => handleFieldChange('phone', event.target.value)}
                className="input-elegant mt-2 w-full"
                placeholder="+91 98765 43210"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Street</span>
              <input
                type="text"
                value={address.street}
                onChange={(event) => handleFieldChange('street', event.target.value)}
                className="input-elegant mt-2 w-full"
                placeholder="House no, street, landmark"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">City</span>
              <input
                type="text"
                value={address.city}
                onChange={(event) => handleFieldChange('city', event.target.value)}
                className="input-elegant mt-2 w-full"
                placeholder="City"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">State</span>
              <input
                type="text"
                value={address.state}
                onChange={(event) => handleFieldChange('state', event.target.value)}
                className="input-elegant mt-2 w-full"
                placeholder="State"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Pincode</span>
              <input
                type="text"
                value={address.pincode}
                onChange={(event) => handleFieldChange('pincode', event.target.value)}
                className="input-elegant mt-2 w-full"
                placeholder="Pin code"
              />
            </label>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl bg-store-faint px-4 py-3 text-sm text-store-muted">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary mt-6 w-full"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
