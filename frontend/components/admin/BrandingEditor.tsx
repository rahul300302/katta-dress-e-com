'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Save, Upload, Image as ImageIcon, Settings } from 'lucide-react';
import api from '@/services/api';
import { useSiteStore, type Branding } from '@/store/siteStore';

export default function BrandingEditor() {
  const { branding, fetchBranding, updateBranding, loadingBranding } = useSiteStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [tagline, setTagline] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync local state when global store branding is loaded or changed
  useEffect(() => {
    if (branding) {
      setName(branding.name || 'KATTA');
      setLogo(branding.logo || '/logo.png');
      setTagline(branding.tagline || "Premium Men's T-Shirts");
    }
  }, [branding]);

  async function handleFileUpload(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    setSuccessMessage('');
    setUploading(true);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.data?.url) {
        setLogo(res.data.data.url);
      } else {
        setError('Failed to upload image. No URL returned.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Upload failed. Check Cloudinary settings in backend .env');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Brand name is required');
      return;
    }
    if (!logo.trim()) {
      setError('Logo image URL or upload is required');
      return;
    }

    try {
      const updated: Branding = {
        name: name.trim(),
        logo: logo.trim(),
        tagline: tagline.trim(),
      };
      await updateBranding(updated);
      setSuccessMessage('Store branding updated successfully!');
      // Fetch fresh settings to update the website globally
      await fetchBranding();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to update store branding');
    }
  }

  return (
    <section className="surface-card p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-store-muted">
        <Settings className="h-4 w-4" />
        Site Branding
      </p>
      <h2 className="mt-1 font-display text-xl font-bold">Logo & Site Settings</h2>
      <p className="mt-1 text-sm text-store-muted">
        Configure the global brand identity including name, tagline, and logo icon.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inputs Section */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-store-muted">Brand Name</label>
              <input
                required
                type="text"
                placeholder="e.g. KATTA"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-elegant mt-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-store-muted">Tagline</label>
              <input
                type="text"
                placeholder="e.g. Premium Men's T-Shirts"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="input-elegant mt-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-store-muted">Logo Source</label>
              <div className="mt-2 space-y-3">
                {/* File Upload Button */}
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary flex w-full items-center justify-center gap-2 !py-2.5 text-sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading logo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Logo Image
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />

                {/* Direct URL Input */}
                <input
                  type="text"
                  placeholder="Or paste direct image URL (e.g. /logo.png)"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="input-elegant text-xs"
                />
              </div>
            </div>
          </div>

          {/* Logo / Brand Preview Section */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-store-border bg-store-faint/50 p-6">
            <label className="mb-4 text-xs font-semibold uppercase text-store-muted self-start">Branding Preview</label>
            <div className="flex flex-col items-center text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-[#0a0a0a] ring-1 ring-black/10 flex items-center justify-center">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // fallback icon if image fails to load
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-store-muted" />
                )}
              </div>
              <h3 className="mt-4 font-display text-2xl font-black tracking-tighter text-store-text">
                {name || 'KATTA'}
              </h3>
              <p className="mt-1 text-xs text-store-muted italic">
                {tagline || "Premium Men's T-Shirts"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-store-border pt-4">
          <button type="submit" disabled={loadingBranding || uploading} className="btn-primary text-sm">
            {loadingBranding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loadingBranding ? 'Saving...' : 'Save Branding'}
          </button>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          {successMessage && <p className="text-xs font-medium text-green-600">{successMessage}</p>}
        </div>
      </form>
    </section>
  );
}
