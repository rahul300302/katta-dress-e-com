'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Truck } from 'lucide-react';
import api from '@/services/api';

const DEFAULT_TEXT = "Free shipping on orders above ₹999 · Premium men's tees only";

export default function AnnouncementEditor() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/site/announcement')
      .then((res) => {
        if (res.data.success && res.data.data?.text) {
          setText(res.data.data.text);
        }
      })
      .catch(() => setText(DEFAULT_TEXT))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/site/announcement', { text: text.trim() });
      if (res.data.success) {
        setText(res.data.data.text);
        setMessage('Announcement saved! It is live on the homepage banner.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage(msg || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-store-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading announcement...
      </div>
    );
  }

  return (
    <section className="surface-card p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-store-muted">
        <Truck className="h-4 w-4" />
        Top banner
      </p>
      <h2 className="mt-1 font-display text-xl font-bold">Free delivery / announcement bar</h2>
      <p className="mt-1 text-sm text-store-muted">
        Edit the black bar at the top of every page (e.g. free shipping message).
      </p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
        placeholder="e.g. Free delivery on orders above ₹999"
        className="input-elegant mt-4"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save announcement'}
        </button>
        <span className="text-xs text-store-muted">{text.length}/200</span>
      </div>
      {message && (
        <p
          className={`mt-3 rounded-xl px-4 py-3 text-sm ${
            message.includes('live') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </p>
      )}
      <div className="mt-4 rounded-lg bg-store-text py-2 text-center text-xs font-medium text-white sm:text-sm">
        Preview: {text || DEFAULT_TEXT}
      </div>
    </section>
  );
}
