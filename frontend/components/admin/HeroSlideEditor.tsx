'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import api from '@/services/api';
import { DEFAULT_HERO_SLIDES, newSlideId, type HeroSlide } from '@/lib/heroSlides';

const LINK_PRESETS = [
  { label: 'All products', href: '/products' },
  { label: 'Hot Sales', href: '/products?isHotSale=true' },
  { label: 'New Arrivals', href: '/products?isNewArrival=true' },
  { label: 'Offers', href: '/products?isOffer=true' },
];

export default function HeroSlideEditor() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/site/hero')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length) {
          setSlides(res.data.data);
        }
      })
      .catch(() => setSlides(DEFAULT_HERO_SLIDES))
      .finally(() => setLoading(false));
  }, []);

  function updateSlide(id: string, patch: Partial<HeroSlide>) {
    setSlides((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function moveSlide(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= slides.length) return;
    setSlides((list) => {
      const copy = [...list];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
    setPreviewIndex(next);
  }

  function addSlide() {
    if (slides.length >= 8) {
      alert('Maximum 8 slides');
      return;
    }
    const slide: HeroSlide = {
      id: newSlideId(),
      title: 'New Slide',
      subtitle: 'Add your message here',
      cta: 'Shop Now',
      href: '/products',
      image: DEFAULT_HERO_SLIDES[0].image,
    };
    setSlides((list) => [...list, slide]);
    setPreviewIndex(slides.length);
  }

  function removeSlide(id: string) {
    if (slides.length <= 1) {
      alert('Keep at least one slide');
      return;
    }
    if (!confirm('Remove this slide?')) return;
    setSlides((list) => list.filter((s) => s.id !== id));
    setPreviewIndex(0);
  }

  async function uploadImage(slideId: string, file: File) {
    setUploadingId(slideId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.data?.url) {
        updateSlide(slideId, { image: res.data.data.url });
      }
    } catch {
      alert('Image upload failed. Check Cloudinary settings.');
    } finally {
      setUploadingId(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/site/hero', { slides });
      if (res.data.success) {
        setSlides(res.data.data);
        setMessage('Hero carousel saved! Changes are live on the homepage.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage(msg || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const preview = slides[previewIndex] || slides[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-store-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-store-muted">
            <Sparkles className="h-4 w-4" />
            Homepage hero
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">Hero carousel</h2>
          <p className="mt-1 max-w-xl text-sm text-store-muted">
            Edit titles, images, and buttons. Preview updates as you type. Save to publish on the store homepage.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={addSlide} className="btn-secondary text-sm">
            <Plus className="h-4 w-4" />
            Add slide
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save carousel'}
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            message.includes('live') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </p>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className={`overflow-hidden rounded-2xl border-2 bg-white transition-shadow ${
                index === previewIndex
                  ? 'border-store-text shadow-lg ring-4 ring-store-text/10'
                  : 'border-store-border hover:border-store-text/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-store-border bg-store-faint px-4 py-3">
                <button
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <GripVertical className="h-4 w-4 text-store-muted" />
                  Slide {index + 1}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSlide(index, -1)}
                    className="rounded-lg p-2 hover:bg-white disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1}
                    onClick={() => moveSlide(index, 1)}
                    className="rounded-lg p-2 hover:bg-white disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSlide(slide.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    aria-label="Delete slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-6 p-4 md:grid-cols-[140px_1fr]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-store-faint">
                  {slide.image ? (
                    <Image src={slide.image} alt="" fill className="object-cover" sizes="140px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-store-muted">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <label className="absolute inset-x-2 bottom-2 cursor-pointer">
                    <span className="flex items-center justify-center gap-1 rounded-lg bg-black/70 py-2 text-xs font-medium text-white">
                      {uploadingId === slide.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ImageIcon className="h-3 w-3" />
                      )}
                      Change image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingId === slide.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(slide.id, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <input
                    value={slide.title}
                    onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                    placeholder="Headline"
                    className="input-elegant font-display text-lg font-bold"
                  />
                  <textarea
                    value={slide.subtitle}
                    onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                    placeholder="Subtitle"
                    rows={2}
                    className="input-elegant resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={slide.cta}
                      onChange={(e) => updateSlide(slide.id, { cta: e.target.value })}
                      placeholder="Button text"
                      className="input-elegant"
                    />
                    <select
                      value={slide.href}
                      onChange={(e) => updateSlide(slide.id, { href: e.target.value })}
                      className="input-elegant"
                    >
                      {LINK_PRESETS.map((p) => (
                        <option key={p.href} value={p.href}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    value={slide.href}
                    onChange={(e) => updateSlide(slide.id, { href: e.target.value })}
                    placeholder="Custom link e.g. /products?collection=Street"
                    className="input-elegant text-xs"
                  />
                  <input
                    type="text"
                    value={slide.image}
                    onChange={(e) => updateSlide(slide.id, { image: e.target.value })}
                    placeholder="Or paste image URL"
                    className="input-elegant text-xs"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-store-muted">Live preview</p>
          <div className="overflow-hidden rounded-3xl border border-store-border bg-gradient-to-br from-store-faint to-white shadow-float">
            <div className="relative aspect-[4/5]">
              {preview?.image && (
                <Image src={preview.image} alt="" fill className="object-cover" sizes="400px" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
                  KATTA · Preview
                </p>
                <h3 className="mt-2 font-display text-xl font-bold leading-tight">{preview?.title}</h3>
                <p className="mt-2 text-sm text-white/90">{preview?.subtitle}</p>
                <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-xs font-semibold text-store-text">
                  {preview?.cta}
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-2 border-t border-store-border py-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreviewIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === previewIndex ? 'w-6 bg-store-text' : 'w-2 bg-store-border'
                  }`}
                  aria-label={`Preview slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
