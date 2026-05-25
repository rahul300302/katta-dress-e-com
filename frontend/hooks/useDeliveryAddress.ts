'use client';

import { useEffect, useRef, useState } from 'react';
import api, { type DeliveryAddress } from '@/services/api';
import {
  buildAddressFromUser,
  emptyDeliveryAddress,
  formatAddressPreview,
  geolocationErrorMessage,
  getAccuratePosition,
  isAddressComplete,
  reverseGeocode,
  sanitizeAddress,
} from '@/lib/addressUtils';
import { useAuthStore, type ApiUser } from '@/store/authStore';

export type AddressSource = 'saved' | 'location' | 'manual' | null;

function pickSavedAddress(
  profileAddr: Partial<DeliveryAddress> | undefined,
  lastOrderAddr: Partial<DeliveryAddress> | undefined,
  freshUser: ApiUser | null
) {
  if (isAddressComplete(profileAddr)) {
    const addr = buildAddressFromUser(freshUser, profileAddr);
    return { form: addr, source: 'saved' as const, snapshot: addr, hasSaved: true };
  }
  if (isAddressComplete(lastOrderAddr)) {
    const addr = buildAddressFromUser(freshUser, lastOrderAddr);
    return { form: addr, source: 'saved' as const, snapshot: addr, hasSaved: true };
  }
  const partial = buildAddressFromUser(freshUser);
  const snapshot = isAddressComplete(profileAddr)
    ? buildAddressFromUser(freshUser, profileAddr)
    : isAddressComplete(lastOrderAddr)
      ? buildAddressFromUser(freshUser, lastOrderAddr)
      : null;
  return {
    form: partial,
    source: null,
    snapshot,
    hasSaved: Boolean(snapshot),
  };
}

