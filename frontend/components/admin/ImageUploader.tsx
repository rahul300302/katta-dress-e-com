'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import api from '@/services/api';

interface Props {
  images: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    setUploading(true);

    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success && res.data.data?.url) {
          newUrls.push(res.data.data.url);
        }
      }
      onChange([...images, ...newUrls]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Upload failed. Check Cloudinary settings in backend .env');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeImage(url: string) {
    onChange(images.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase text-store-muted">Product images</label>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div
              key={url}
              className="group relative h-20 w-16 overflow-hidden rounded-lg border border-store-border"
            >
              <Image src={url} alt="" fill className="object-cover" sizes="64px" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="btn-secondary flex w-full items-center justify-center gap-2 !py-3 text-sm"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading to Cloudinary...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload from device
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <input
        type="text"
        placeholder="Or paste image URL and press Enter"
        className="input-elegant text-xs"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const val = (e.target as HTMLInputElement).value.trim();
            if (val) {
              onChange([...images, val]);
              (e.target as HTMLInputElement).value = '';
            }
          }
        }}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
