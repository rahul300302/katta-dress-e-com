'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import api from '@/services/api';
import type { ColorVariant } from '@/lib/colorVariants';

interface Props {
  variants: ColorVariant[];
  onChange: (variants: ColorVariant[]) => void;
}

export default function ColorVariantEditor({ variants, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  function updateVariant(index: number, patch: Partial<ColorVariant>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    onChange([...variants, { name: '', image: '' }]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) {
      alert('Keep at least one color');
      return;
    }
    onChange(variants.filter((_, i) => i !== index));
  }

  async function uploadForIndex(index: number, file: File) {
    setUploadingIndex(index);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.data?.url) {
        updateVariant(index, { image: res.data.data.url });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Upload failed');
    } finally {
      setUploadingIndex(null);
      if (inputRef.current) inputRef.current.value = '';
      setPendingIndex(null);
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase text-store-muted">
        Colors & images (each color needs its own photo)
      </label>
      <p className="text-xs text-store-muted">
        Shoppers pick a color thumbnail on the product page — like your reference design.
      </p>

      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="flex flex-wrap items-start gap-3 rounded-xl border border-store-border bg-store-faint p-3"
          >
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-store-border bg-store-faint">
              {variant.image ? (
                <Image src={variant.image} alt="" fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-store-muted">
                  No img
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <input
                value={variant.name}
                onChange={(e) => updateVariant(index, { name: e.target.value })}
                placeholder="Color name e.g. Red"
                className="input-elegant !py-2 text-sm"
              />
              <button
                type="button"
                disabled={uploadingIndex === index}
                onClick={() => {
                  setPendingIndex(index);
                  inputRef.current?.click();
                }}
                className="btn-secondary flex w-full items-center justify-center gap-2 !py-2 text-xs"
              >
                {uploadingIndex === index ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Upload color image
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeVariant(index)}
              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              aria-label="Remove color"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file != null && pendingIndex != null) uploadForIndex(pendingIndex, file);
        }}
      />

      <button type="button" onClick={addVariant} className="btn-secondary flex w-full gap-2 text-sm">
        <Plus className="h-4 w-4" />
        Add another color
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
