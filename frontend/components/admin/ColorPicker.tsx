'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const PRESET_COLORS = [
  'Black',
  'White',
  'Navy',
  'Grey',
  'Olive',
  'Orange',
  'Red',
  'Beige',
  'Brown',
  'Maroon',
];

interface Props {
  colors: string[];
  onChange: (colors: string[]) => void;
}

export default function ColorPicker({ colors, onChange }: Props) {
  const [custom, setCustom] = useState('');

  function addColor(name: string) {
    const c = name.trim();
    if (!c) return;
    const exists = colors.some((x) => x.toLowerCase() === c.toLowerCase());
    if (!exists) onChange([...colors, c]);
    setCustom('');
  }

  function removeColor(name: string) {
    if (colors.length <= 1) return;
    onChange(colors.filter((c) => c !== name));
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase text-store-muted">Colors</label>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 rounded-full border border-store-border bg-store-faint px-3 py-1 text-sm font-medium"
          >
            {c}
            <button
              type="button"
              onClick={() => removeColor(c)}
              className="rounded-full p-0.5 hover:bg-white"
              aria-label={`Remove ${c}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.filter((p) => !colors.some((c) => c.toLowerCase() === p.toLowerCase())).map(
          (p) => (
            <button
              key={p}
              type="button"
              onClick={() => addColor(p)}
              className="rounded-full border border-dashed border-store-border px-3 py-1 text-xs font-medium text-store-muted transition hover:border-store-text hover:text-store-text"
            >
              + {p}
            </button>
          )
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Custom color name"
          className="input-elegant flex-1 !py-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addColor(custom);
            }
          }}
        />
        <button type="button" onClick={() => addColor(custom)} className="btn-secondary !px-3 !py-2">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
