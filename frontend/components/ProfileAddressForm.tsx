'use client';

import type { DeliveryAddress } from '@/services/api';
import {
  ADDRESS_LABELS,
  INDIAN_STATES,
  TSHIRT_SIZES,
} from '@/lib/addressUtils';

interface Props {
  name: string;
  email: string;
  address: DeliveryAddress;
  locating: boolean;
  onNameChange: (value: string) => void;
  onFieldChange: (field: keyof DeliveryAddress, value: string) => void;
  onUseLocation: () => void;
}

export default function ProfileAddressForm({
  name,
  email,
  address,
  locating,
  onNameChange,
  onFieldChange,
  onUseLocation,
}: Props) {
  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="text-sm font-medium text-store-text">Address type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ADDRESS_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onFieldChange('label', label)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                address.label === label ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">Full name (recipient)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="input-elegant mt-2 w-full"
            placeholder="Name on delivery"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            readOnly
            className="input-elegant mt-2 w-full bg-store-faint"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Mobile number</span>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            className="input-elegant mt-2 w-full"
            placeholder="9876543210"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">Alternate phone (optional)</span>
          <input
            type="tel"
            value={address.alternatePhone || ''}
            onChange={(e) => onFieldChange('alternatePhone', e.target.value)}
            className="input-elegant mt-2 w-full"
            placeholder="For delivery calls"
          />
        </label>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Delivery location</p>
          <button
            type="button"
            disabled={locating}
            onClick={onUseLocation}
            className="btn-secondary !px-3 !py-2 text-xs"
          >
            {locating ? 'Locating...' : 'Use current location'}
          </button>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Flat / House / Building</span>
            <input
              type="text"
              value={address.flatHouse || ''}
              onChange={(e) => onFieldChange('flatHouse', e.target.value)}
              className="input-elegant mt-2 w-full"
              placeholder="e.g. 12B, Rose Apartments"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Area / Street / Locality</span>
            <input
              type="text"
              value={address.area || ''}
              onChange={(e) => onFieldChange('area', e.target.value)}
              className="input-elegant mt-2 w-full"
              placeholder="e.g. Vadasery, Main Road"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Landmark (optional)</span>
            <input
              type="text"
              value={address.landmark || ''}
              onChange={(e) => onFieldChange('landmark', e.target.value)}
              className="input-elegant mt-2 w-full"
              placeholder="Near temple, bus stand, etc."
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Full street (if not split above)</span>
            <input
              type="text"
              value={address.street}
              onChange={(e) => onFieldChange('street', e.target.value)}
              className="input-elegant mt-2 w-full"
              placeholder="Or paste full address line"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">City</span>
            <input
              type="text"
              value={address.city}
              onChange={(e) => onFieldChange('city', e.target.value)}
              className="input-elegant mt-2 w-full"
              placeholder="Nagercoil"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">State</span>
            <select
              value={address.state}
              onChange={(e) => onFieldChange('state', e.target.value)}
              className="input-elegant mt-2 w-full"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Pincode</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={address.pincode}
              onChange={(e) => onFieldChange('pincode', e.target.value)}
              className="input-elegant mt-2 w-full"
              placeholder="629001"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Usual t-shirt size (optional)</p>
        <p className="mt-1 text-xs text-store-muted">Helps us pre-select size at checkout later.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TSHIRT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onFieldChange('preferredSize', address.preferredSize === size ? '' : size)}
              className={`min-w-[44px] rounded-full border px-3 py-2 text-xs font-bold transition ${
                address.preferredSize === size ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Delivery instructions (optional)</span>
        <textarea
          rows={3}
          value={address.deliveryInstructions || ''}
          onChange={(e) => onFieldChange('deliveryInstructions', e.target.value)}
          className="input-elegant mt-2 w-full resize-none"
          placeholder="e.g. Call before delivery, security gate code, weekend only..."
        />
      </label>
    </div>
  );
}
