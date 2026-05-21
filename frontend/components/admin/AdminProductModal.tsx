'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Eye, Pencil, X } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/services/api';
import { formatPrice, getDiscountPercent } from '@/lib/constants';
import { normalizeProduct } from '@/lib/productStock';
import ProductImageGallery from '@/components/ProductImageGallery';
import ImageUploader from '@/components/admin/ImageUploader';
import ColorVariantEditor from '@/components/admin/ColorVariantEditor';
import { getColorVariants, variantsToProductFields, type ColorVariant } from '@/lib/colorVariants';
import SizeStockEditor from '@/components/admin/SizeStockEditor';
import type { SizeStockMap } from '@/lib/productStock';

type Mode = 'view' | 'edit';

interface Props {
  product: Product | null;
  mode: Mode;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: ProductFormData) => Promise<void>;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  offerPrice: string;
  collection: string;
  sizeStock: SizeStockMap;
  colorVariants: ColorVariant[];
  images: string[];
  isHotSale: boolean;
  isOffer: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

function productToForm(p: Product): ProductFormData {
  const normalized = normalizeProduct(p);
  return {
    name: p.name,
    description: p.description || '',
    price: String(p.price),
    offerPrice: p.offerPrice != null ? String(p.offerPrice) : '',
    collection: p.collection || 'Essentials',
    sizeStock: normalized.sizeStock || {},
    colorVariants: getColorVariants(p).length
      ? getColorVariants(p)
      : [{ name: 'Black', image: p.images?.[0] || '' }],
    images: p.images || [],
    isHotSale: !!p.isHotSale,
    isOffer: !!p.isOffer,
    isNewArrival: !!p.isNewArrival,
    isBestSeller: !!p.isBestSeller,
  };
}

export default function AdminProductModal({ product, mode, open, onClose, onSave }: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>(mode);
  const [form, setForm] = useState<ProductFormData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open && product) {
      setActiveMode(mode);
      setForm(productToForm(product));
    }
  }, [open, product, mode]);

  useEffect(() => {
    if (!open || !mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mounted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !form) return;
    const synced = variantsToProductFields(form.colorVariants);
    if (!synced.colorVariants.length) {
      alert('Add at least one color with an image');
      return;
    }
    if (!Object.keys(form.sizeStock).length) {
      alert('Add stock for at least one size');
      return;
    }
    setSaving(true);
    try {
      await onSave(product._id, {
        ...form,
        colorVariants: synced.colorVariants,
        images: synced.images.length ? synced.images : form.images,
      });
      onClose();
    } catch {
      alert('Failed to update product');
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || !open || !product || !form) return null;

  const p = normalizeProduct(product);
  const price = p.offerPrice && p.offerPrice < p.price ? p.offerPrice : p.price;
  const discount = getDiscountPercent(p.price, p.offerPrice);

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-store-border bg-store-bg text-store-text shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-store-border px-5 py-4">
          <div className="flex items-center gap-2">
            {activeMode === 'view' ? (
              <Eye className="h-4 w-4 text-store-muted" />
            ) : (
              <Pencil className="h-4 w-4 text-store-muted" />
            )}
            <h2 className="font-semibold">
              {activeMode === 'view' ? 'View Product' : 'Edit Product'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activeMode === 'view' ? (
              <button
                type="button"
                onClick={() => setActiveMode('edit')}
                className="btn-secondary !py-2 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveMode('view')}
                className="btn-secondary !py-2 text-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            )}
            <Link
              href={`/products/${product._id}`}
              target="_blank"
              className="btn-secondary !py-2 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Store
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 hover:bg-store-faint"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          {activeMode === 'view' ? (
            <div className="grid gap-8 md:grid-cols-2">
              <ProductImageGallery
                images={getColorVariants(p).map((v) => v.image).filter(Boolean)}
                alt={p.name}
                priority
              />
              <div>
                <p className="text-xs uppercase tracking-wider text-store-muted">{p.collection}</p>
                <h3 className="mt-1 font-display text-2xl font-bold">{p.name}</h3>
                {discount > 0 && (
                  <span className="mt-2 inline-block rounded-full bg-store-text px-3 py-1 text-xs font-semibold text-store-bg">
                    {discount}% OFF
                  </span>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xl font-bold">{formatPrice(price)}</span>
                  {p.offerPrice && p.offerPrice < p.price && (
                    <span className="text-store-muted line-through">{formatPrice(p.price)}</span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-store-muted">{p.description}</p>
                <div className="mt-6">
                  <p className="text-sm font-semibold">Size stock</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(p.sizeStock || {}).map(([s, n]) => (
                      <span
                        key={s}
                        className="rounded-lg border border-store-border px-3 py-1.5 text-sm"
                      >
                        {s}: <strong>{n}</strong>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {getColorVariants(p).map((v) => (
                    <span
                      key={v.name}
                      className="rounded-full border border-store-border px-3 py-1 text-xs"
                    >
                      {v.name}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {p.isHotSale && <span className="rounded-full bg-red-100 px-2 py-1">Hot Sale</span>}
                  {p.isOffer && <span className="rounded-full bg-amber-100 px-2 py-1">Offer</span>}
                  {p.isNewArrival && (
                    <span className="rounded-full bg-blue-100 px-2 py-1">New Arrival</span>
                  )}
                  {p.isBestSeller && (
                    <span className="rounded-full bg-green-100 px-2 py-1">Best Seller</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-store-muted">Image preview</p>
                  <ProductImageGallery images={form.images} alt={form.name || 'Product'} />
                </div>
                <div className="space-y-4">
                  <input
                    required
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-elegant"
                  />
                  <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-elegant min-h-[80px]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      type="number"
                      placeholder="Price ₹"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="input-elegant"
                    />
                    <input
                      type="number"
                      placeholder="Offer ₹"
                      value={form.offerPrice}
                      onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
                      className="input-elegant"
                    />
                  </div>
                  <input
                    placeholder="Collection"
                    value={form.collection}
                    onChange={(e) => setForm({ ...form, collection: e.target.value })}
                    className="input-elegant"
                  />
                </div>
              </div>
              <SizeStockEditor
                value={form.sizeStock}
                onChange={(sizeStock) => setForm({ ...form, sizeStock })}
              />
              <ColorVariantEditor
                variants={form.colorVariants}
                onChange={(colorVariants) => {
                  const synced = variantsToProductFields(colorVariants);
                  setForm({
                    ...form,
                    colorVariants,
                    images: synced.images,
                  });
                }}
              />
              <p className="text-xs text-store-muted">
                Optional: extra gallery images (in addition to color photos)
              </p>
              <ImageUploader
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
              />
              <div className="flex flex-wrap gap-3 text-sm">
                {(['isHotSale', 'isOffer', 'isNewArrival', 'isBestSeller'] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    />
                    {key.replace('is', '')}
                  </label>
                ))}
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