export function useDeliveryAddress(enabled: boolean) {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState<DeliveryAddress>(() => {
    if (typeof window === 'undefined') return emptyDeliveryAddress();
    const u = useAuthStore.getState().user;
    return u ? buildAddressFromUser(u) : emptyDeliveryAddress();
  });
  const [addressSource, setAddressSource] = useState<AddressSource>(() => {
    const u = useAuthStore.getState().user;
    return u?.addresses?.[0] && isAddressComplete(u.addresses[0]) ? 'saved' : null;
  });
  const [loadingAddress, setLoadingAddress] = useState(enabled);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationPreview, setLocationPreview] = useState('');
  const [hasSavedAddress, setHasSavedAddress] = useState(() => {
    const u = useAuthStore.getState().user;
    return Boolean(u?.addresses?.[0] && isAddressComplete(u.addresses[0]));
  });
  const [savedSnapshot, setSavedSnapshot] = useState<DeliveryAddress | null>(() => {
    const u = useAuthStore.getState().user;
    return u?.addresses?.[0] && isAddressComplete(u.addresses[0])
      ? buildAddressFromUser(u, u.addresses[0])
      : null;
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setLoadingAddress(false);
      return;
    }

    if (!token) {
      setLoadingAddress(false);
      return;
    }

    const fetchId = ++fetchIdRef.current;
    let cancelled = false;

    async function load() {
      setLoadingAddress(true);
      setLocationError('');

      try {
        const [meRes, ordersRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/orders/my').catch(() => null),
        ]);

        if (cancelled || fetchId !== fetchIdRef.current) return;

        const freshUser = meRes.data.success ? meRes.data.data : useAuthStore.getState().user;
        if (meRes.data.success && token) {
          setAuth(token, freshUser);
        }

        const profileAddr = freshUser?.addresses?.[0];
        const lastOrderAddr = ordersRes?.data?.data?.[0]?.deliveryAddress;

        const picked = pickSavedAddress(profileAddr, lastOrderAddr, freshUser);
        setForm(picked.form);
        setAddressSource(picked.source);
        setSavedSnapshot(picked.snapshot);
        setHasSavedAddress(picked.hasSaved);
      } catch {
        if (cancelled || fetchId !== fetchIdRef.current) return;
        const u = useAuthStore.getState().user;
        setForm(buildAddressFromUser(u));
        setAddressSource(null);
      } finally {
        if (!cancelled && fetchId === fetchIdRef.current) {
          setLoadingAddress(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [enabled, token, setAuth]);

  function updateField(field: keyof DeliveryAddress, value: string) {
    setForm((f) => sanitizeAddress({ ...f, [field]: value }));
    setAddressSource('manual');
    setLocationError('');
    setLocationPreview('');
  }

  async function applySavedAddress() {
    setLocationError('');
    setLocationPreview('');

    if (!token) return;
    setLoadingAddress(true);
    try {
      const meRes = await api.get('/auth/me');
      if (!meRes.data.success) return;

      const freshUser = meRes.data.data;
      setAuth(token, freshUser);

      const profileAddr = freshUser.addresses?.[0];
      if (isAddressComplete(profileAddr)) {
        const addr = buildAddressFromUser(freshUser, profileAddr);
        setForm(addr);
        setSavedSnapshot(addr);
        setHasSavedAddress(true);
        setAddressSource('saved');
      } else {
        setLocationError(
          'No complete saved address. Add one under Account → Delivery address.'
        );
      }
    } catch {
      setLocationError('Could not load saved address. Try again.');
    } finally {
      setLoadingAddress(false);
    }
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location. Please enter the address manually.');
      return;
    }

    setLocationLoading(true);
    setLocationError('');
    setLocationPreview('Getting your GPS location...');

    const currentUser = useAuthStore.getState().user;

    try {
      const position = await getAccuratePosition();
      const { latitude, longitude, accuracy } = position.coords;

      setLocationPreview(
        `GPS accuracy ~${Math.round(accuracy)}m — looking up address...`
      );

      const geo = await reverseGeocode(latitude, longitude);
      const merged = sanitizeAddress({
        name: form.name || currentUser?.name || '',
        phone: form.phone || currentUser?.addresses?.[0]?.phone || '',
        email: form.email || currentUser?.email || '',
        street: geo.street || '',
        city: geo.city || '',
        state: geo.state || 'Tamil Nadu',
        pincode: geo.pincode || '',
      });

      if (!merged.street || merged.street.length < 3) {
        throw new Error('Could not detect street. Please type your street / door number manually.');
      }
      if (!merged.pincode || merged.pincode.length !== 6) {
        setLocationError(
          'Pincode could not be detected. Please check city and enter the correct 6-digit pincode.'
        );
      }

      setForm(merged);
      setAddressSource('location');
      setLocationPreview(`Detected: ${formatAddressPreview(merged)}`);
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        setLocationError(geolocationErrorMessage((err as GeolocationPositionError).code));
      } else {
        setLocationError(
          err instanceof Error ? err.message : 'Could not fill address from location'
        );
      }
      setLocationPreview('');
    } finally {
      setLocationLoading(false);
    }
  }

  async function saveAddressToProfile() {
    const currentUser = useAuthStore.getState().user;
    const tokenNow = useAuthStore.getState().token;
    if (!tokenNow || !currentUser) return false;

    const payload = sanitizeAddress(form);
    if (!isAddressComplete(payload)) {
      setLocationError('Please fill all address fields (including valid 6-digit pincode) before saving.');
      return false;
    }

    setSavingAddress(true);
    setLocationError('');
    try {
      const res = await api.patch('/auth/me', {
        name: payload.name,
        addresses: [payload],
      });
      if (res.data.success) {
        setAuth(tokenNow, res.data.data);
        const addr = buildAddressFromUser(res.data.data, res.data.data.addresses?.[0]);
        setSavedSnapshot(addr);
        setHasSavedAddress(true);
        setAddressSource('saved');
        setLocationPreview('Address saved to your profile for next checkout.');
        return true;
      }
    } catch {
      setLocationError('Could not save address to profile.');
    } finally {
      setSavingAddress(false);
    }
    return false;
  }

  return {
    form,
    setForm,
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
  };
}
