'use client';

import { useState } from 'react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, User } from 'lucide-react';

export default function AccountDetailsPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user)!;
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage('Please enter your name.');
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.patch('/auth/me', { name: trimmed });
      if (res.data.success) {
        setAuth(token ?? '', res.data.data);
        setName(res.data.data.name);
        setMessage('Name updated successfully.');
      }
    } catch {
      setMessage('Could not update name. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <User className="h-5 w-5" />
          Personal details
        </h2>
        <p className="mt-1 text-sm text-store-muted">Your name shown on orders and delivery.</p>
      </div>

      <form onSubmit={handleSubmit} className="surface-card max-w-lg space-y-5 rounded-2xl border border-store-border p-6">
        <label className="block">
          <span className="text-sm font-medium">Display name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-elegant mt-2 w-full"
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={user.email}
            readOnly
            className="input-elegant mt-2 w-full bg-store-faint"
          />
          <p className="mt-1 text-xs text-store-muted">Managed by Google sign-in — cannot be changed here.</p>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Account type</span>
          <input
            type="text"
            value={user.role}
            readOnly
            className="input-elegant mt-2 w-full capitalize bg-store-faint"
          />
        </label>

        {message && (
          <p className="rounded-xl bg-store-faint px-4 py-3 text-sm text-store-muted">{message}</p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Save name'
          )}
        </button>
      </form>
    </div>
  );
}
