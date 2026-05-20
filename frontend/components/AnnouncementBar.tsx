'use client';

import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import api from '@/services/api';

const DEFAULT_TEXT = "Free shipping on orders above ₹999 · Premium men's tees only";

export default function AnnouncementBar() {
  const [text, setText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    api
      .get('/site/announcement')
      .then((res) => {
        if (res.data.success && res.data.data?.text) {
          setText(res.data.data.text);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-store-text py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
      <span className="inline-flex items-center gap-2 px-4">
        <Truck className="h-3.5 w-3.5 shrink-0" />
        {text}
      </span>
    </div>
  );
}
