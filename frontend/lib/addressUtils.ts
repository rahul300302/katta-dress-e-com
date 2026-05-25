import type { DeliveryAddress } from '@/services/api';
import type { ApiUser } from '@/store/authStore';

export const emptyDeliveryAddress = (): DeliveryAddress => ({
  name: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  state: 'Tamil Nadu',
  pincode: '',
});

export function normalizePhone(phone: string): string {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

export function sanitizeAddress(addr: DeliveryAddress): DeliveryAddress {
  return {
    name: (addr.name || '').trim().replace(/\s+/g, ' '),
    phone: normalizePhone(addr.phone || ''),
    email: (addr.email || '').trim().toLowerCase(),
    street: (addr.street || '').trim().replace(/\s+/g, ' '),
    city: (addr.city || '').trim().replace(/\s+/g, ' '),
    state: (addr.state || '').trim().replace(/\s+/g, ' '),
    pincode: (addr.pincode || '').replace(/\D/g, '').slice(0, 6),
  };
}

export function isAddressComplete(addr?: Partial<DeliveryAddress> | null): boolean {
  if (!addr) return false;
  const normalized = sanitizeAddress({
    name: addr.name || '',
    phone: addr.phone || '',
    email: addr.email || '',
    street: addr.street || '',
    city: addr.city || '',
    state: addr.state || '',
    pincode: addr.pincode || '',
  });
  return Boolean(
    normalized.name &&
      /^[6-9]\d{9}$/.test(normalized.phone) &&
      normalized.email &&
      normalized.street.length >= 5 &&
      normalized.city &&
      normalized.state &&
      /^\d{6}$/.test(normalized.pincode)
  );
}

export function buildAddressFromUser(
  user: ApiUser | null,
  saved?: Partial<DeliveryAddress> | null
): DeliveryAddress {
  const base = saved || user?.addresses?.[0];
  return sanitizeAddress({
    name: base?.name?.trim() || user?.name?.trim() || '',
    phone: base?.phone || '',
    email: base?.email?.trim() || user?.email?.trim() || '',
    street: base?.street?.trim() || '',
    city: base?.city?.trim() || '',
    state: base?.state?.trim() || 'Tamil Nadu',
    pincode: base?.pincode || '',
  });
}

/** Better accuracy for India — free client API */
async function reverseGeocodeBigDataCloud(
  latitude: number,
  longitude: number
): Promise<Partial<DeliveryAddress>> {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('localityLanguage', 'en');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('BigDataCloud failed');

  const data = await res.json();

  const streetParts = [
    data.houseNumber,
    data.street,
    data.streetName,
    data.locality,
  ].filter((p) => p && typeof p === 'string');

  const city =
    data.city ||
    data.locality ||
    data.localityInfo?.administrative?.find(
      (a: { order?: number; name?: string }) => a.order === 5 || a.order === 4
    )?.name ||
    '';

  const state =
    data.principalSubdivision ||
    data.localityInfo?.administrative?.find((a: { order?: number }) => a.order === 2)?.name ||
    '';

  const pincode = String(data.postcode || data.postalCode || '')
    .replace(/\D/g, '')
    .slice(0, 6);

  const street = streetParts.join(', ').trim();

  if (!street && !city) {
    throw new Error('Could not resolve a street address');
  }

  return {
    street: street || data.locality || '',
    city: city || data.principalSubdivision || '',
    state: state || 'Tamil Nadu',
    pincode: pincode.length === 6 ? pincode : '',
  };
}

async function reverseGeocodeNominatim(
  latitude: number,
  longitude: number
): Promise<Partial<DeliveryAddress>> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '18');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'User-Agent': 'KATTA-Ecommerce/1.0',
    },
  });

  if (!res.ok) throw new Error('Nominatim failed');

  const data = await res.json();
  const a = data.address || {};

  const streetParts = [
    a.house_number,
    a.building,
    a.road || a.street || a.residential,
    a.suburb || a.neighbourhood || a.quarter,
  ].filter(Boolean);

  const city =
    a.city ||
    a.town ||
    a.village ||
    a.suburb ||
    a.state_district ||
    a.county ||
    '';

  const pincode = String(a.postcode || '')
    .replace(/\D/g, '')
    .slice(0, 6);

  return {
    street:
      streetParts.join(', ').trim() ||
      (typeof data.display_name === 'string'
        ? data.display_name.split(',').slice(0, 2).join(', ').trim()
        : ''),
    city: String(city).trim(),
    state: (a.state || '').trim(),
    pincode: pincode.length === 6 ? pincode : '',
  };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<Partial<DeliveryAddress>> {
  let result: Partial<DeliveryAddress> = {};

  try {
    result = await reverseGeocodeBigDataCloud(latitude, longitude);
  } catch {
    result = await reverseGeocodeNominatim(latitude, longitude);
  }

  if (!result.pincode || result.pincode.length !== 6) {
    try {
      const fallback = await reverseGeocodeNominatim(latitude, longitude);
      if (fallback.pincode?.length === 6) {
        result.pincode = fallback.pincode;
      }
      if (!result.street && fallback.street) result.street = fallback.street;
      if (!result.city && fallback.city) result.city = fallback.city;
      if (!result.state && fallback.state) result.state = fallback.state;
    } catch {
      /* keep primary result */
    }
  }

  return result;
}

export function getAccuratePosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    });
  });
}

export function geolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location is turned off. Please enable location access in your browser or device settings, then tap “Use current location” again.';
    case 2:
      return 'Could not detect your position. Check GPS / internet and try again.';
    case 3:
      return 'Location request timed out. Move near a window or enable GPS, then try again.';
    default:
      return 'Could not get your location. Please enter the address manually.';
  }
}

export function formatAddressPreview(addr: Partial<DeliveryAddress>): string {
  const parts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean);
  return parts.join(', ') || 'Address detected';
}
